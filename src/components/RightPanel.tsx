import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  AlertTriangle,
  TrendingUp,
  Info,
} from 'lucide-react';
import { BidItem } from '../types';

interface RightPanelProps {
  bids: BidItem[];
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
  onSelectBid: (bid: BidItem) => void;
  onOpenSeoProfile?: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  bids,
  selectedDate,
  onSelectDate,
  onSelectBid,
  onOpenSeoProfile,
}) => {
  // Calendar navigation state (current displayed month)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 is September (0-indexed)

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Build calendar matrix
  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays: Array<{
    dayNumber: number;
    monthOffset: number; // -1: prev, 0: curr, 1: next
    dateString: string;
  }> = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = currentMonth === 0 ? 12 : currentMonth;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    calendarDays.push({
      dayNumber: d,
      monthOffset: -1,
      dateString: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const m = currentMonth + 1;
    calendarDays.push({
      dayNumber: d,
      monthOffset: 0,
      dateString: `${currentYear}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }

  // Next month leading days (fill up to 35 or 42 cells)
  const remaining = 35 - calendarDays.length;
  for (let d = 1; d <= (remaining > 0 ? remaining : 42 - calendarDays.length); d++) {
    const m = currentMonth === 11 ? 1 : currentMonth + 2;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    calendarDays.push({
      dayNumber: d,
      monthOffset: 1,
      dateString: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }

  // Group bids by deadline date string YYYY-MM-DD
  const bidsByDate: Record<string, BidItem[]> = {};
  bids.forEach((bid) => {
    const dStr = bid.deadlineDate.slice(0, 10);
    if (!bidsByDate[dStr]) bidsByDate[dStr] = [];
    bidsByDate[dStr].push(bid);
  });

  // Urgent upcoming notices
  const urgentBids = bids
    .filter((b) => b.dDay >= 0 && b.dDay <= 3)
    .sort((a, b) => a.dDay - b.dDay);

  const todayStr = '2026-09-14';

  return (
    <aside className="w-full xl:w-[320px] flex flex-col gap-4 shrink-0">
      {/* 1. 마감일 캘린더 (디자인 가이드 5.8 스펙 반영) */}
      <div className="bg-white border border-[#E2E9F2] rounded-[20px] p-4 shadow-[0_1px_2px_rgba(14,41,71,0.04),0_4px_12px_rgba(14,41,71,0.06)]">
        {/* 캘린더 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-[#2F76D2]" />
            <h3 className="text-xs font-bold text-[#0F1B2D]">입찰 마감 캘린더</h3>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-[#0F1B2D] mr-1">
              {currentYear}년 {monthNames[currentMonth]}
            </span>
            <button
              onClick={prevMonth}
              className="p-1 rounded text-[#5A6B82] hover:bg-[#EFF5FD] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded text-[#5A6B82] hover:bg-[#EFF5FD] cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 text-center mb-1">
          {['일', '월', '화', '수', '목', '금', '토'].map((dow, idx) => (
            <div
              key={idx}
              className={`text-[11px] font-semibold py-1 ${
                idx === 0 ? 'text-[#D64545]' : idx === 6 ? 'text-[#2F76D2]' : 'text-[#92A1B5]'
              }`}
            >
              {dow}
            </div>
          ))}
        </div>

        {/* 날짜 셀 그리드 (32x32 크기) */}
        <div className="grid grid-cols-7 gap-y-1.5 place-items-center">
          {calendarDays.map((cell, idx) => {
            const isToday = cell.dateString === todayStr;
            const isSelected = selectedDate === cell.dateString;
            const cellBids = bidsByDate[cell.dateString] || [];
            const hasDeadlines = cellBids.length > 0;
            const hasUrgent = cellBids.some((b) => b.dDay >= 0 && b.dDay <= 3);

            return (
              <button
                key={idx}
                onClick={() => onSelectDate(isSelected ? null : cell.dateString)}
                disabled={cell.monthOffset !== 0}
                className={`w-8 h-8 rounded-full flex flex-col items-center justify-center relative text-xs font-medium transition-all cursor-pointer ${
                  cell.monthOffset !== 0
                    ? 'text-[#BBD4F5] opacity-40 cursor-default'
                    : isToday
                    ? 'bg-[#0E2947] text-white font-bold'
                    : isSelected
                    ? 'bg-[#2F76D2] text-white font-bold'
                    : 'text-[#0F1B2D] hover:bg-[#EFF5FD]'
                }`}
                title={
                  hasDeadlines
                    ? `${cell.dateString}: ${cellBids.length}건 마감 예정 (클릭하여 필터)`
                    : cell.dateString
                }
              >
                <span>{cell.dayNumber}</span>
                {/* 마감 일정 점 표시 */}
                {cell.monthOffset === 0 && hasDeadlines && (
                  <span
                    className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                      hasUrgent
                        ? 'bg-[#D64545]'
                        : isToday || isSelected
                        ? 'bg-white'
                        : 'bg-[#4DB5F0]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* 캘린더 안내 및 필터 초기화 */}
        <div className="mt-3 pt-2.5 border-t border-[#E2E9F2] flex items-center justify-between text-[11px] text-[#5A6B82]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4DB5F0]" />
              일정
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D64545]" />
              3일 이내
            </span>
          </div>
          {selectedDate && (
            <button
              onClick={() => onSelectDate(null)}
              className="text-[#2F76D2] font-semibold hover:underline cursor-pointer"
            >
              필터 해제
            </button>
          )}
        </div>
      </div>

      {/* 2. 긴급 마감 임박 타임라인 (D-3 이내) */}
      <div className="bg-white border border-[#E2E9F2] rounded-[20px] p-4 shadow-[0_1px_2px_rgba(14,41,71,0.04),0_4px_12px_rgba(14,41,71,0.06)]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#D64545]" />
            <h3 className="text-xs font-bold text-[#0F1B2D]">마감 임박 공고</h3>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FDE8E8] text-[#D64545]">
            {urgentBids.length}건
          </span>
        </div>

        <div className="space-y-2">
          {urgentBids.length === 0 ? (
            <div className="py-4 text-center text-xs text-[#92A1B5]">
              현재 3일 이내 마감 공고가 없습니다.
            </div>
          ) : (
            urgentBids.slice(0, 3).map((bid) => (
              <div
                key={bid.id}
                onClick={() => onSelectBid(bid)}
                className="p-2.5 rounded-xl border border-[#F8B4B4]/60 bg-[#FDE8E8]/20 hover:bg-[#FDE8E8]/40 transition-colors cursor-pointer border-l-4 border-l-[#D64545]"
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-bold text-[#D64545]">D-{bid.dDay} 마감</span>
                  <span className="text-[#5A6B82] tabular-nums">
                    {bid.deadlineDate.slice(5, 16)}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#0F1B2D] line-clamp-1 leading-snug">
                  {bid.title}
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#5A6B82] mt-1">
                  <span className="truncate">{bid.agency}</span>
                  <span className="font-bold text-[#0E2947] tabular-nums">
                    {bid.score}점 ({bid.grade})
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. (주)세오 5대 솔루션 & 거점 기반 맞춤 추천 모델 가이드 카드 */}
      <div className="bg-[#EFF5FD] border border-[#DCE9FA] rounded-[20px] p-4 text-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[#0E2947] font-bold">
            <Award className="w-4 h-4 text-[#2F76D2]" />
            <span>(주)세오 맞춤 추천 산정 모델</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#2F76D2] border border-[#BBD4F5]">
            2026 기준
          </span>
        </div>
        <p className="text-[#5A6B82] text-[11px] leading-relaxed mb-3">
          (주)세오의 <strong>5대 핵심 솔루션</strong>과 <strong>4대 연구·생산거점</strong>, 보유 면허 및 주요 발주처 실적에 기반하여 실시간 공고를 자동 분석합니다.
        </p>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-[#E2E9F2]">
            <span className="text-[#5A6B82]">5대 핵심 솔루션 일치</span>
            <span className="font-bold text-[#0E2947]">CCTV·암호·단속 (+30점)</span>
          </div>
          <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-[#E2E9F2]">
            <span className="text-[#5A6B82]">주력·타깃 발주처</span>
            <span className="font-bold text-[#2F76D2]">발전소·세관·관제 (+25점)</span>
          </div>
          <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-[#E2E9F2]">
            <span className="text-[#5A6B82]">생산·연구 거점 인접도</span>
            <span className="font-bold text-[#127A5E]">경기·호남·광주 (+15점)</span>
          </div>
          <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-[#E2E9F2]">
            <span className="text-[#5A6B82]">통신·전기·SW 면허</span>
            <span className="font-bold text-[#0F1B2D]">직접 투찰 적격 (+18점)</span>
          </div>
        </div>

        {onOpenSeoProfile && (
          <button
            onClick={onOpenSeoProfile}
            className="w-full mt-3 py-2 px-3 text-center text-xs font-semibold text-[#0E2947] bg-white hover:bg-[#E4F4FE] border border-[#BBD4F5] rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            세오 5대 솔루션 & 기술인증 상세 →
          </button>
        )}
      </div>
    </aside>
  );
};
