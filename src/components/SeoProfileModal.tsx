import React from 'react';
import {
  X,
  ShieldCheck,
  Building2,
  Cpu,
  Award,
  MapPin,
  FileCheck2,
  Zap,
  Factory,
} from 'lucide-react';
import { SEO_COMPANY_PROFILE } from '../data/seoCompanyProfile';

interface SeoProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SeoProfileModal: React.FC<SeoProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0E2947]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2E9F2] rounded-[24px] shadow-[0_8px_24px_rgba(14,41,71,0.15)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* 헤더 */}
        <div className="p-5 border-b border-[#E2E9F2] flex items-center justify-between bg-[#F4F8FD]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0E2947] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              SEO
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#0F1B2D]">
                  (주)세오 기업 프로필 & 맞춤 추천 기준
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#4DB5F0] text-[#0E2947] font-bold">
                  2026 최신 기준
                </span>
              </div>
              <p className="text-xs text-[#5A6B82] mt-0.5">
                융합보안기술 선도기업 · 조달우수제품 및 NEP 신제품인증 보유
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#92A1B5] hover:text-[#0F1B2D] hover:bg-[#EFF5FD] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 바디 (스크롤) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. 회사 기본 정보 카드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#EFF5FD]/50 rounded-xl border border-[#DCE9FA]">
              <div className="text-[11px] text-[#5A6B82] flex items-center gap-1 mb-1">
                <Building2 className="w-3.5 h-3.5 text-[#2F76D2]" />
                설립 / 업력
              </div>
              <div className="font-bold text-[#0F1B2D] text-sm">2004. 04. 01</div>
              <div className="text-[11px] text-[#2F76D2] font-semibold mt-0.5">22년 업력</div>
            </div>

            <div className="p-3.5 bg-[#EFF5FD]/50 rounded-xl border border-[#DCE9FA]">
              <div className="text-[11px] text-[#5A6B82] flex items-center gap-1 mb-1">
                <Building2 className="w-3.5 h-3.5 text-[#2F76D2]" />
                대표이사
              </div>
              <div className="font-bold text-[#0F1B2D] text-sm">이형각 · 김호군</div>
              <div className="text-[11px] text-[#5A6B82] mt-0.5">공동 대표체제</div>
            </div>

            <div className="p-3.5 bg-[#EFF5FD]/50 rounded-xl border border-[#DCE9FA]">
              <div className="text-[11px] text-[#5A6B82] flex items-center gap-1 mb-1">
                <Award className="w-3.5 h-3.5 text-[#2F76D2]" />
                조달 품질 등급
              </div>
              <div className="font-bold text-[#0F1B2D] text-sm">품질보증조달물품</div>
              <div className="text-[11px] text-[#127A5E] font-bold mt-0.5">B+ 등급 (조달청)</div>
            </div>

            <div className="p-3.5 bg-[#EFF5FD]/50 rounded-xl border border-[#DCE9FA]">
              <div className="text-[11px] text-[#5A6B82] flex items-center gap-1 mb-1">
                <FileCheck2 className="w-3.5 h-3.5 text-[#2F76D2]" />
                주요 인증
              </div>
              <div className="font-bold text-[#0F1B2D] text-sm">조달우수 · NEP</div>
              <div className="text-[11px] text-[#2F76D2] font-semibold mt-0.5">혁신제품 · KCMVP 암호</div>
            </div>
          </div>

          {/* 2. 제조 공장 및 연구소 거점 (지역 우위 분석용) */}
          <div className="border border-[#E2E9F2] rounded-xl p-4 bg-white">
            <div className="flex items-center gap-2 font-bold text-sm text-[#0F1B2D] mb-3">
              <Factory className="w-4 h-4 text-[#2F76D2]" />
              <span>본사, 생산공장 및 연구소 거점 (신속 출동 및 지역제한 입찰 적격)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SEO_COMPANY_PROFILE.facilities.map((fac, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#F4F8FD] border border-[#E2E9F2]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#0F1B2D]">{fac.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EFF5FD] text-[#2F76D2] border border-[#BBD4F5]">
                      {fac.region}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5A6B82] flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#92A1B5] shrink-0 mt-0.5" />
                    <span>{fac.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. 5대 핵심 솔루션 & 기술 포트폴리오 */}
          <div className="border border-[#E2E9F2] rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-[#0F1B2D]">
                <Cpu className="w-4 h-4 text-[#2F76D2]" />
                <span>(주)세오 5대 핵심 솔루션 (맞춤형 추천 알고리즘 제1순위)</span>
              </div>
              <span className="text-xs text-[#2F76D2] font-semibold">
                공고 내용 매칭 시 최고 +30점 배점 부여
              </span>
            </div>

            <div className="space-y-3">
              {SEO_COMPANY_PROFILE.flagshipSolutions.map((sol) => (
                <div
                  key={sol.id}
                  className="p-3.5 rounded-xl border border-[#E2E9F2] bg-[#F4F8FD]/50 hover:bg-[#F4F8FD] transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0F1B2D] text-sm">{sol.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-[#2F76D2] border border-[#BBD4F5] font-semibold">
                        {sol.shortName}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#127A5E] bg-[#E6F4EA] px-2 py-0.5 rounded-full">
                      {sol.category}
                    </span>
                  </div>
                  <p className="text-[#5A6B82] text-xs leading-relaxed mb-2">
                    {sol.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#E2E9F2]/70 text-[11px]">
                    <span className="text-[#92A1B5] font-semibold">주요 인증·규격:</span>
                    {sol.certifications.map((cert, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2 py-0.5 rounded bg-white text-[#0E2947] border border-[#E2E9F2] font-medium"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. 보유 면허 및 주요 타깃 발주처 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 면허 현황 */}
            <div className="p-4 rounded-xl border border-[#E2E9F2] bg-white">
              <div className="flex items-center gap-2 font-bold text-sm text-[#0F1B2D] mb-2.5">
                <FileCheck2 className="w-4 h-4 text-[#2F76D2]" />
                <span>공식 등록 면허 (직접 투찰 적격)</span>
              </div>
              <div className="space-y-2">
                {SEO_COMPANY_PROFILE.licenses.map((lic, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-[#EFF5FD]/50 border border-[#DCE9FA] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-[#0F1B2D]">{lic.name}</div>
                      <div className="text-[10px] text-[#5A6B82] font-mono">{lic.regNo}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#127A5E] font-bold border border-[#A8DAB5]">
                      보유 완료
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 주요 고객 및 타깃 발주처 */}
            <div className="p-4 rounded-xl border border-[#E2E9F2] bg-white">
              <div className="flex items-center gap-2 font-bold text-sm text-[#0F1B2D] mb-2.5">
                <ShieldCheck className="w-4 h-4 text-[#2F76D2]" />
                <span>기존 납품 실적 및 핵심 타깃 발주처</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-[#F4F8FD] border border-[#E2E9F2]">
                  <div className="font-bold text-[#0F1B2D] mb-0.5">발전사 및 에너지 기관</div>
                  <div className="text-[11px] text-[#2F76D2] font-medium">
                    {SEO_COMPANY_PROFILE.keyClients.powerPlants.join(', ')}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F4F8FD] border border-[#E2E9F2]">
                  <div className="font-bold text-[#0F1B2D] mb-0.5">항만·세관 및 공항</div>
                  <div className="text-[11px] text-[#2F76D2] font-medium">
                    {SEO_COMPANY_PROFILE.keyClients.portsAndCustoms.slice(0, 6).join(', ')} 등
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F4F8FD] border border-[#E2E9F2]">
                  <div className="font-bold text-[#0F1B2D] mb-0.5">지자체 CCTV 관제센터</div>
                  <div className="text-[11px] text-[#2F76D2] font-medium">
                    {SEO_COMPANY_PROFILE.keyClients.controlCenters.slice(0, 8).join(', ')} 등 50여 지자체
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#F4F8FD] border border-[#E2E9F2]">
                  <div className="font-bold text-[#0F1B2D] mb-0.5">국방 및 치안 기관</div>
                  <div className="text-[11px] text-[#2F76D2] font-medium">
                    {SEO_COMPANY_PROFILE.keyClients.defense.slice(0, 5).join(', ')} 등
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. 맞춤형 수주 적합도 추천 산정 원리 */}
          <div className="p-4 rounded-xl bg-[#0E2947] text-white space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#4DB5F0]">
              <Zap className="w-4 h-4" />
              <span>(주)세오 맞춤형 입찰 공고 추천 알고리즘 5대 기준</span>
            </div>
            <p className="text-white/80 text-xs leading-relaxed">
              나라장터 실시간 공고가 수집되면, 다음 5개 기준에 따라 (주)세오의 수주 가능성 점수(0~100점)가 산출되며 맞춤 제안 솔루션이 자동 매핑됩니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
              <div className="bg-white/10 p-2.5 rounded-lg border border-white/10">
                <div className="font-bold text-[#4DB5F0]">1. 5대 솔루션</div>
                <div className="text-[11px] text-white/70 mt-0.5">최대 +30점</div>
                <div className="text-[10px] text-white/60 mt-1">GCN AI, 암호화, 무인단속, 물관리, 산업안전</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-lg border border-white/10">
                <div className="font-bold text-[#4DB5F0]">2. 발주처 적합</div>
                <div className="text-[11px] text-white/70 mt-0.5">최대 +25점</div>
                <div className="text-[10px] text-white/60 mt-1">발전소, 세관, 항만, 지자체, 국방벤처</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-lg border border-white/10">
                <div className="font-bold text-[#4DB5F0]">3. 면허·사업분야</div>
                <div className="text-[11px] text-white/70 mt-0.5">최대 +18점</div>
                <div className="text-[10px] text-white/60 mt-1">정보통신, 전기공사, SW사업, 유지보수·구축</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-lg border border-white/10">
                <div className="font-bold text-[#4DB5F0]">4. 거점 및 권역</div>
                <div className="text-[11px] text-white/70 mt-0.5">최대 +15점</div>
                <div className="text-[10px] text-white/60 mt-1">경기(안양·포천), 광주(호남), 수도권 인접</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-lg border border-white/10">
                <div className="font-bold text-[#4DB5F0]">5. 계약규모·방식</div>
                <div className="text-[11px] text-white/70 mt-0.5">최대 +12점</div>
                <div className="text-[10px] text-white/60 mt-1">3억~15억 최적 규모, 협상에 의한 계약</div>
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-[#E2E9F2] flex items-center justify-between bg-white">
          <div className="text-xs text-[#5A6B82]">
            본 정보는 (주)세오 공식 사업소개서 및 기술인증서를 바탕으로 실시간 입찰 분석에 적용됩니다.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#0E2947] hover:bg-[#123766] rounded-full transition-colors cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
