import React from 'react';
import { Sparkles, AlertCircle, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { DashboardSummary } from '../types';

interface SummaryCardsProps {
  summary: DashboardSummary;
  onFetchBids: () => void;
  isFetching: boolean;
  onSelectFilter: (type: string) => void;
  activeFilter: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  onFetchBids,
  isFetching,
  onSelectFilter,
  activeFilter,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-auto lg:h-[108px]">
      {/* 1. 오늘 신규 공고 (라이트 카드) */}
      <div
        onClick={() => onSelectFilter('NEW')}
        className={`bg-white border rounded-[16px] p-4 flex flex-col justify-between cursor-pointer transition-all hover:shadow-[0_1px_2px_rgba(14,41,71,0.04),0_4px_12px_rgba(14,41,71,0.06)] ${
          activeFilter === 'NEW' ? 'border-[#2F76D2] ring-1 ring-[#2F76D2]' : 'border-[#E2E9F2]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#92A1B5] font-medium">오늘 신규 공고</span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EFF5FD] text-[#2F76D2]">
            NEW
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-2xl lg:text-[28px] font-bold text-[#0F1B2D] tabular-nums tracking-tight">
            {summary.todayNewCount}
            <span className="text-sm font-normal text-[#5A6B82] ml-1">건</span>
          </span>
          {/* 스파크라인 그래픽 */}
          <div className="flex items-end gap-1 h-6">
            <div className="w-1.5 h-2 bg-[#DCE9FA] rounded-t-sm" />
            <div className="w-1.5 h-3.5 bg-[#8CB8EE] rounded-t-sm" />
            <div className="w-1.5 h-5 bg-[#2F76D2] rounded-t-sm" />
            <div className="w-1.5 h-4 bg-[#5A96E3] rounded-t-sm" />
          </div>
        </div>
        <p className="text-[11px] text-[#5A6B82] truncate">전체 {summary.totalCount}건 중 오늘 등록</p>
      </div>

      {/* 2. A등급 수주 추천 (스카이 카드 - 가이드: 글자는 반드시 #0E2947 딥네이비!) */}
      <div
        onClick={() => onSelectFilter('A')}
        className={`bg-[#4DB5F0] rounded-[16px] p-4 flex flex-col justify-between cursor-pointer transition-all hover:opacity-95 shadow-sm ${
          activeFilter === 'A' ? 'ring-2 ring-[#0E2947]' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#0E2947] font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            수주 유망 (A등급 70점↑)
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#0E2947] text-white">
            TOP
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-2xl lg:text-[28px] font-bold text-[#0E2947] tabular-nums tracking-tight">
            {summary.gradeACount}
            <span className="text-sm font-semibold text-[#0E2947]/80 ml-1">건</span>
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/40 text-[#0E2947]">
            우선 검토
          </span>
        </div>
        <p className="text-[11px] text-[#0E2947]/80 font-medium truncate">
          세오 실적·키워드 최고 적합도 공고
        </p>
      </div>

      {/* 3. 마감 3일 이내 (위험 상태 색상 #D64545 - 가이드 2.4 블루 치환 제외) */}
      <div
        onClick={() => onSelectFilter('URGENT')}
        className={`bg-white border rounded-[16px] p-4 flex flex-col justify-between cursor-pointer transition-all hover:shadow-[0_1px_2px_rgba(14,41,71,0.04),0_4px_12px_rgba(14,41,71,0.06)] ${
          activeFilter === 'URGENT' ? 'border-[#D64545] ring-1 ring-[#D64545]' : 'border-[#E2E9F2]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#D64545] font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            마감 임박 (D-3 이내)
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FDE8E8] text-[#D64545]">
            긴급
          </span>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-2xl lg:text-[28px] font-bold text-[#D64545] tabular-nums tracking-tight">
            {summary.urgentCount}
            <span className="text-sm font-normal text-[#5A6B82] ml-1">건</span>
          </span>
          <span className="text-[11px] font-medium text-[#D64545]">투찰 일정 확인 필요</span>
        </div>
        <p className="text-[11px] text-[#5A6B82] truncate">규격서 및 제안서 준비 필수</p>
      </div>

      {/* 4. 프로모션 다크 카드: 공고 가져오기 + 마지막 수집 시각 */}
      <div className="bg-[#0E2947] text-white rounded-[16px] p-4 flex flex-col justify-between relative overflow-hidden shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70 font-medium">나라장터 자동 수집</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20">
            매일 06:00
          </span>
        </div>

        <div className="flex items-center justify-between mt-1 gap-2">
          <div>
            <div className="text-xs font-semibold text-white">11종 키워드 일괄 수집</div>
            <div className="text-[11px] text-white/70 tabular-nums">
              마지막: {summary.lastCollectedAt || '방금 전'}
            </div>
          </div>
          <button
            onClick={onFetchBids}
            disabled={isFetching}
            className="px-3.5 py-1.5 text-xs font-semibold bg-white text-[#0E2947] hover:bg-[#EFF5FD] rounded-full flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? '수집 중' : '가져오기'}
          </button>
        </div>

        <div className="text-[10px] text-white/60 truncate">
          조달청 OpenAPI 연동 실시간 분석
        </div>
      </div>
    </div>
  );
};
