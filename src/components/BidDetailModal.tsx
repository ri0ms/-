import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Sparkles,
  Building,
  DollarSign,
  Calendar,
  FileText,
  Tag,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import { BidItem, FeedbackStatus } from '../types';

interface BidDetailModalProps {
  bid: BidItem | null;
  onClose: () => void;
  onSaveFeedback: (
    bidId: string,
    feedback: FeedbackStatus,
    reason: string[],
    note: string
  ) => void;
  onToggleBookmark: (bid: BidItem, e: React.MouseEvent) => void;
}

const SUITABLE_TAGS = [
  '유사 수주실적 보유',
  '사업금액 적정',
  '기존 발주처 우위',
  '기술 규격 부합',
  '지역 제한 적합',
  '컨소시엄 구성 용이',
];

const UNSUITABLE_TAGS = [
  '필수 면허/특허 미보유',
  '원거리 현장 관리 곤란',
  '단가 비현실적',
  '투입 인력 부족',
  '대기업 참여제한 해당',
  '납기 일정 촉박',
];

const HOLD_TAGS = [
  '과업지시서 추가 분석 필요',
  '발주처 질의 회신 대기',
  '본부장 사전 보고 필요',
  '협력사 단가 견적 확인 중',
];

export const BidDetailModal: React.FC<BidDetailModalProps> = ({
  bid,
  onClose,
  onSaveFeedback,
  onToggleBookmark,
}) => {
  if (!bid) return null;

  const [feedback, setFeedback] = useState<FeedbackStatus>(bid.feedback);
  const [selectedReasons, setSelectedReasons] = useState<string[]>(bid.feedbackReason || []);
  const [note, setNote] = useState<string>(bid.feedbackNote || '');
  const [isSavedToast, setIsSavedToast] = useState(false);

  useEffect(() => {
    setFeedback(bid.feedback);
    setSelectedReasons(bid.feedbackReason || []);
    setNote(bid.feedbackNote || '');
  }, [bid]);

  const toggleReasonTag = (tag: string) => {
    if (selectedReasons.includes(tag)) {
      setSelectedReasons(selectedReasons.filter((t) => t !== tag));
    } else {
      setSelectedReasons([...selectedReasons, tag]);
    }
  };

  const handleSave = () => {
    onSaveFeedback(bid.id, feedback, selectedReasons, note);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  const formatPrice = (p: number) => {
    if (!p) return '추정가격 미기재';
    return `${p.toLocaleString()}원 (${(p / 100000000).toFixed(2)}억원)`;
  };

  const activeTagPool =
    feedback === 'SUITABLE'
      ? SUITABLE_TAGS
      : feedback === 'UNSUITABLE'
      ? UNSUITABLE_TAGS
      : HOLD_TAGS;

  return (
    <div className="fixed inset-0 z-50 bg-[#0E2947]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2E9F2] rounded-[24px] shadow-[0_8px_24px_rgba(14,41,71,0.15)] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* 모달 헤더 */}
        <div className="p-5 border-b border-[#E2E9F2] flex items-start justify-between bg-[#F4F8FD]/50">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  bid.grade === 'A'
                    ? 'bg-[#4DB5F0] text-[#0E2947]'
                    : bid.grade === 'B'
                    ? 'bg-[#2F76D2] text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {bid.grade}등급 ({bid.score}점)
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E6F4EA] text-[#127A5E] font-bold border border-[#A8DAB5] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#127A5E] animate-pulse" />
                조달청 나라장터 실시간 공고
              </span>
              <span className="text-xs font-mono text-[#5A6B82]">
                공고번호: {bid.bidNo}-{bid.bidSeq}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#EFF5FD] text-[#2F76D2] border border-[#DCE9FA]">
                {bid.field}
              </span>
              {bid.isNew && (
                <span className="text-xs px-2 py-0.5 rounded bg-[#2F76D2] text-white font-semibold">
                  신규
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F1B2D] leading-snug">
              {bid.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onToggleBookmark(bid, e)}
              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                bid.isBookmarked
                  ? 'border-amber-400 bg-amber-50 text-amber-500'
                  : 'border-[#E2E9F2] text-[#92A1B5] hover:bg-[#EFF5FD]'
              }`}
              title="관심 등록"
            >
              <Bookmark className={`w-4 h-4 ${bid.isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#92A1B5] hover:text-[#0F1B2D] hover:bg-[#EFF5FD] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 모달 본문 (스크롤) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. 핵심 요약 카드 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#EFF5FD]/60 rounded-xl border border-[#DCE9FA]">
              <div className="flex items-center gap-1.5 text-xs text-[#5A6B82] mb-1">
                <Building className="w-3.5 h-3.5 text-[#2F76D2]" />
                발주기관
              </div>
              <div className="text-sm font-bold text-[#0F1B2D] truncate">{bid.agency}</div>
              <div className="text-[11px] text-[#2F76D2] mt-0.5 font-medium">
                {bid.agencyGroup === '기존실적'
                  ? '★ 기존 수주실적 발주처'
                  : bid.agencyGroup === '확장목표'
                  ? '🎯 사업확장 타깃 발주처'
                  : '일반 공공기관'}
              </div>
            </div>

            <div className="p-3 bg-[#EFF5FD]/60 rounded-xl border border-[#DCE9FA]">
              <div className="flex items-center gap-1.5 text-xs text-[#5A6B82] mb-1">
                <DollarSign className="w-3.5 h-3.5 text-[#2F76D2]" />
                추정가격
              </div>
              <div className="text-sm font-bold text-[#0F1B2D] tabular-nums">
                {formatPrice(bid.estimatedPrice)}
              </div>
              <div className="text-[11px] text-[#5A6B82] mt-0.5">
                계약방식: {bid.contractMethod}
              </div>
            </div>

            <div className="p-3 bg-[#EFF5FD]/60 rounded-xl border border-[#DCE9FA]">
              <div className="flex items-center gap-1.5 text-xs text-[#5A6B82] mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#2F76D2]" />
                입찰 마감일시
              </div>
              <div
                className={`text-sm font-bold tabular-nums ${
                  bid.dDay >= 0 && bid.dDay <= 3 ? 'text-[#D64545]' : 'text-[#0F1B2D]'
                }`}
              >
                {bid.deadlineDate}
              </div>
              <div
                className={`text-[11px] font-semibold mt-0.5 ${
                  bid.dDay >= 0 && bid.dDay <= 3 ? 'text-[#D64545]' : 'text-[#5A6B82]'
                }`}
              >
                {bid.dDay >= 0 ? `마감까지 D-${bid.dDay}일 남음` : '입찰 마감 완료'}
              </div>
            </div>
          </div>

          {/* 2. (주)세오 맞춤 수주 진단 & 솔루션 매칭 분석 (신규 추가) */}
          <div className="border border-[#BBD4F5] rounded-xl p-4.5 bg-[#F4F8FD]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2F76D2] animate-ping" />
                <h3 className="font-bold text-sm text-[#0E2947]">
                  (주)세오 솔루션 매칭 진단 및 맞춤 수주 전략
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-[#0E2947] border border-[#BBD4F5] shadow-xs">
                  {bid.seoFitBadge || '🎯 GCN AI 영상감시'}
                </span>
                <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-[#E4F4FE] text-[#2F76D2]">
                  📍 {bid.targetRegionMatch || '전국 대응 (안양/광주)'}
                </span>
              </div>
            </div>

            {/* 세오 맞춤 추천 사유 리스트 */}
            <div className="bg-white rounded-lg p-3 border border-[#DCE9FA] space-y-2 mb-3">
              <div className="text-xs font-bold text-[#0F1B2D] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#127A5E]" />
                <span>세오 보유 기술·실적 기반 추천 사유:</span>
              </div>
              <div className="space-y-1.5 pl-5">
                {(bid.seoFitReasons || [
                  '방사형 레이어 GCN AI 행동/상태인지 시스템(조달우수제품 제2025030호) 직접 적용',
                  '정보통신공사업(제140370호) 및 전기공사업(제경기-05361호) 면허 적격',
                  '안양 본사 및 3개 공장(안양/포천/광주) 신속 기술지원 체계 우위'
                ]).map((reason, idx) => (
                  <div key={idx} className="text-xs text-[#0F1B2D] flex items-start gap-1.5">
                    <span className="text-[#2F76D2] font-bold shrink-0">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 제안서 작성 실전 전략 가이드 */}
            <div className="p-3 bg-white/70 rounded-lg border border-[#E2E9F2] text-xs">
              <span className="font-bold text-[#2F76D2] mr-1.5">💡 세오 MA사업본부 제안 전략:</span>
              <span className="text-[#5A6B82] leading-relaxed">
                {bid.title.includes('암호') || bid.title.includes('보안')
                  ? '국정원 KCMVP 검증필 CUBE HIDE 암호모듈 및 GS 1등급 인증서를 제안서 보안확약 항목에 필히 첨부하여 기술평가 보안성 만점을 공략하십시오.'
                  : bid.title.includes('단속') || bid.title.includes('교통')
                  ? '60GHz 레이더 복합 무인단속 시스템의 경찰청 규격 시험성적서 및 조달등록 물품 식별번호를 명기하여 규격 적합성을 입증하십시오.'
                  : bid.title.includes('물') || bid.title.includes('수위') || bid.title.includes('계장')
                  ? 'bluelock 계장제어장치 직접생산증명서와 한국환경공단/수자원공사 납품실적을 제시하여 신뢰성을 강조하십시오.'
                  : bid.title.includes('산업안전') || bid.title.includes('중대재해') || bid.title.includes('발전')
                  ? '위험지역 영상분석 혁신제품 지정서 및 5대 발전사 개발선정품 이력을 전면에 배치하여 우선구매 제도를 활용하십시오.'
                  : '방사형 레이어 GCN AI 조달우수제품(제2025030호) 및 NEP 신제품인증서, 품질보증조달물품 B+ 인증을 제시하여 정량평가 및 기술제안 우위를 선점하십시오.'}
              </span>
            </div>
          </div>

          {/* 3. 점수 산출 근거 (5대 항목 세부 기여도) */}
          <div className="border border-[#E2E9F2] rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-bold text-sm text-[#0F1B2D]">
                <Sparkles className="w-4 h-4 text-[#2F76D2]" />
                <span>수주 가능성 점수 산출 근거 (총 {bid.score}점 / 100점)</span>
              </div>
              <span className="text-xs text-[#5A6B82]">
                (주)세오 5대 가중치 규칙 v1 적용
              </span>
            </div>

            <div className="space-y-2.5">
              {bid.scoreBreakdown.map((item, idx) => {
                const pct = Math.round((item.points / item.maxPoints) * 100);
                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#F4F8FD] border border-[#E2E9F2]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-[#0F1B2D]">{item.category}</span>
                      <span className="font-bold text-[#2F76D2] tabular-nums">
                        +{item.points}점{' '}
                        <span className="text-[#92A1B5] font-normal">/ {item.maxPoints}점</span>
                      </span>
                    </div>
                    {/* 진행 바 */}
                    <div className="w-full bg-[#DCE9FA] h-1.5 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="bg-[#2F76D2] h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-[#5A6B82] flex items-center justify-between">
                      <span>{item.reason}</span>
                      <span className="text-[#92A1B5] font-mono">{item.item}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. 매칭 키워드 및 나라장터 바로가기 */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#EFF5FD] rounded-xl border border-[#DCE9FA]">
            <div>
              <div className="text-xs font-semibold text-[#0F1B2D] mb-1">매칭된 세오 핵심 키워드</div>
              <div className="flex flex-wrap gap-1.5">
                {bid.matchingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-[#2F76D2] border border-[#BBD4F5]"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
            <a
              href={bid.g2bUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0E2947] hover:bg-[#123766] text-white text-xs font-semibold rounded-full transition-colors shadow-xs"
            >
              <span>나라장터 원문 공고 보기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 4. 담당자 피드백 섹션 (PRD 4 [5] 요구사항) */}
          <div className="border border-[#E2E9F2] rounded-xl p-4 bg-white">
            <div className="text-sm font-bold text-[#0F1B2D] mb-2 flex items-center gap-2">
              <span>담당자 수주 판단 및 피드백</span>
              {isSavedToast && (
                <span className="text-xs font-semibold text-[#127A5E] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  저장 완료되었습니다.
                </span>
              )}
            </div>

            {/* 피드백 버튼 3종 */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setFeedback('SUITABLE')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  feedback === 'SUITABLE'
                    ? 'border-[#127A5E] bg-[#E6F4EA] text-[#127A5E] ring-1 ring-[#127A5E]'
                    : 'border-[#E2E9F2] text-[#5A6B82] hover:bg-[#EFF5FD]'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                적합 (투찰 검토)
              </button>

              <button
                type="button"
                onClick={() => setFeedback('UNSUITABLE')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  feedback === 'UNSUITABLE'
                    ? 'border-[#D64545] bg-red-50 text-[#D64545] ring-1 ring-[#D64545]'
                    : 'border-[#E2E9F2] text-[#5A6B82] hover:bg-[#EFF5FD]'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                부적합 (제외)
              </button>

              <button
                type="button"
                onClick={() => setFeedback('HOLD')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                  feedback === 'HOLD'
                    ? 'border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-500'
                    : 'border-[#E2E9F2] text-[#5A6B82] hover:bg-[#EFF5FD]'
                }`}
              >
                <Clock className="w-4 h-4" />
                보류 (추후 검토)
              </button>
            </div>

            {/* 사유 태그 선택 */}
            {feedback !== 'NONE' && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-[#5A6B82] mb-1.5">
                  사유 태그 선택:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeTagPool.map((tag, idx) => {
                    const isSelected = selectedReasons.includes(tag);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleReasonTag(tag)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#2F76D2] text-white border-[#2F76D2] font-semibold'
                            : 'bg-[#F4F8FD] text-[#5A6B82] border-[#E2E9F2] hover:border-[#BBD4F5]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 메모 입력 */}
            <div>
              <label className="block text-xs font-semibold text-[#5A6B82] mb-1">
                상세 메모 / 보고 의견 (선택사항)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="팀장 보고용 특이사항이나 협력사 검토 의견을 적어주세요."
                className="w-full text-xs p-2.5 rounded-xl border border-[#E2E9F2] focus:outline-none focus:border-[#2F76D2] focus:ring-1 focus:ring-[#2F76D2]"
              />
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="p-4 border-t border-[#E2E9F2] flex items-center justify-between bg-white">
          <div className="text-xs text-[#92A1B5]">
            피드백 저장은 향후 머신러닝 가중치 보정(v2)의 학습 데이터로 축적됩니다.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#5A6B82] hover:bg-[#EFF5FD] rounded-full transition-colors cursor-pointer"
            >
              닫기
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0E2947] hover:bg-[#123766] rounded-full transition-colors shadow-sm cursor-pointer"
            >
              피드백 저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
