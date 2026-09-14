import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { AppConfig, BidItem, DashboardSummary, FeedbackStatus } from './src/types';
import {
  calculateBidScore,
  computeDDay,
  DEFAULT_CONFIG,
  determineAgencyGroup,
  determineField,
} from './src/utils/scoring';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Memory Store for bids and configuration (Only real-time G2B OpenAPI bids)
let appConfig: AppConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
let storedBids: BidItem[] = [];

// Helper: Calculate dashboard summary stats
function getSummary(): DashboardSummary {
  const todayNewCount = storedBids.filter(b => b.isNew).length;
  const gradeACount = storedBids.filter(b => b.grade === 'A').length;
  const urgentCount = storedBids.filter(b => b.dDay >= 0 && b.dDay <= 3).length;
  const totalCount = storedBids.length;
  const suitableCount = storedBids.filter(b => b.feedback === 'SUITABLE').length;

  return {
    todayNewCount,
    gradeACount,
    urgentCount,
    totalCount,
    suitableCount,
    lastCollectedAt: appConfig.lastCollectedAt,
  };
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Get dashboard summary
app.get('/api/summary', (req, res) => {
  res.json(getSummary());
});

// 3. Get all bids (with optional filtering)
app.get('/api/bids', (req, res) => {
  const { grade, keyword, field, agencyGroup, bookmarkedOnly, urgentOnly } = req.query;

  let results = [...storedBids];

  if (grade && grade !== 'ALL') {
    results = results.filter(b => b.grade === grade);
  }
  if (field && field !== 'ALL') {
    results = results.filter(b => b.field === field);
  }
  if (agencyGroup && agencyGroup !== 'ALL') {
    results = results.filter(b => b.agencyGroup === agencyGroup);
  }
  if (bookmarkedOnly === 'true') {
    results = results.filter(b => b.isBookmarked);
  }
  if (urgentOnly === 'true') {
    results = results.filter(b => b.dDay >= 0 && b.dDay <= 3);
  }
  if (keyword && typeof keyword === 'string' && keyword.trim()) {
    const q = keyword.trim().toLowerCase();
    results = results.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.agency.toLowerCase().includes(q) ||
      b.bidNo.includes(q) ||
      b.matchingKeywords.some(k => k.toLowerCase().includes(q))
    );
  }

  // Default sorting: score descending
  results.sort((a, b) => b.score - a.score);

  res.json({
    total: results.length,
    bids: results,
  });
});

// 4. Mark bid as viewed
app.post('/api/bids/:id/view', (req, res) => {
  const { id } = req.params;
  const item = storedBids.find(b => b.id === id);
  if (item) {
    item.isViewed = true;
    res.json({ success: true, item });
  } else {
    res.status(404).json({ error: 'Bid not found' });
  }
});

// 5. Toggle bookmark
app.post('/api/bids/:id/bookmark', (req, res) => {
  const { id } = req.params;
  const item = storedBids.find(b => b.id === id);
  if (item) {
    item.isBookmarked = !item.isBookmarked;
    res.json({ success: true, isBookmarked: item.isBookmarked, item });
  } else {
    res.status(404).json({ error: 'Bid not found' });
  }
});

// 6. Submit feedback (적합, 부적합, 보류 + 사유 태그 + 메모)
app.post('/api/bids/:id/feedback', (req, res) => {
  const { id } = req.params;
  const { feedback, reason, note } = req.body as {
    feedback: FeedbackStatus;
    reason?: string[];
    note?: string;
  };

  const item = storedBids.find(b => b.id === id);
  if (item) {
    item.feedback = feedback;
    item.feedbackReason = reason || [];
    item.feedbackNote = note || '';
    item.feedbackUpdatedAt = new Date().toISOString();
    res.json({ success: true, item });
  } else {
    res.status(404).json({ error: 'Bid not found' });
  }
});

// 7. Get system configuration (keywords, weights, agencies)
app.get('/api/config', (req, res) => {
  res.json(appConfig);
});

// 8. Update system configuration & recalculate all scores immediately
app.post('/api/config', (req, res) => {
  const newConfig = req.body as Partial<AppConfig>;
  appConfig = {
    ...appConfig,
    ...newConfig,
  };

  // Recalculate scores for all stored bids
  storedBids = storedBids.map(bid => {
    const calculated = calculateBidScore(bid, appConfig);
    return {
      ...bid,
      score: calculated.score,
      grade: calculated.grade,
      scoreBreakdown: calculated.scoreBreakdown,
      seoSolutionMatch: calculated.seoSolutionMatch,
      seoFitBadge: calculated.seoFitBadge,
      seoFitReasons: calculated.seoFitReasons,
      targetRegionMatch: calculated.targetRegionMatch,
    };
  });

  res.json({
    success: true,
    message: '설정이 저장되었으며 전체 공고 점수가 재계산되었습니다.',
    config: appConfig,
    summary: getSummary(),
  });
});

// Helper function to query real G2B OpenAPI and convert to BidItem
async function fetchAndMergeLiveG2BBids(): Promise<{ count: number; success: boolean; error?: string }> {
  const rawApiKey = process.env.NARA_API || process.env.NARA_AP_KEY || '';
  if (!rawApiKey) {
    return { count: 0, success: false, error: 'API key not configured' };
  }

  const serviceKey = decodeURIComponent(rawApiKey);
  const activeKeywords = appConfig.keywords.filter(k => k.enabled).map(k => k.keyword);
  const collectedMap = new Map<string, any>();

  // 1. Search for key terms in 용역(Servc) covering (주)세오 5대 솔루션 & 면허 분야
  const servcKeywords = [
    'CCTV', '영상감시장치', '유지보수', '선별관제', '스마트시티', '불법주정차',
    '무인교통', '계장제어', '수위', '물관리', '산업안전', '중대재해', '보안',
    '관제', '방범', '정보통신', '전기공사', '발전소'
  ];

  for (const kw of servcKeywords) {
    try {
      const url = `http://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServcPPSSrch?ServiceKey=${encodeURIComponent(
        serviceKey
      )}&numOfRows=15&pageNo=1&inqryDiv=1&type=json&bidNtceNm=${encodeURIComponent(kw)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data: any = await res.json();
        const items = data.response?.body?.items || [];
        for (const it of items) {
          if (it.bidNtceNo && !collectedMap.has(it.bidNtceNo)) {
            collectedMap.set(it.bidNtceNo, it);
          }
        }
      }
    } catch (e) {
      // Continue to next keyword if one fails or times out
    }
  }

  // 2. Also search for SEO products in 물품(Thng)
  const thngKeywords = ['영상감시장치', 'CCTV', '단속장비', '계장제어장치', '카메라', '모니터링'];
  for (const kw of thngKeywords) {
    try {
      const urlThng = `http://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoThngPPSSrch?ServiceKey=${encodeURIComponent(
        serviceKey
      )}&numOfRows=15&pageNo=1&inqryDiv=1&type=json&bidNtceNm=${encodeURIComponent(kw)}`;
      const resThng = await fetch(urlThng, { signal: AbortSignal.timeout(4000) });
      if (resThng.ok) {
        const dataThng: any = await resThng.json();
        const itemsThng = dataThng.response?.body?.items || [];
        for (const it of itemsThng) {
          if (it.bidNtceNo && !collectedMap.has(it.bidNtceNo)) {
            collectedMap.set(it.bidNtceNo, it);
          }
        }
      }
    } catch (e) {}
  }

  // 3. Search for recent general announcements (latest 30)
  try {
    const urlLatest = `http://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServcPPSSrch?ServiceKey=${encodeURIComponent(
      serviceKey
    )}&numOfRows=30&pageNo=1&inqryDiv=1&type=json`;
    const resLatest = await fetch(urlLatest, { signal: AbortSignal.timeout(4000) });
    if (resLatest.ok) {
      const dataLatest: any = await resLatest.json();
      const latestItems = dataLatest.response?.body?.items || [];
      for (const it of latestItems) {
        if (it.bidNtceNo && !collectedMap.has(it.bidNtceNo)) {
          collectedMap.set(it.bidNtceNo, it);
        }
      }
    }
  } catch (e) {}

  let newItemsCount = 0;

  for (const it of collectedMap.values()) {
    const bidNo = String(it.bidNtceNo);
    const bidSeq = String(it.bidNtceOrd || '000');
    const id = `${bidNo}-${bidSeq}`;

    // Skip if already in storedBids
    if (storedBids.some(b => b.id === id)) {
      continue;
    }

    const title = it.bidNtceNm || '조달청 입찰공고';
    const agency = it.dminsttNm || it.ntceInsttNm || '공공기관';
    const estimatedPrice = Number(it.presmptPrce || it.asignBdgtAmt || 350000000);
    const contractMethod = it.cntrctCnclsMthdNm || it.sucsfbidMthdNm || '협상에 의한 계약';
    const publishDate = it.bidNtceDt ? it.bidNtceDt.slice(0, 10) : new Date().toISOString().slice(0, 10);

    // Format deadline date
    let deadlineDate = '2026-09-30 18:00';
    const rawDeadline = it.bidClseDt || it.opengDt;
    if (rawDeadline) {
      if (rawDeadline.includes('-')) {
        deadlineDate = rawDeadline.slice(0, 16);
      } else if (rawDeadline.length >= 12) {
        deadlineDate = `${rawDeadline.slice(0, 4)}-${rawDeadline.slice(4, 6)}-${rawDeadline.slice(6, 8)} ${rawDeadline.slice(8, 10)}:${rawDeadline.slice(10, 12)}`;
      }
    }

    // Determine field and agency group with refined SEO logic
    const field = determineField(title);
    const agencyInfo = determineAgencyGroup(agency, appConfig);
    const agencyGroup = agencyInfo.group;

    // Matching keywords
    const matchedKw = activeKeywords.filter(k => `${title} ${agency}`.includes(k));
    const dDay = computeDDay(deadlineDate);

    const partial = {
      id,
      bidNo,
      bidSeq,
      title,
      agency,
      agencyGroup,
      field,
      estimatedPrice,
      contractMethod,
      publishDate,
      deadlineDate,
      dDay,
      matchingKeywords: matchedKw.length > 0 ? matchedKw : ['CCTV'],
      g2bUrl:
        it.bidNtceDtlUrl ||
        it.bidNtceUrl ||
        `https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=${bidNo}&bidPbancOrd=${bidSeq}`,
      isNew: true,
      isViewed: false,
      isBookmarked: false,
      feedback: 'NONE' as const,
      dataSource: 'G2B_LIVE' as const,
    };

    const scored = calculateBidScore(partial, appConfig);
    storedBids.unshift({
      ...partial,
      score: scored.score,
      grade: scored.grade,
      scoreBreakdown: scored.scoreBreakdown,
      seoSolutionMatch: scored.seoSolutionMatch,
      seoFitBadge: scored.seoFitBadge,
      seoFitReasons: scored.seoFitReasons,
      targetRegionMatch: scored.targetRegionMatch,
    });

    newItemsCount++;
  }

  // Update lastCollectedAt
  const now = new Date();
  appConfig.lastCollectedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return { count: newItemsCount, success: true };
}

// Initial fetch on server boot
fetchAndMergeLiveG2BBids()
  .then(res => console.log(`[G2B OpenAPI] Initial boot fetch completed: ${res.count} new real bids added.`))
  .catch(err => console.warn('[G2B OpenAPI] Initial fetch error:', err.message));

// 9. Fetch bids from NARA OpenAPI with batch keyword search (PRD 5-1 requirement)
app.post('/api/bids/fetch', async (req, res) => {
  const startTime = Date.now();
  const fetchResult = await fetchAndMergeLiveG2BBids();

  // Make sure all bids are recalculated with current config
  storedBids = storedBids.map(bid => {
    const scored = calculateBidScore(bid, appConfig);
    return {
      ...bid,
      score: scored.score,
      grade: scored.grade,
      scoreBreakdown: scored.scoreBreakdown,
      seoSolutionMatch: scored.seoSolutionMatch,
      seoFitBadge: scored.seoFitBadge,
      seoFitReasons: scored.seoFitReasons,
      targetRegionMatch: scored.targetRegionMatch,
      dDay: computeDDay(bid.deadlineDate),
    };
  });

  const durationMs = Date.now() - startTime;
  const activeKeywords = appConfig.keywords.filter(k => k.enabled).map(k => k.keyword);

  res.json({
    success: true,
    message: `나라장터 실시간 OpenAPI 조회 완료 (${fetchResult.count}건의 신규 공고 수집)`,
    collectedKeywords: activeKeywords,
    keywordCount: activeKeywords.length,
    totalBids: storedBids.length,
    newCount: storedBids.filter(b => b.isNew).length,
    gradeACount: storedBids.filter(b => b.grade === 'A').length,
    urgentCount: storedBids.filter(b => b.dDay >= 0 && b.dDay <= 3).length,
    durationMs,
    lastCollectedAt: appConfig.lastCollectedAt,
    apiStatus: fetchResult.success ? 'OpenAPI Live Success' : 'OpenAPI Error',
    apiErrorMessage: fetchResult.error,
  });
});

// -------------------------------------------------------------
// Vite Server / Static Handling
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
