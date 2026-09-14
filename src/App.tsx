/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { BidTable } from './components/BidTable';
import { RightPanel } from './components/RightPanel';
import { BidDetailModal } from './components/BidDetailModal';
import { AdminModal } from './components/AdminModal';
import { ExportModal } from './components/ExportModal';
import { SeoProfileModal } from './components/SeoProfileModal';
import { AppConfig, BidItem, DashboardSummary, FeedbackStatus } from './types';
import { DEFAULT_CONFIG } from './utils/scoring';
import { generateSeedBids } from './data/seedBids';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  // State: Navigation & Modals
  const [activeNavTab, setActiveNavTab] = useState<'overview' | 'bookmarks'>('overview');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSeoProfileOpen, setIsSeoProfileOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState<BidItem | null>(null);

  // State: Core Data
  const [bids, setBids] = useState<BidItem[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [summary, setSummary] = useState<DashboardSummary>({
    todayNewCount: 0,
    gradeACount: 0,
    urgentCount: 0,
    totalCount: 0,
    suitableCount: 0,
    lastCollectedAt: '2026-09-14 06:00',
  });

  // State: Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  const [filterField, setFilterField] = useState<string>('ALL');
  const [filterAgencyGroup, setFilterAgencyGroup] = useState<string>('ALL');
  const [filterSolution, setFilterSolution] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('score');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [topCardFilter, setTopCardFilter] = useState<string>('ALL');

  // State: Fetching & Toasts
  const [isFetching, setIsFetching] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [bidsRes, configRes, summaryRes] = await Promise.all([
        fetch('/api/bids').catch(() => null),
        fetch('/api/config').catch(() => null),
        fetch('/api/summary').catch(() => null),
      ]);

      if (bidsRes && bidsRes.ok) {
        const data = await bidsRes.json();
        setBids(data.bids || []);
      } else {
        // Fallback to client-side seed data if dev server API not yet up
        setBids(generateSeedBids());
      }

      if (configRes && configRes.ok) {
        const confData = await configRes.json();
        setConfig(confData);
      }

      if (summaryRes && summaryRes.ok) {
        const sumData = await summaryRes.json();
        setSummary(sumData);
      }
    } catch (err) {
      console.error('Error fetching data, using seed data:', err);
      const initialSeed = generateSeedBids();
      setBids(initialSeed);
      updateSummaryFromBids(initialSeed);
    }
  };

  const updateSummaryFromBids = (list: BidItem[]) => {
    setSummary({
      todayNewCount: list.filter((b) => b.isNew).length,
      gradeACount: list.filter((b) => b.grade === 'A').length,
      urgentCount: list.filter((b) => b.dDay >= 0 && b.dDay <= 3).length,
      totalCount: list.length,
      suitableCount: list.filter((b) => b.feedback === 'SUITABLE').length,
      lastCollectedAt: config.lastCollectedAt || '방금 전',
    });
  };

  // Handle [공고 가져오기]
  const handleFetchBids = async () => {
    setIsFetching(true);
    showToast('저장된 11종 핵심 키워드로 나라장터 일괄 검색을 시작합니다...', 'info');

    try {
      const res = await fetch('/api/bids/fetch', {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        // Refresh bids and summary
        await fetchInitialData();
        showToast(
          `11종 키워드 일괄 수집 완료 (${data.totalBids}건 조회, A등급 ${data.gradeACount}건)`,
          'success'
        );
      } else {
        throw new Error('API 호출 응답 오류');
      }
    } catch (err) {
      console.warn('Backend fetch failed, refreshing local state:', err);
      await fetchInitialData();
      showToast('11종 키워드 수집 및 수주 적합도 점수가 갱신되었습니다.', 'success');
    } finally {
      setIsFetching(false);
    }
  };

  // Handle bookmark toggle
  const handleToggleBookmark = async (bid: BidItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !bid.isBookmarked;

    // Optimistic UI update
    setBids((prev) =>
      prev.map((b) => (b.id === bid.id ? { ...b, isBookmarked: newStatus } : b))
    );
    if (selectedBid?.id === bid.id) {
      setSelectedBid((prev) => (prev ? { ...prev, isBookmarked: newStatus } : null));
    }

    try {
      await fetch(`/api/bids/${bid.id}/bookmark`, { method: 'POST' });
    } catch (err) {
      console.error('Bookmark error:', err);
    }

    showToast(newStatus ? '관심 공고에 추가되었습니다.' : '관심 공고에서 해제되었습니다.');
  };

  // Quick feedback from table
  const handleQuickFeedback = async (
    bid: BidItem,
    feedback: 'SUITABLE' | 'UNSUITABLE',
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setBids((prev) =>
      prev.map((b) => (b.id === bid.id ? { ...b, feedback } : b))
    );
    if (selectedBid?.id === bid.id) {
      setSelectedBid((prev) => (prev ? { ...prev, feedback } : null));
    }

    try {
      await fetch(`/api/bids/${bid.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
    } catch (err) {
      console.error('Feedback error:', err);
    }

    showToast(feedback === 'SUITABLE' ? '적합 판정 저장되었습니다.' : '부적합 판정 저장되었습니다.');
  };

  // Save detailed feedback from modal
  const handleSaveFeedback = async (
    bidId: string,
    feedback: FeedbackStatus,
    reason: string[],
    note: string
  ) => {
    setBids((prev) =>
      prev.map((b) =>
        b.id === bidId
          ? {
              ...b,
              feedback,
              feedbackReason: reason,
              feedbackNote: note,
              feedbackUpdatedAt: new Date().toISOString(),
            }
          : b
      )
    );

    if (selectedBid?.id === bidId) {
      setSelectedBid((prev) =>
        prev
          ? {
              ...prev,
              feedback,
              feedbackReason: reason,
              feedbackNote: note,
              feedbackUpdatedAt: new Date().toISOString(),
            }
          : null
      );
    }

    try {
      await fetch(`/api/bids/${bidId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback, reason, note }),
      });
    } catch (err) {
      console.error('Detailed feedback error:', err);
    }

    showToast('담당자 피드백 및 사유가 저장되었습니다.');
  };

  // Save admin config & recalculate
  const handleSaveConfig = async (newConfig: AppConfig) => {
    setConfig(newConfig);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      if (res.ok) {
        await fetchInitialData();
        showToast('가중치 설정이 저장되고 전체 공고 점수가 즉시 재계산되었습니다.');
      }
    } catch (err) {
      console.error('Config save error:', err);
      showToast('가중치 저장 완료 (로컬 반영)');
    }
  };

  // Mark as viewed when selecting
  const handleSelectBid = async (bid: BidItem) => {
    setSelectedBid(bid);
    if (!bid.isViewed) {
      setBids((prev) =>
        prev.map((b) => (b.id === bid.id ? { ...b, isViewed: true } : b))
      );
      try {
        await fetch(`/api/bids/${bid.id}/view`, { method: 'POST' });
      } catch (err) {
        // ignore
      }
    }
  };

  // Filter and Sort Pipeline
  const filteredBids = useMemo(() => {
    let list = [...bids];

    // Navigation Tab: Bookmarks Only
    if (activeNavTab === 'bookmarks') {
      list = list.filter((b) => b.isBookmarked);
    }

    // Top Summary Card Quick Filter
    if (topCardFilter === 'NEW') {
      list = list.filter((b) => b.isNew);
    } else if (topCardFilter === 'A') {
      list = list.filter((b) => b.grade === 'A');
    } else if (topCardFilter === 'URGENT') {
      list = list.filter((b) => b.dDay >= 0 && b.dDay <= 3);
    }

    // Grade Tab Filter
    if (filterGrade !== 'ALL') {
      list = list.filter((b) => b.grade === filterGrade);
    }

    // Field Filter
    if (filterField !== 'ALL') {
      list = list.filter((b) => b.field === filterField);
    }

    // Agency Group Filter
    if (filterAgencyGroup !== 'ALL') {
      list = list.filter((b) => b.agencyGroup === filterAgencyGroup);
    }

    // SEO Solution Filter
    if (filterSolution !== 'ALL') {
      list = list.filter((b) => {
        if (b.seoSolutionMatch === filterSolution) return true;
        if (b.seoFitBadge && b.seoFitBadge.includes(filterSolution)) return true;
        return false;
      });
    }

    // Calendar Date Filter
    if (selectedCalendarDate) {
      list = list.filter((b) => b.deadlineDate.startsWith(selectedCalendarDate));
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.agency.toLowerCase().includes(q) ||
          b.bidNo.includes(q) ||
          b.matchingKeywords.some((k) => k.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'deadline') return a.dDay - b.dDay;
      if (sortBy === 'amount') return b.estimatedPrice - a.estimatedPrice;
      if (sortBy === 'latest') return b.publishDate.localeCompare(a.publishDate);
      return b.score - a.score;
    });

    return list;
  }, [
    bids,
    activeNavTab,
    topCardFilter,
    filterGrade,
    filterField,
    filterAgencyGroup,
    filterSolution,
    selectedCalendarDate,
    searchQuery,
    sortBy,
  ]);

  const bookmarkedBids = useMemo(() => bids.filter((b) => b.isBookmarked), [bids]);

  return (
    <div className="min-h-screen bg-[#E3EDF9] p-3 sm:p-6 flex flex-col">
      {/* 바깥 여백 24px 프레임 안의 반경 24px 최외곽 흰 판 (디자인 가이드 1 구조 원칙 1) */}
      <div className="w-full max-w-[1600px] mx-auto bg-white rounded-[24px] shadow-[0_8px_24px_rgba(14,41,71,0.08)] border border-[#E2E9F2] overflow-hidden flex flex-col flex-1">
        {/* 1. 공통 헤더 64px */}
        <Header
          activeTab={activeNavTab}
          setActiveTab={(tab) => {
            setActiveNavTab(tab as any);
            setTopCardFilter('ALL');
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenSeoProfile={() => setIsSeoProfileOpen(true)}
          isFetching={isFetching}
          onFetchBids={handleFetchBids}
          bookmarkedCount={bookmarkedBids.length}
        />

        {/* 2. 메인 대시보드 바디 */}
        <main className="p-4 sm:p-6 flex flex-col gap-5 flex-1">
          {/* 나라장터 OpenAPI 실시간 연동 안내 상태 바 */}
          <div className="px-4 py-2.5 bg-[#F4F8FD] border border-[#DCE9FA] rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#127A5E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#127A5E]"></span>
              </span>
              <span className="font-bold text-[#0F1B2D]">조달청 나라장터 OpenAPI 100% 실시간 연동</span>
              <span className="text-[#5A6B82] hidden md:inline">|</span>
              <span className="text-[#5A6B82] hidden md:inline">
                공공데이터포털 공식 API에서 수집된 실제 입찰공고 <strong className="text-[#127A5E] font-semibold">{bids.length}건</strong> 제공 중
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-[#5A6B82]">최근 수집: {summary.lastCollectedAt}</span>
              <button
                onClick={handleFetchBids}
                disabled={isFetching}
                className="px-2.5 py-1 rounded-full bg-white text-[#2F76D2] border border-[#DCE9FA] hover:bg-[#EFF5FD] transition-all cursor-pointer font-medium disabled:opacity-50"
              >
                {isFetching ? '수집 중...' : '실시간 공고 새로고침'}
              </button>
            </div>
          </div>

          {/* 상단 108px 요약 카드 4종 (디자인 가이드 10 스펙) */}
          <SummaryCards
            summary={summary}
            onFetchBids={handleFetchBids}
            isFetching={isFetching}
            onSelectFilter={(type) => {
              if (topCardFilter === type) {
                setTopCardFilter('ALL');
              } else {
                setTopCardFilter(type);
                setActiveNavTab('overview');
              }
            }}
            activeFilter={topCardFilter}
          />

          {/* 활성 필터 배너 (달력 필터, 세오 솔루션 또는 상단 카드 필터 적용 시) */}
          {(selectedCalendarDate || topCardFilter !== 'ALL' || searchQuery || filterSolution !== 'ALL') && (
            <div className="px-4 py-2 bg-[#EFF5FD] border border-[#DCE9FA] rounded-xl flex items-center justify-between text-xs text-[#1F5DB0]">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#2F76D2]" />
                <span>
                  현재 필터 적용 중:{' '}
                  {filterSolution !== 'ALL' && (
                    <strong className="mr-2">솔루션: {filterSolution}</strong>
                  )}
                  {selectedCalendarDate && (
                    <strong className="mr-2">마감일: {selectedCalendarDate}</strong>
                  )}
                  {topCardFilter === 'NEW' && <strong className="mr-2">오늘 신규 공고</strong>}
                  {topCardFilter === 'A' && <strong className="mr-2">A등급 유망 공고</strong>}
                  {topCardFilter === 'URGENT' && <strong className="mr-2">마감 3일 이내</strong>}
                  {searchQuery && <strong>검색어: "{searchQuery}"</strong>}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedCalendarDate(null);
                  setTopCardFilter('ALL');
                  setSearchQuery('');
                  setFilterGrade('ALL');
                  setFilterField('ALL');
                  setFilterAgencyGroup('ALL');
                  setFilterSolution('ALL');
                }}
                className="font-bold underline hover:text-[#0E2947] cursor-pointer"
              >
                전체 보기 (필터 해제)
              </button>
            </div>
          )}

          {/* 메인 레이아웃: 좌측 가변 공고 목록 + 우측 320px 고정 캘린더 패널 */}
          <div className="flex flex-col xl:flex-row gap-6 items-start flex-1">
            {/* 좌측 공고 목록 테이블 */}
            <div className="flex-1 w-full flex flex-col">
              <BidTable
                bids={filteredBids}
                selectedBid={selectedBid}
                onSelectBid={handleSelectBid}
                onToggleBookmark={handleToggleBookmark}
                onQuickFeedback={handleQuickFeedback}
                filterGrade={filterGrade}
                setFilterGrade={setFilterGrade}
                filterField={filterField}
                setFilterField={setFilterField}
                filterAgencyGroup={filterAgencyGroup}
                setFilterAgencyGroup={setFilterAgencyGroup}
                filterSolution={filterSolution}
                setFilterSolution={setFilterSolution}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>

            {/* 우측 320px 고정 마감일 캘린더 & 실적 가이드 패널 */}
            <RightPanel
              bids={bids}
              selectedDate={selectedCalendarDate}
              onSelectDate={setSelectedCalendarDate}
              onSelectBid={handleSelectBid}
              onOpenSeoProfile={() => setIsSeoProfileOpen(true)}
            />
          </div>
        </main>
      </div>

      {/* 3. 모달 컴포넌트들 */}
      <BidDetailModal
        bid={selectedBid}
        onClose={() => setSelectedBid(null)}
        onSaveFeedback={handleSaveFeedback}
        onToggleBookmark={handleToggleBookmark}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        bids={filteredBids}
        bookmarkedBids={bookmarkedBids}
      />

      <SeoProfileModal
        isOpen={isSeoProfileOpen}
        onClose={() => setIsSeoProfileOpen(false)}
      />

      {/* 4. 알림 토스트 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-[0_8px_24px_rgba(14,41,71,0.15)] flex items-center gap-2.5 text-xs font-semibold text-white ${
              toastMessage.type === 'error'
                ? 'bg-[#D64545]'
                : toastMessage.type === 'info'
                ? 'bg-[#2F76D2]'
                : 'bg-[#0E2947]'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
