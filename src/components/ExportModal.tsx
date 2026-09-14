import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Check } from 'lucide-react';
import { BidItem } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bids: BidItem[];
  bookmarkedBids: BidItem[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  bids,
  bookmarkedBids,
}) => {
  if (!isOpen) return null;

  const [exportType, setExportType] = useState<'all' | 'bookmarks' | 'gradeA'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const getTargetBids = () => {
    if (exportType === 'bookmarks') return bookmarkedBids;
    if (exportType === 'gradeA') return bids.filter((b) => b.grade === 'A');
    return bids;
  };

  const handleDownloadCSV = () => {
    setIsExporting(true);
    const target = getTargetBids();

    const headers = [
      '공고번호',
      '차수',
      '등급',
      '적합도점수',
      '공고명',
      '발주기관',
      '발주처구분',
      '사업분야',
      '추정가격(원)',
      '계약방법',
      '공고일',
      '마감일',
      '매칭키워드',
      '담당자피드백',
      '나라장터링크',
    ];

    const rows = target.map((b) => [
      `"${b.bidNo}"`,
      `"${b.bidSeq}"`,
      `"${b.grade}"`,
      b.score,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.agency.replace(/"/g, '""')}"`,
      `"${b.agencyGroup}"`,
      `"${b.field}"`,
      b.estimatedPrice,
      `"${b.contractMethod}"`,
      `"${b.publishDate}"`,
      `"${b.deadlineDate}"`,
      `"${b.matchingKeywords.join(', ')}"`,
      `"${b.feedback}"`,
      `"${b.g2bUrl}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `세오_나라장터_입찰공고_${exportType}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsExporting(false);
      onClose();
    }, 500);
  };

  const targetCount = getTargetBids().length;

  return (
    <div className="fixed inset-0 z-50 bg-[#0E2947]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2E9F2] rounded-[24px] shadow-[0_8px_24px_rgba(14,41,71,0.15)] w-full max-w-md p-6 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E9F2]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EFF5FD] text-[#2F76D2] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#0F1B2D]">입찰공고 엑셀(CSV) 내보내기</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#92A1B5] hover:text-[#0F1B2D] p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3 text-xs">
          <p className="text-[#5A6B82]">내보낼 공고 목록의 범위를 선택하세요:</p>

          <label
            onClick={() => setExportType('all')}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
              exportType === 'all'
                ? 'border-[#2F76D2] bg-[#EFF5FD]'
                : 'border-[#E2E9F2] hover:bg-gray-50'
            }`}
          >
            <div>
              <div className="font-bold text-[#0F1B2D]">현재 조회된 전체 목록</div>
              <div className="text-[11px] text-[#5A6B82]">점수 및 필터가 적용된 전체 공고</div>
            </div>
            <span className="font-bold text-[#2F76D2]">{bids.length}건</span>
          </label>

          <label
            onClick={() => setExportType('gradeA')}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
              exportType === 'gradeA'
                ? 'border-[#2F76D2] bg-[#EFF5FD]'
                : 'border-[#E2E9F2] hover:bg-gray-50'
            }`}
          >
            <div>
              <div className="font-bold text-[#0F1B2D]">A등급 수주 유망 공고만</div>
              <div className="text-[11px] text-[#5A6B82]">70점 이상 최우선 검토 대상</div>
            </div>
            <span className="font-bold text-[#2F76D2]">
              {bids.filter((b) => b.grade === 'A').length}건
            </span>
          </label>

          <label
            onClick={() => setExportType('bookmarks')}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
              exportType === 'bookmarks'
                ? 'border-[#2F76D2] bg-[#EFF5FD]'
                : 'border-[#E2E9F2] hover:bg-gray-50'
            }`}
          >
            <div>
              <div className="font-bold text-[#0F1B2D]">관심 공고 (북마크 목록)</div>
              <div className="text-[11px] text-[#5A6B82]">팀장 보고용으로 지정한 공고</div>
            </div>
            <span className="font-bold text-[#2F76D2]">{bookmarkedBids.length}건</span>
          </label>
        </div>

        <div className="pt-4 border-t border-[#E2E9F2] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#5A6B82] hover:bg-[#EFF5FD] rounded-full cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleDownloadCSV}
            disabled={targetCount === 0 || isExporting}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#0E2947] hover:bg-[#123766] rounded-full shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? '생성 중...' : `${targetCount}건 CSV 다운로드`}
          </button>
        </div>
      </div>
    </div>
  );
};
