import {
  AppConfig,
  BidGrade,
  BidItem,
  KeywordConfig,
  ScoreContribution,
  ScoringWeights,
} from '../types';
import { SEO_COMPANY_PROFILE } from '../data/seoCompanyProfile';

export const DEFAULT_KEYWORDS: KeywordConfig[] = [
  // 5대 주력 솔루션 및 핵심 공공사업 키워드
  { id: 'kw-1', keyword: '유지보수', weight: 25, enabled: true, category: 'core' },
  { id: 'kw-2', keyword: 'CCTV', weight: 25, enabled: true, category: 'core' },
  { id: 'kw-3', keyword: '영상감시장치', weight: 25, enabled: true, category: 'core' },
  { id: 'kw-4', keyword: '선별관제', weight: 24, enabled: true, category: 'core' },
  { id: 'kw-5', keyword: '스마트시티', weight: 22, enabled: true, category: 'core' },
  { id: 'kw-6', keyword: '관제', weight: 20, enabled: true, category: 'core' },
  { id: 'kw-7', keyword: '암호화', weight: 22, enabled: true, category: 'core' },
  { id: 'kw-8', keyword: 'KCMVP', weight: 24, enabled: true, category: 'core' },
  { id: 'kw-9', keyword: '불법주정차', weight: 22, enabled: true, category: 'core' },
  { id: 'kw-10', keyword: '무인교통', weight: 22, enabled: true, category: 'core' },
  { id: 'kw-11', keyword: '단속', weight: 20, enabled: true, category: 'core' },
  { id: 'kw-12', keyword: '계장제어', weight: 22, enabled: true, category: 'core' },
  { id: 'kw-13', keyword: '수위예측', weight: 22, enabled: true, category: 'core' },
  { id: 'kw-14', keyword: '수문', weight: 20, enabled: true, category: 'core' },
  { id: 'kw-15', keyword: '물관리', weight: 20, enabled: true, category: 'core' },
  { id: 'kw-16', keyword: '산업안전', weight: 22, enabled: true, category: 'core' },
  { id: 'kw-17', keyword: '중대재해', weight: 20, enabled: true, category: 'core' },
  { id: 'kw-18', keyword: '방범', weight: 18, enabled: true, category: 'core' },
  { id: 'kw-19', keyword: '재난', weight: 18, enabled: true, category: 'core' },
  { id: 'kw-20', keyword: '지능형', weight: 18, enabled: true, category: 'core' },
  { id: 'kw-21', keyword: '정보통신공사', weight: 20, enabled: true, category: 'core' },
  { id: 'kw-22', keyword: '전기공사', weight: 18, enabled: true, category: 'core' },
  { id: 'kw-23', keyword: '발전소', weight: 22, enabled: true, category: 'core' },
];

export const DEFAULT_EXCLUDED_KEYWORDS: string[] = [
  '소프트웨어 단순용역',
  '홈페이지 제작',
  '사무실 청소',
  '인쇄물 출판',
  '단순식자재',
  '의류구매',
];

export const DEFAULT_CONFIG: AppConfig = {
  keywords: DEFAULT_KEYWORDS,
  excludedKeywords: DEFAULT_EXCLUDED_KEYWORDS,
  agencies: [
    // 세오 핵심 수주실적 발주처 (25점)
    { id: 'ag-1', name: '지자체 (시/군/구청)', group: '기존실적', weight: 25 },
    { id: 'ag-2', name: '발전소 (한수원/남동/중부/남부/서부발전)', group: '기존실적', weight: 25 },
    { id: 'ag-3', name: '관세청 및 세관', group: '기존실적', weight: 25 },
    { id: 'ag-4', name: '항만공사 / 해양수산청 / 어촌어항공단', group: '기존실적', weight: 25 },
    { id: 'ag-5', name: '한국수자원공사', group: '기존실적', weight: 25 },
    { id: 'ag-6', name: '한국전력공사', group: '기존실적', weight: 25 },
    { id: 'ag-7', name: '인천국제공항공사', group: '기존실적', weight: 25 },
    // 전략 확장 및 국방벤처 발주처 (22점)
    { id: 'ag-8', name: '국방과학연구소 / 국방벤처 협약기관', group: '확장목표', weight: 22 },
    { id: 'ag-9', name: '육군 / 해군 / 공군 / 해병대', group: '확장목표', weight: 22 },
    { id: 'ag-10', name: '경찰청 / 도로교통공단', group: '확장목표', weight: 22 },
    { id: 'ag-11', name: '철도공사 (코레일) / 지하철', group: '확장목표', weight: 22 },
    { id: 'ag-12', name: '방위사업청', group: '확장목표', weight: 22 },
    { id: 'ag-13', name: 'ITS / 한국지능형교통체계협회', group: '확장목표', weight: 22 },
  ],
  scoringWeights: {
    fieldWeights: {
      유지보수: 25,
      구축: 22,
      설계: 12,
      기타: 6,
    },
    agencyWeights: {
      기존실적: 25,
      확장목표: 22,
      기타: 8,
    },
    amountTargetAverage: 550000000, // 5.5억원 (세오 평균 계약 규모)
    amountMaxWeight: 15,
    contractMethodWeights: {
      negotiation: 10, // 협상에 의한 계약 (기술평가 우위)
      restricted: 8, // 제한경쟁 (지역/실적제한)
      general: 4, // 일반경쟁
      other: 2, // 기타
    },
    gradeCutoffs: {
      A: 70,
      B: 40,
    },
  },
  lastCollectedAt: '2026-09-14 06:00',
  autoCollectTime: '06:00',
};

/**
 * 발주기관 텍스트에서 agencyGroup 및 발주처 적합도 판별
 */
export function determineAgencyGroup(
  agencyName: string,
  config: AppConfig
): { group: '기존실적' | '확장목표' | '기타'; matchedName: string; weight: number; clientMatchReason?: string } {
  const norm = agencyName.toLowerCase();

  // 1. 발전소 5개사 및 한전 (세오 주요 공사 및 안전시스템 실적)
  const powerPlantKeywords = ['수력원자력', '한수원', '남동발전', '중부발전', '남부발전', '서부발전', '한국전력'];
  for (const p of powerPlantKeywords) {
    if (agencyName.includes(p)) {
      return {
        group: '기존실적',
        matchedName: `발전사/한전 (${agencyName})`,
        weight: 25,
        clientMatchReason: '세오 주요 공사실적 및 발전소 안전관리 AI 개발선정품 보유처',
      };
    }
  }

  // 2. 관세청 및 전국 세관
  if (norm.includes('관세청') || norm.includes('세관')) {
    return {
      group: '기존실적',
      matchedName: `관세청/세관 (${agencyName})`,
      weight: 25,
      clientMatchReason: '평택/여수/군산/울산/광양세관 감시종합정보시스템 다년간 재구축·유지보수 실적처',
    };
  }

  // 3. 항만공사 / 해수청 / 어촌어항공단 / 해경
  if (
    norm.includes('항만') ||
    norm.includes('해양수산') ||
    norm.includes('어촌어항') ||
    norm.includes('해양경찰') ||
    norm.includes('해경')
  ) {
    return {
      group: '기존실적',
      matchedName: `항만/해양기관 (${agencyName})`,
      weight: 25,
      clientMatchReason: '울산항만공사·여수광양항만공사·해수청·어촌어항공단 국가어항 지능형영상 구축 실적처',
    };
  }

  // 4. 수자원공사 / 환경
  if (norm.includes('수자원공사') || norm.includes('k-water')) {
    return {
      group: '기존실적',
      matchedName: `한국수자원공사`,
      weight: 25,
      clientMatchReason: '스마트 물관리 계장제어시스템(bluelock, 조달우수제품) 최적 부합처',
    };
  }

  // 5. 지자체 (시청/구청/군청/도청)
  const municipalKeywords = [
    '시청', '구청', '군청', '도청', '광역시', '특별시', '자치시', '자치도', '관리사업소', '수도사업소',
    '안양', '포천', '수원', '진주', '완도', '제주', '성북', '마포', '청주', '이천', '하남', '구리', '양주', '광주',
  ];
  if (municipalKeywords.some((kw) => agencyName.includes(kw))) {
    return {
      group: '기존실적',
      matchedName: `지자체 (${agencyName})`,
      weight: 25,
      clientMatchReason: '전국 50개 이상 지자체 CCTV 통합관제센터 및 선별관제·불법주정차 단속 구축 실적처',
    };
  }

  // 6. 국방 / 군부대 / 방위사업청 (세오 국방벤처 협약기업)
  if (
    norm.includes('국방') ||
    norm.includes('육군') ||
    norm.includes('해군') ||
    norm.includes('공군') ||
    norm.includes('해병대') ||
    norm.includes('군단') ||
    norm.includes('사령부') ||
    norm.includes('방위사업청') ||
    norm.includes('국군')
  ) {
    return {
      group: '확장목표',
      matchedName: `국방/군사기관 (${agencyName})`,
      weight: 22,
      clientMatchReason: '세오 국방벤처 협약기업(제광주25-0021호) 및 JSA/항공작전사 경계시스템 실적 보유',
    };
  }

  // 7. 경찰청 / 도로교통공단 / 철도 / 공항 / ITS
  if (
    norm.includes('경찰') ||
    norm.includes('도로교통공단') ||
    norm.includes('교통안전공단') ||
    norm.includes('철도') ||
    norm.includes('코레일') ||
    norm.includes('공항공사') ||
    norm.includes('공항') ||
    norm.includes('its')
  ) {
    return {
      group: '확장목표',
      matchedName: `교통/공공안전기관 (${agencyName})`,
      weight: 22,
      clientMatchReason: '세오 60GHz 레이더 다차선 무인단속시스템(조달우수·혁신제품) 및 인천공항 인증 연계처',
    };
  }

  return {
    group: '기타',
    matchedName: '일반 공공기관',
    weight: config.scoringWeights.agencyWeights.기타 || 8,
  };
}

/**
 * 세오 5대 주력 솔루션 매칭 판별
 */
export function determineSolutionMatch(
  title: string,
  agency: string
): { solution: string; badge: string; reasons: string[] } {
  const text = `${title} ${agency}`.toLowerCase();
  const reasons: string[] = [];

  // 1. CUBE HIDE 실시간 통신구간 암호화
  if (text.includes('암호화') || text.includes('kcmvp') || text.includes('해킹') || text.includes('영상보안')) {
    reasons.push('CUBE HIDE 실시간 통신구간 암호화 영상감시장치(NEP 신제품·조달우수제품) 최적 부합');
    reasons.push('KCMVP 검증 암호모듈 및 인천공항 기술인증 규격 보유');
    return {
      solution: 'CUBE HIDE 암호화',
      badge: '🔒 CUBE HIDE 암호화',
      reasons,
    };
  }

  // 2. 다차선 번호인식 무인교통단속시스템
  if (
    text.includes('불법주정차') ||
    text.includes('무인단속') ||
    text.includes('단속') ||
    text.includes('교통감시') ||
    text.includes('레이더') ||
    text.includes('번호인식') ||
    text.includes('어린이보호') ||
    text.includes('신호과속')
  ) {
    reasons.push('다차선 번호인식 통합형 무인교통단속시스템(조달우수제품 제2021204호·혁신제품) 직접 적용');
    reasons.push('60GHz 레이더 기반 감지거리 80m·100개 객체 동시추적 특허 및 청주시/지자체 납품 실적 보유');
    return {
      solution: '60GHz 레이더 무인단속',
      badge: '🚦 60GHz 무인단속',
      reasons,
    };
  }

  // 3. 스마트 물 관리 계장제어시스템 (bluelock)
  if (
    text.includes('계장제어') ||
    text.includes('물관리') ||
    text.includes('수위') ||
    text.includes('수문') ||
    text.includes('rtu') ||
    text.includes('하천') ||
    text.includes('배관') ||
    text.includes('누수')
  ) {
    reasons.push('스마트 물관리 계장제어시스템 bluelock(조달우수제품 제2023178호·성능인증) 최적 부합');
    reasons.push('신경망 수위예측 알고리즘 및 벤처나라 27건 지정 실적 연계');
    return {
      solution: 'bluelock 스마트 물관리',
      badge: '💧 bluelock 계장제어',
      reasons,
    };
  }

  // 4. 산업안전 AI / 발전소 위험지역 안전관리
  if (
    text.includes('산업안전') ||
    text.includes('중대재해') ||
    text.includes('안전모') ||
    text.includes('작업자') ||
    text.includes('위험지역') ||
    text.includes('안전관리') ||
    text.includes('발전소')
  ) {
    reasons.push('위험지역 인공지능 영상분석 시스템(혁신제품·발전소 안전관리용 개발선정품) 직접 적용');
    reasons.push('안전장구 착용/2인1조/이상행동 딥러닝 감지 및 5대 발전사 실적 연계');
    return {
      solution: '산업안전 AI',
      badge: '🦺 산업안전 AI',
      reasons,
    };
  }

  // 5. 방사형 레이어 GCN AI 영상감시장치 (주력 선별관제/CCTV)
  if (
    text.includes('cctv') ||
    text.includes('영상감시') ||
    text.includes('선별관제') ||
    text.includes('지능형') ||
    text.includes('방범') ||
    text.includes('재난') ||
    text.includes('관제') ||
    text.includes('스마트시티') ||
    text.includes('도시안전') ||
    text.includes('카메라')
  ) {
    reasons.push('방사형 레이어 GCN AI 행동/상태인지 시스템(조달우수제품 제2025030호·NEP 신제품) 직결');
    reasons.push('품질보증조달물품 B+ 등급 및 전국 50여개 지자체 통합관제센터 구축 레퍼런스 보유');
    return {
      solution: 'GCN AI 영상감시',
      badge: '🎯 GCN AI 영상감시',
      reasons,
    };
  }

  // 6. 정보통신/전기공사업 면허 직접 연계
  if (text.includes('정보통신') || text.includes('통신공사') || text.includes('전기공사') || text.includes('전산')) {
    reasons.push('정보통신공사업(제140370호) 및 전기공사업(제경기-05361호) 면허 완벽 적격');
    reasons.push('소프트웨어사업자(B26-325923) 및 엔지니어링 면허 연계 가능');
    return {
      solution: '정보통신·전기공사',
      badge: '⚡ 통신·전기공사',
      reasons,
    };
  }

  return {
    solution: '세오 융합보안기술',
    badge: '🏢 세오 맞춤 공고',
    reasons: ['세오 22년 융합보안기술 및 공공 입찰 참여 역량 부합'],
  };
}

/**
 * 세오 거점 지역 (안양 본사/공장, 포천 공장, 광주 공장) 매칭 판별
 */
export function determineRegionFit(
  agency: string,
  title: string
): { regionText: string; points: number; reason: string } {
  const text = `${agency} ${title}`;

  // 1. 최우수 거점: 경기도 (안양 본사/공장 1·2, 포천 공장)
  if (
    text.includes('안양') ||
    text.includes('포천') ||
    text.includes('경기') ||
    text.includes('수원') ||
    text.includes('이천') ||
    text.includes('하남') ||
    text.includes('구리') ||
    text.includes('양주') ||
    text.includes('양평') ||
    text.includes('평택') ||
    text.includes('가평')
  ) {
    return {
      regionText: '경기 (안양본사·포천공장 관할)',
      points: 15,
      reason: '세오 본사/안양공장/포천공장 소재지로 30분~1시간 내 긴급출동 및 밀착 유지보수 최우선 우위',
    };
  }

  // 2. 최우수 거점: 광주광역시 (광주공장 및 부연구소)
  if (text.includes('광주') || text.includes('북구') || text.includes('첨단')) {
    return {
      regionText: '광주 (광주공장·연구소 관할)',
      points: 15,
      reason: '광주 첨단산단 공장 및 부연구소 인접으로 지역제한 입찰 적격 및 최우수 기술지원 거점',
    };
  }

  // 3. 우수 거점: 수도권 (서울, 인천)
  if (text.includes('서울') || text.includes('인천')) {
    return {
      regionText: '수도권 (안양본사 인접)',
      points: 13,
      reason: '안양 본사 직속 기술지원팀의 신속한 현장 대응 및 다수 수주 레퍼런스(성북/마포/인천공항) 보유',
    };
  }

  // 4. 우수 거점: 호남권 (전남, 전북)
  if (text.includes('전남') || text.includes('전북') || text.includes('완도') || text.includes('여수') || text.includes('목포') || text.includes('군산')) {
    return {
      regionText: '호남권 (광주공장 관할)',
      points: 13,
      reason: '광주공장 거점 기반 전남(완도·여수) 및 전북(군산세관) 다수 구축·유지관리 실적 보유',
    };
  }

  // 5. 전국 공통 공공기관
  return {
    regionText: '전국 공공기관',
    points: 8,
    reason: '전국 시·도 및 공공기관 대상 22년 조달 납품 네트워크 가동',
  };
}

/**
 * 공고명/과업 내용에서 사업분야(유지보수/구축/설계) 판별
 */
export function determineField(title: string): '유지보수' | '구축' | '설계' | '기타' {
  if (title.includes('유지보수') || title.includes('유지관리') || title.includes('운영관리') || title.includes('통합유지보수')) {
    return '유지보수';
  }
  if (title.includes('구축') || title.includes('설치') || title.includes('확충') || title.includes('개선') || title.includes('교체') || title.includes('도입') || title.includes('구매') || title.includes('제작')) {
    return '구축';
  }
  if (title.includes('설계') || title.includes('기본계획') || title.includes('타당성') || title.includes('컨설팅') || title.includes('감리')) {
    return '설계';
  }
  return '기타';
}

/**
 * 금액 적합도 점수 계산 (5.5억원 평균 기준)
 */
export function calculateAmountScore(price: number, weights: ScoringWeights): { points: number; reason: string } {
  const maxPts = weights.amountMaxWeight;
  if (!price || price <= 0) {
    return { points: 5, reason: '추정가격 미기재 (기본점 부여)' };
  }

  // 3억 ~ 10억 사이가 세오의 최적 타깃 (평균 5.5억)
  if (price >= 300000000 && price <= 1000000000) {
    return { points: maxPts, reason: `세오 최적 계약규모 부합 (${(price / 100000000).toFixed(1)}억원, 세오 평균 5.5억 최적 구간)` };
  } else if (price >= 150000000 && price <= 2000000000) {
    return { points: Math.round(maxPts * 0.8), reason: `적정 계약규모 구간 (${(price / 100000000).toFixed(1)}억원)` };
  } else if (price >= 50000000 && price <= 4000000000) {
    return { points: Math.round(maxPts * 0.53), reason: `참여 가능 규모 (${(price / 100000000).toFixed(1)}억원)` };
  } else {
    return { points: Math.round(maxPts * 0.27), reason: `소규모 또는 초대형 사업 (${(price / 100000000).toFixed(1)}억원)` };
  }
}

/**
 * 계약방법 점수 계산
 */
export function calculateContractMethodScore(method: string, weights: ScoringWeights): { points: number; reason: string } {
  if (method.includes('협상')) {
    return { points: weights.contractMethodWeights.negotiation, reason: '협상에 의한 계약 (기술평가 배점 높아 세오 기술력·특허 30건 우위)' };
  }
  if (method.includes('제한')) {
    return { points: weights.contractMethodWeights.restricted, reason: '제한경쟁 (지역 거점 및 유사실적 보유로 경쟁 우위)' };
  }
  if (method.includes('일반')) {
    return { points: weights.contractMethodWeights.general, reason: '일반경쟁 (가격 및 기술 종합평가)' };
  }
  return { points: weights.contractMethodWeights.other, reason: method || '기타 계약방식' };
}

/**
 * 개별 공고에 대해 세오 맞춤 수주 가능성 점수(0~100) 및 세부 기여도(Breakdown) 계산
 */
export function calculateBidScore(
  item: Omit<BidItem, 'score' | 'grade' | 'scoreBreakdown'>,
  config: AppConfig
): {
  score: number;
  grade: BidGrade;
  scoreBreakdown: ScoreContribution[];
  seoSolutionMatch: string;
  seoFitBadge: string;
  seoFitReasons: string[];
  targetRegionMatch: string;
} {
  const breakdown: ScoreContribution[] = [];
  const textToScan = `${item.title} ${item.agency}`.toLowerCase();

  // 1. 세오 5대 솔루션 및 키워드 매칭 (최대 30점)
  const solutionMatch = determineSolutionMatch(item.title, item.agency);
  const activeKeywords = config.keywords.filter((k) => k.enabled);
  const matchedKw = activeKeywords.filter((k) => textToScan.includes(k.keyword.toLowerCase()));

  let keywordPoints = 0;
  matchedKw.forEach((k) => {
    keywordPoints += k.weight;
  });

  // 솔루션 직접 부합 시 기본 보너스
  if (solutionMatch.solution !== '세오 융합보안기술') {
    keywordPoints += 15;
  }

  const cappedKeywordPoints = Math.min(30, Math.max(8, Math.round((keywordPoints / 70) * 30)));
  breakdown.push({
    category: '세오 솔루션·기술 적합도',
    item: solutionMatch.solution,
    points: cappedKeywordPoints,
    maxPoints: 30,
    reason: `${solutionMatch.badge} 연계 (${matchedKw.length}개 핵심 키워드 매칭: ${matchedKw.slice(0, 3).map(k => k.keyword).join(', ')})`,
  });

  // 2. 발주기관 적합도 (세오 고객사 DB 기반, 최대 25점)
  const agencyInfo = determineAgencyGroup(item.agency, config);
  breakdown.push({
    category: '발주처 수주 적합도',
    item: agencyInfo.matchedName,
    points: agencyInfo.weight,
    maxPoints: 25,
    reason: agencyInfo.clientMatchReason || `${agencyInfo.group} 발주처 가중치 (+${agencyInfo.weight}점)`,
  });

  // 3. 거점 지역 우대 (최대 15점: 안양본사, 포천공장, 광주공장)
  const regionInfo = determineRegionFit(item.agency, item.title);
  breakdown.push({
    category: '거점 지역 대응성',
    item: regionInfo.regionText,
    points: regionInfo.points,
    maxPoints: 15,
    reason: regionInfo.reason,
  });

  // 4. 사업분야 & 면허 적합도 (유지보수 18점, 구축 16점, 정보통신/전기공사 14점 등)
  const field = item.field || determineField(item.title);
  let fieldPoints = 10;
  let fieldReason = '일반 사업분야';
  if (field === '유지보수') {
    fieldPoints = 18;
    fieldReason = '세오 최다 수주 분야 (22년간 50개 이상 관제센터·세관 통합유지보수 노하우)';
  } else if (field === '구축') {
    fieldPoints = 16;
    fieldReason = '조달우수제품(3종) 및 신제품(NEP) 물품구매·설치 직결 분야';
  } else if (field === '설계') {
    fieldPoints = 12;
    fieldReason = '엔지니어링사업자(제E-6-1128호) 면허 기반 사업';
  }
  breakdown.push({
    category: '사업분야 및 면허 적합도',
    item: field,
    points: fieldPoints,
    maxPoints: 18,
    reason: fieldReason,
  });

  // 5. 계약방법 & 규모 적합도 (최대 12점)
  const contractScore = calculateContractMethodScore(item.contractMethod, config.scoringWeights);
  const amountScore = calculateAmountScore(item.estimatedPrice, config.scoringWeights);
  const combinedContractPoints = Math.min(12, Math.round(contractScore.points * 0.7 + (amountScore.points / 15) * 5));
  breakdown.push({
    category: '계약방식 및 예산규모',
    item: `${item.contractMethod || '일반'} / ${item.estimatedPrice ? (item.estimatedPrice / 100000000).toFixed(1) + '억' : '미기재'}`,
    points: combinedContractPoints,
    maxPoints: 12,
    reason: `${contractScore.reason} | ${amountScore.reason}`,
  });

  // 총점 합산 (0 ~ 100)
  const rawTotal = breakdown.reduce((acc, curr) => acc + curr.points, 0);
  const totalScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

  // 등급 결정
  let grade: BidGrade = 'C';
  if (totalScore >= config.scoringWeights.gradeCutoffs.A) {
    grade = 'A';
  } else if (totalScore >= config.scoringWeights.gradeCutoffs.B) {
    grade = 'B';
  }

  // 종합 맞춤 추천 사유 조립
  const reasons: string[] = [
    ...solutionMatch.reasons,
    agencyInfo.clientMatchReason || `${agencyInfo.matchedName} 발주처 적합`,
    regionInfo.reason,
  ];

  return {
    score: totalScore,
    grade,
    scoreBreakdown: breakdown,
    seoSolutionMatch: solutionMatch.solution,
    seoFitBadge: solutionMatch.badge,
    seoFitReasons: reasons,
    targetRegionMatch: regionInfo.regionText,
  };
}

/**
 * 마감일까지의 D-Day 계산
 */
export function computeDDay(deadlineStr: string): number {
  if (!deadlineStr) return 999;
  const isoStr = deadlineStr.includes('T') ? deadlineStr : deadlineStr.replace(' ', 'T');
  let deadline = new Date(isoStr);
  if (isNaN(deadline.getTime())) {
    deadline = new Date(deadlineStr);
  }
  if (isNaN(deadline.getTime())) {
    return 14;
  }
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return isNaN(days) ? 14 : days;
}
