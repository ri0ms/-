import React, { useState } from 'react';
import {
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Sparkles,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { BidGrade, BidItem } from '../types';

interface BidTableProps {
  bids: BidItem[];
  selectedBid: BidItem | null;
  onSelectBid: (bid: BidItem) => void;
  onToggleBookmark: (bid: BidItem, e: React.MouseEvent) => void;
  onQuickFeedback: (bid: BidItem, feedback: 'SUITABLE' | 'UNSUITABLE', e: React.MouseEvent) => void;
  filterGrade: string;
  setFilterGrade: (grade: string) => void;
  filterField: string;
  setFilterField: (field: string) => void;
  filterAgencyGroup: string;
  setFilterAgencyGroup: (group: string) => void;
  filterSolution?: string;
  setFilterSolution?: (sol: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export const BidTable: React.FC<BidTableProps> = ({
  bids,
  selectedBid,
  onSelectBid,
  onToggleBookmark,
  onQuickFeedback,
  filterGrade,
  setFilterGrade,
  filterField,
  setFilterField,
  filterAgencyGroup,
  setFilterAgencyGroup,
  filterSolution = 'ALL',
  setFilterSolution,
  sortBy,
  setSortBy,
}) => {
  // 금액 포맷터 (억/천만원)
  const formatAmount = (amount: number) => {
    if (!amount || amount <= 0) return '미기재';
    if (amount >= 100000000) {
      const eok = amount / 100000000;
      return `${eok.toFixed(1)}억원`;
    }
    const man = Math.round(amount / 10000);
    return `${man.toLocaleString()}만원`;
  };

  return (
    <div className="bg-white border border-[#E2E9F2] rounded-[20px] shadow-[0_1px_2px_rgba(14,41,71,0.04),0_4px_12px_rgba(14,41,71,0.06)] overflow-hidden flex flex-col flex-1">
      {/* 1. 테이블 상단 컨트롤러 및 탭 필터 (디자인 가이드 5.2 탭 스펙 반영) */}
      <div className="p-4 border-b border-[#E2E9F2] flex flex-wrap items-center justify-between gap-3 bg-[#F4F8FD]/60">
        {/* 등급 탭 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterGrade('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              filterGrade === 'ALL'
                ? 'bg-[#0E2947] text-white shadow-sm'
                : 'bg-white text-[#5A6B82] border border-[#E2E9F2] hover:bg-[#EFF5FD]'
            }`}
          >
            전체 ({bids.length})
          </button>
          <button
            onClick={() => setFilterGrade('A')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              filterGrade === 'A'
                ? 'bg-[#4DB5F0] text-[#0E2947] shadow-sm font-bold'
                : 'bg-white text-[#5A6B82] border border-[#E2E9F2] hover:bg-[#E4F4FE]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#0E2947]" />
            A등급 (70점↑)
          </button>
          <button
            onClick={() => setFilterGrade('B')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              filterGrade === 'B'
                ? 'bg-[#2F76D2] text-white shadow-sm'
                : 'bg-white text-[#5A6B82] border border-[#E2E9F2] hover:bg-[#EFF5FD]'
            }`}
          >
            B등급 (40~69점)
          </button>
          <button
            onClick={() => setFilterGrade('C')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
              filterGrade === 'C'
                ? 'bg-[#92A1B5] text-white shadow-sm'
                : 'bg-white text-[#5A6B82] border border-[#E2E9F2] hover:bg-[#EFF5FD]'
            }`}
          >
            C등급 (&lt;40점)
          </button>
        </div>

        {/* 상세 조건 드롭다운 및 정렬 */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* 세오 맞춤 솔루션 필터 */}
          {setFilterSolution && (
            <select
              value={filterSolution}
              onChange={(e) => setFilterSolution(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-[#BBD4F5] bg-[#EFF5FD] text-[#0E2947] font-semibold focus:outline-none focus:border-[#2F76D2]"
            >
              <option value="ALL">모든 세오 솔루션</option>
              <option value="GCN AI 영상감시">🎯 GCN AI 영상감시</option>
              <option value="CUBE HIDE 암호화">🔒 CUBE HIDE 암호화</option>
              <option value="60GHz 무인단속">🚦 60GHz 무인단속</option>
              <option value="bluelock 계장제어">💧 bluelock 계장제어</option>
              <option value="산업안전 AI">🦺 산업안전 AI</option>
              <option value="통신·전기공사">⚡ 통신·전기공사</option>
            </select>
          )}

          {/* 분야 필터 */}
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-[#E2E9F2] bg-white text-[#0F1B2D] focus:outline-none focus:border-[#2F76D2]"
          >
            <option value="ALL">모든 사업분야</option>
            <option value="유지보수">유지보수 (최다실적)</option>
            <option value="구축">구축 (주력)</option>
            <option value="설계">설계/감리</option>
          </select>

          {/* 발주처 필터 */}
          <select
            value={filterAgencyGroup}
            onChange={(e) => setFilterAgencyGroup(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-[#E2E9F2] bg-white text-[#0F1B2D] focus:outline-none focus:border-[#2F76D2]"
          >
            <option value="ALL">모든 발주기관</option>
            <option value="기존실적">실적보유 (발전사/지자체/세관)</option>
            <option value="확장목표">타깃기관 (국방/철도/항만)</option>
          </select>

          {/* 정렬 기준 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-[#E2E9F2] bg-white text-[#0F1B2D] font-medium focus:outline-none focus:border-[#2F76D2]"
          >
            <option value="score">점수 높은 순 (세오 추천)</option>
            <option value="deadline">마감 임박 순</option>
            <option value="amount">추정가격 높은 순</option>
            <option value="latest">최신 등록 순</option>
          </select>
        </div>
      </div>

      {/* 2. 공고 목록 표 (1440 × 900 최적화, 최대 15행 한눈에 확인 가능) */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E9F2] bg-[#EFF5FD]/50 text-[11px] font-semibold text-[#5A6B82] uppercase tracking-wider">
              <th className="py-2.5 px-3 text-center w-16 whitespace-nowrap">적합도</th>
              <th className="py-2.5 px-3 min-w-[240px]">공고명 / 세오 추천 사유</th>
              <th className="py-2.5 px-3 w-40 whitespace-nowrap">세오 솔루션 & 거점</th>
              <th className="py-2.5 px-3 w-32 whitespace-nowrap">발주기관</th>
              <th className="py-2.5 px-3 w-32 text-right whitespace-nowrap">추정가격</th>
              <th className="py-2.5 px-3 min-w-[170px] whitespace-nowrap">매칭 키워드</th>
              <th className="py-2.5 px-3 w-36 text-center whitespace-nowrap">마감일 (D-Day)</th>
              <th className="py-2.5 px-3 w-24 text-center whitespace-nowrap">피드백</th>
              <th className="py-2.5 px-3 w-16 text-center whitespace-nowrap">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E9F2] text-xs">
            {bids.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#92A1B5]">
                  <p className="text-sm font-medium">조건에 일치하는 실시간 입찰공고가 없습니다.</p>
                  <p className="text-xs mt-1">상단 [공고 가져오기]를 눌러 나라장터 실시간 공고를 수집하세요.</p>
                </td>
              </tr>
            ) : (
              bids.map((bid) => {
                const isSelected = selectedBid?.id === bid.id;
                const isUrgent = bid.dDay >= 0 && bid.dDay <= 3;
                const badge = bid.seoFitBadge || '🎯 GCN AI 영상감시';
                const region = bid.targetRegionMatch || '전국 대응 (안양/광주)';

                return (
                  <tr
                    key={bid.id}
                    onClick={() => onSelectBid(bid)}
                    className={`transition-colors cursor-pointer group hover:bg-[#F4F8FD] ${
                      isSelected ? 'bg-[#EFF5FD]' : bid.isViewed ? 'opacity-90' : 'bg-white'
                    }`}
                  >
                    {/* 1. 수주 적합도 점수 & 등급 뱃지 */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs tabular-nums border transition-transform group-hover:scale-105 ${
                            bid.grade === 'A'
                              ? 'bg-[#4DB5F0] text-[#0E2947] border-[#2F76D2]/30 shadow-xs'
                              : bid.grade === 'B'
                              ? 'bg-[#EFF5FD] text-[#2F76D2] border-[#BBD4F5]'
                              : 'bg-gray-100 text-[#92A1B5] border-gray-200'
                          }`}
                        >
                          {bid.score}
                        </div>
                        <span
                          className={`text-[10px] font-bold mt-0.5 ${
                            bid.grade === 'A'
                              ? 'text-[#0E2947]'
                              : bid.grade === 'B'
                              ? 'text-[#2F76D2]'
                              : 'text-[#92A1B5]'
                          }`}
                        >
                          {bid.grade}등급
                        </span>
                      </div>
                    </td>

                    {/* 2. 공고명 / 공고번호 / 세오 맞춤 추천 사유 */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-sm bg-[#127A5E] text-white flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          나라장터 실시간
                        </span>
                        {bid.isNew && (
                          <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-sm bg-[#2F76D2] text-white">
                            NEW
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-[#92A1B5]">
                          {bid.bidNo}-{bid.bidSeq}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#EFF5FD] text-[#5A6B82] border border-[#E2E9F2]">
                          {bid.field}
                        </span>
                      </div>
                      <div className="font-semibold text-[#0F1B2D] group-hover:text-[#2F76D2] transition-colors line-clamp-1 text-sm">
                        {bid.title}
                      </div>
                      {/* 추천 핵심 사유 1줄 하이라이트 */}
                      {bid.seoFitReasons && bid.seoFitReasons.length > 0 && (
                        <div className="text-[11px] text-[#2F76D2] font-medium truncate mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2F76D2] shrink-0" />
                          <span>{bid.seoFitReasons[0]}</span>
                        </div>
                      )}
                    </td>

                    {/* 3. 세오 솔루션 매칭 & 거점 지역 */}
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E4F4FE] text-[#0E2947] border border-[#BBD4F5] max-w-full truncate">
                        {badge}
                      </div>
                      <div className="text-[10px] text-[#5A6B82] mt-1 flex items-center gap-1 truncate">
                        <span className="text-[#2F76D2]">📍</span>
                        <span>{region}</span>
                      </div>
                    </td>

                    {/* 4. 발주기관 및 그룹 태그 */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#0F1B2D] truncate">{bid.agency}</div>
                      <div className="mt-0.5">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            bid.agencyGroup === '기존실적'
                              ? 'bg-[#E7EEF8] text-[#123766] border border-[#BBD4F5]'
                              : bid.agencyGroup === '확장목표'
                              ? 'bg-[#EBEDFC] text-[#5A6BE0] border border-[#DCE9FA]'
                              : 'bg-gray-100 text-[#92A1B5]'
                          }`}
                        >
                          {bid.agencyGroup === '기존실적'
                            ? '★ 실적보유'
                            : bid.agencyGroup === '확장목표'
                            ? '🎯 타깃기관'
                            : '일반기관'}
                        </span>
                      </div>
                    </td>

                    {/* 5. 추정가격 (한 줄 표시: 금액 및 계약방식) */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="font-bold text-[#0F1B2D] tabular-nums text-xs">
                        {formatAmount(bid.estimatedPrice)}
                      </div>
                      <div className="text-[10px] text-[#5A6B82] mt-0.5">
                        {bid.contractMethod}
                      </div>
                    </td>

                    {/* 6. 매칭 키워드 칩 (한 줄로 깔끔하게 정렬) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 overflow-hidden">
                        {bid.matchingKeywords.slice(0, 2).map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EFF5FD] text-[#1F5DB0] border border-[#DCE9FA] shrink-0 whitespace-nowrap"
                          >
                            {kw}
                          </span>
                        ))}
                        {bid.matchingKeywords.length > 2 && (
                          <span
                            className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-[#F4F8FD] text-[#5A6B82] border border-[#E2E9F2] shrink-0"
                            title={bid.matchingKeywords.slice(2).join(', ')}
                          >
                            +{bid.matchingKeywords.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 7. 마감일 및 D-Day (한 줄 인라인 표시) */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-full tabular-nums whitespace-nowrap ${
                            isUrgent
                              ? 'bg-[#FDE8E8] text-[#D64545] border border-[#F8B4B4]'
                              : bid.dDay <= 7
                              ? 'bg-[#FEF08A]/50 text-[#B7791F]'
                              : 'bg-[#EFF5FD] text-[#2F76D2] border border-[#DCE9FA]'
                          }`}
                        >
                          {isUrgent && <AlertCircle className="w-3 h-3 text-[#D64545]" />}
                          {bid.dDay === 0 ? 'D-Day' : bid.dDay < 0 ? '마감' : `D-${bid.dDay}`}
                        </span>
                        <span className="text-[11px] text-[#5A6B82] tabular-nums font-mono">
                          {bid.deadlineDate.slice(5, 16)}
                        </span>
                      </div>
                    </td>

                    {/* 8. 피드백 상태 */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      {bid.feedback === 'SUITABLE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-[#E6F4EA] text-[#127A5E]">
                          <ThumbsUp className="w-3 h-3" />
                          적합
                        </span>
                      ) : bid.feedback === 'UNSUITABLE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-red-50 text-[#D64545]">
                          <ThumbsDown className="w-3 h-3" />
                          부적합
                        </span>
                      ) : bid.feedback === 'HOLD' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">
                          <Clock className="w-3 h-3" />
                          보류
                        </span>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => onQuickFeedback(bid, 'SUITABLE', e)}
                            className="p-1 text-[#92A1B5] hover:text-[#127A5E] hover:bg-[#E6F4EA] rounded transition-colors cursor-pointer"
                            title="적합 표시"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => onQuickFeedback(bid, 'UNSUITABLE', e)}
                            className="p-1 text-[#92A1B5] hover:text-[#D64545] hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="부적합 표시"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* 9. 관리 */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => onToggleBookmark(bid, e)}
                          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                            bid.isBookmarked
                              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                              : 'text-[#92A1B5] hover:text-[#2F76D2] hover:bg-[#EFF5FD]'
                          }`}
                          title={bid.isBookmarked ? '관심 해제' : '관심 등록'}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${bid.isBookmarked ? 'fill-amber-500' : ''}`}
                          />
                        </button>
                        <button
                          onClick={() => onSelectBid(bid)}
                          className="p-1.5 rounded-full text-[#5A6B82] hover:text-[#0F1B2D] hover:bg-[#EFF5FD] transition-colors cursor-pointer"
                          title="점수 근거 및 상세"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 테이블 하단 푸터 (총 건수 및 가이드) */}
      <div className="p-3 border-t border-[#E2E9F2] bg-white flex items-center justify-between text-xs text-[#5A6B82]">
        <div className="flex items-center gap-2">
          <span>
            총 <strong className="text-[#0F1B2D] tabular-nums">{bids.length}</strong>건 표시 중
          </span>
          <span className="text-[#92A1B5]">|</span>
          <span className="text-[#92A1B5]">
            (주)세오 5대 솔루션 & 거점(안양·포천·광주) 연계 맞춤 추천 적용
          </span>
        </div>
        <div className="text-[11px] text-[#2F76D2] font-semibold">
          행 클릭 시 세오 맞춤 수주 전략 및 세부 배점 근거가 표시됩니다.
        </div>
      </div>
    </div>
  );
};

