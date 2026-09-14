import React from 'react';
import { Search, Bell, Settings, FileSpreadsheet, RefreshCw, Bookmark, Building2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAdmin: () => void;
  onOpenExport: () => void;
  onOpenSeoProfile?: () => void;
  isFetching: boolean;
  onFetchBids: () => void;
  bookmarkedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenAdmin,
  onOpenExport,
  onOpenSeoProfile,
  isFetching,
  onFetchBids,
  bookmarkedCount,
}) => {
  return (
    <header className="h-16 px-6 bg-white border-b border-[#E2E9F2] flex items-center justify-between sticky top-0 z-20">
      {/* 로고 및 서비스 타이틀 */}
      <div className="flex items-center gap-6">
        <div
          onClick={onOpenSeoProfile}
          className="flex items-center gap-3 cursor-pointer group"
          title="(주)세오 기업 프로필 및 기술인증 보기"
        >
          <div className="w-10 h-10 rounded-full bg-[#0E2947] group-hover:bg-[#123766] transition-colors flex items-center justify-center text-white font-bold text-lg shadow-sm">
            SEO
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#0F1B2D] leading-tight group-hover:text-[#2F76D2] transition-colors">
                나라장터 입찰 대시보드
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EFF5FD] text-[#2F76D2] border border-[#DCE9FA]">
                MA사업본부 v0.1
              </span>
            </div>
            <p className="text-xs text-[#5A6B82] leading-none mt-0.5">
              (주)세오 맞춤형 수주 적합도 분석 시스템
            </p>
          </div>
        </div>

        {/* 메인 네비게이션 탭 */}
        <nav className="hidden md:flex items-center gap-6 ml-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`text-sm font-medium py-5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'text-[#2F76D2] border-[#2F76D2] font-semibold'
                : 'text-[#5A6B82] border-transparent hover:text-[#0F1B2D]'
            }`}
          >
            공고 현황 (Overview)
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`text-sm font-medium py-5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bookmarks'
                ? 'text-[#2F76D2] border-[#2F76D2] font-semibold'
                : 'text-[#5A6B82] border-transparent hover:text-[#0F1B2D]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            관심 공고
            {bookmarkedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-[#E4F4FE] text-[#2F76D2]">
                {bookmarkedCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* 중앙 검색창 */}
      <div className="relative w-64 lg:w-80">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="공고명, 발주처, 공고번호, 키워드 검색..."
          className="w-full h-10 pl-4 pr-10 text-xs rounded-full bg-[#EFF5FD] border border-[#E2E9F2] text-[#0F1B2D] placeholder-[#92A1B5] focus:outline-none focus:border-[#2F76D2] focus:ring-1 focus:ring-[#2F76D2] transition-all"
        />
        <Search className="w-4 h-4 text-[#92A1B5] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* 우측 유틸리티 & 사용자 프로필 */}
      <div className="flex items-center gap-2.5">
        {/* 세오 기업정보 모달 열기 버튼 */}
        {onOpenSeoProfile && (
          <button
            onClick={onOpenSeoProfile}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0E2947] bg-[#EFF5FD] hover:bg-[#E4F4FE] border border-[#BBD4F5] rounded-full transition-all cursor-pointer"
            title="(주)세오 5대 솔루션, 4대 거점, 면허 및 추천 기준 상세 보기"
          >
            <Building2 className="w-3.5 h-3.5 text-[#2F76D2]" />
            <span>세오 기업정보</span>
          </button>
        )}

        {/* 공고 가져오기 버튼 */}
        <button
          onClick={onFetchBids}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0E2947] hover:bg-[#123766] rounded-full transition-all cursor-pointer shadow-sm disabled:opacity-50"
          title="저장된 11종 키워드로 나라장터 일괄 검색"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>{isFetching ? '일괄 수집 중...' : '공고 가져오기'}</span>
        </button>

        {/* 엑셀 내보내기 */}
        <button
          onClick={onOpenExport}
          className="p-2 text-[#5A6B82] hover:text-[#0F1B2D] hover:bg-[#EFF5FD] rounded-full border border-[#E2E9F2] transition-colors cursor-pointer"
          title="엑셀(CSV) 내보내기"
        >
          <FileSpreadsheet className="w-4 h-4" />
        </button>

        {/* 어드민 설정 */}
        <button
          onClick={onOpenAdmin}
          className="p-2 text-[#5A6B82] hover:text-[#0F1B2D] hover:bg-[#EFF5FD] rounded-full border border-[#E2E9F2] transition-colors cursor-pointer"
          title="키워드 및 가중치 관리"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* 구분선 */}
        <div className="h-6 w-px bg-[#E2E9F2]" />

        {/* 사용자 정보 */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-[#E4F4FE] border border-[#BBD4F5] flex items-center justify-center text-[#2F76D2] font-bold text-xs">
            김
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-[#0F1B2D] leading-tight">김대리</div>
            <div className="text-[10px] text-[#92A1B5] leading-tight">MA사업본부</div>
          </div>
        </div>
      </div>
    </header>
  );
};

