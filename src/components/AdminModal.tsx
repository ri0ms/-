import React, { useState } from 'react';
import {
  X,
  Sliders,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Building2,
  ShieldAlert,
  Award,
  DollarSign,
  Save,
} from 'lucide-react';
import { AppConfig, KeywordConfig } from '../types';
import { DEFAULT_CONFIG } from '../utils/scoring';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'keywords' | 'agencies' | 'weights'>('keywords');
  const [formData, setFormData] = useState<AppConfig>(JSON.parse(JSON.stringify(config)));
  const [newKeyword, setNewKeyword] = useState('');
  const [newKeywordWeight, setNewKeywordWeight] = useState(15);
  const [newExcludedKeyword, setNewExcludedKeyword] = useState('');
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // Keyword operations
  const handleKeywordWeightChange = (id: string, weight: number) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.map((k) => (k.id === id ? { ...k, weight } : k)),
    }));
  };

  const handleKeywordToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.map((k) => (k.id === id ? { ...k, enabled: !k.enabled } : k)),
    }));
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    const newItem: KeywordConfig = {
      id: `kw-${Date.now()}`,
      keyword: newKeyword.trim(),
      weight: newKeywordWeight,
      enabled: true,
      category: 'custom',
    };
    setFormData((prev) => ({
      ...prev,
      keywords: [...prev.keywords, newItem],
    }));
    setNewKeyword('');
  };

  const handleDeleteKeyword = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k.id !== id),
    }));
  };

  // Excluded keywords operations
  const handleAddExcludedKeyword = () => {
    if (!newExcludedKeyword.trim()) return;
    if (formData.excludedKeywords.includes(newExcludedKeyword.trim())) return;
    setFormData((prev) => ({
      ...prev,
      excludedKeywords: [...prev.excludedKeywords, newExcludedKeyword.trim()],
    }));
    setNewExcludedKeyword('');
  };

  const handleDeleteExcludedKeyword = (kw: string) => {
    setFormData((prev) => ({
      ...prev,
      excludedKeywords: prev.excludedKeywords.filter((k) => k !== kw),
    }));
  };

  // Reset to default
  const handleReset = () => {
    if (window.confirm('모든 가중치 및 키워드 설정을 세오 초기 기본값으로 초기화하시겠습니까?')) {
      setFormData(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
    }
  };

  const handleSave = () => {
    onSaveConfig(formData);
    setSaveSuccessToast(true);
    setTimeout(() => {
      setSaveSuccessToast(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E2947]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2E9F2] rounded-[24px] shadow-[0_8px_24px_rgba(14,41,71,0.15)] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* 모달 헤더 */}
        <div className="p-5 border-b border-[#E2E9F2] flex items-center justify-between bg-[#F4F8FD]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0E2947] text-white flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F1B2D]">
                어드민 설정: 키워드 및 수주 점수 가중치 관리
              </h2>
              <p className="text-xs text-[#5A6B82]">
                가중치 변경 시 전체 공고 점수와 A/B/C 등급이 즉시 재계산됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#92A1B5] hover:text-[#0F1B2D] hover:bg-[#EFF5FD] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-[#E2E9F2] px-6 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('keywords')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'keywords'
                ? 'border-[#2F76D2] text-[#2F76D2]'
                : 'border-transparent text-[#5A6B82] hover:text-[#0F1B2D]'
            }`}
          >
            11종 핵심 키워드 ({formData.keywords.length})
          </button>
          <button
            onClick={() => setActiveTab('agencies')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'agencies'
                ? 'border-[#2F76D2] text-[#2F76D2]'
                : 'border-transparent text-[#5A6B82] hover:text-[#0F1B2D]'
            }`}
          >
            발주처 가중치 그룹 ({formData.agencies.length})
          </button>
          <button
            onClick={() => setActiveTab('weights')}
            className={`py-3 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'weights'
                ? 'border-[#2F76D2] text-[#2F76D2]'
                : 'border-transparent text-[#5A6B82] hover:text-[#0F1B2D]'
            }`}
          >
            분야/금액/계약방식 배점
          </button>
        </div>

        {/* 탭 콘텐츠 영역 */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: 키워드 관리 */}
          {activeTab === 'keywords' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#0F1B2D] text-sm">
                    세오 사업확장 핵심 키워드 11종
                  </h3>
                  <span className="text-[#5A6B82]">
                    슬라이더로 키워드별 기여 점수를 조절하세요.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.keywords.map((kw) => (
                    <div
                      key={kw.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                        kw.enabled ? 'bg-white border-[#E2E9F2]' : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={kw.enabled}
                          onChange={() => handleKeywordToggle(kw.id)}
                          className="w-4 h-4 rounded text-[#2F76D2] focus:ring-[#2F76D2] cursor-pointer"
                        />
                        <span className="font-bold text-sm text-[#0F1B2D]">{kw.keyword}</span>
                        {kw.category === 'core' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EFF5FD] text-[#2F76D2]">
                            기본
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="5"
                          max="30"
                          step="1"
                          value={kw.weight}
                          onChange={(e) => handleKeywordWeightChange(kw.id, Number(e.target.value))}
                          disabled={!kw.enabled}
                          className="w-20 accent-[#2F76D2]"
                        />
                        <span className="font-bold text-[#2F76D2] w-8 text-right tabular-nums">
                          +{kw.weight}
                        </span>
                        {kw.category === 'custom' && (
                          <button
                            onClick={() => handleDeleteKeyword(kw.id)}
                            className="text-[#D64545] hover:opacity-80 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 새 키워드 추가 */}
                <div className="mt-4 p-3 bg-[#EFF5FD] rounded-xl border border-[#DCE9FA] flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="새 검색 키워드 입력 (예: 스마트폴)"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    className="h-8 px-3 rounded-lg border border-[#E2E9F2] bg-white flex-1 min-w-[160px] focus:outline-none focus:border-[#2F76D2]"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[#5A6B82]">배점:</span>
                    <input
                      type="number"
                      min="5"
                      max="30"
                      value={newKeywordWeight}
                      onChange={(e) => setNewKeywordWeight(Number(e.target.value))}
                      className="w-16 h-8 px-2 rounded-lg border border-[#E2E9F2] bg-white text-center font-bold"
                    />
                  </div>
                  <button
                    onClick={handleAddKeyword}
                    className="h-8 px-3 bg-[#0E2947] text-white rounded-lg font-semibold flex items-center gap-1 hover:bg-[#123766] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    키워드 추가
                  </button>
                </div>
              </div>

              {/* 제외 키워드 관리 */}
              <div className="pt-4 border-t border-[#E2E9F2]">
                <h3 className="font-bold text-[#0F1B2D] text-sm mb-2">제외 키워드 관리</h3>
                <p className="text-[#5A6B82] mb-3">
                  공고명에 다음 단어가 포함된 공고는 감점 또는 비추천(C등급) 처리됩니다.
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {formData.excludedKeywords.map((ex, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full bg-red-50 text-[#D64545] border border-red-200 flex items-center gap-1 font-medium"
                    >
                      {ex}
                      <button
                        onClick={() => handleDeleteExcludedKeyword(ex)}
                        className="hover:text-red-900 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="제외 키워드 입력"
                    value={newExcludedKeyword}
                    onChange={(e) => setNewExcludedKeyword(e.target.value)}
                    className="h-8 px-3 rounded-lg border border-[#E2E9F2] bg-white max-w-xs focus:outline-none focus:border-[#2F76D2]"
                  />
                  <button
                    onClick={handleAddExcludedKeyword}
                    className="h-8 px-3 bg-white border border-[#E2E9F2] hover:bg-[#EFF5FD] rounded-lg font-semibold cursor-pointer"
                  >
                    추가
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 발주처 관리 */}
          {activeTab === 'agencies' && (
            <div className="space-y-6">
              {/* 기존 실적 발주처 (25점) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-[#0F1B2D] text-sm flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#2F76D2]" />
                    기존 수주실적 발주처 (가중치 {formData.scoringWeights.agencyWeights.기존실적}점)
                  </h3>
                  <span className="text-[11px] text-[#127A5E] font-semibold bg-[#E6F4EA] px-2 py-0.5 rounded-full">
                    실적 우위 기관
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {formData.agencies
                    .filter((a) => a.group === '기존실적')
                    .map((ag) => (
                      <div
                        key={ag.id}
                        className="p-2.5 bg-white border border-[#BBD4F5] rounded-xl flex items-center justify-between"
                      >
                        <span className="font-semibold text-[#0F1B2D]">{ag.name}</span>
                        <span className="text-[#2F76D2] font-bold">+{ag.weight}점</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* 확장 목표 발주처 (20점) */}
              <div className="pt-4 border-t border-[#E2E9F2]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-[#0F1B2D] text-sm flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#5A6BE0]" />
                    사업확장 목표 발주처 (가중치 {formData.scoringWeights.agencyWeights.확장목표}점)
                  </h3>
                  <span className="text-[11px] text-[#5A6BE0] font-semibold bg-[#EBEDFC] px-2 py-0.5 rounded-full">
                    타깃 진입 기관
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {formData.agencies
                    .filter((a) => a.group === '확장목표')
                    .map((ag) => (
                      <div
                        key={ag.id}
                        className="p-2.5 bg-white border border-[#E2E9F2] rounded-xl flex items-center justify-between"
                      >
                        <span className="font-medium text-[#0F1B2D]">{ag.name}</span>
                        <span className="text-[#5A6BE0] font-bold">+{ag.weight}점</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 세부 배점 및 등급 컷오프 */}
          {activeTab === 'weights' && (
            <div className="space-y-6">
              {/* 분야별 배점 (실적 건수 비례) */}
              <div>
                <h3 className="font-bold text-[#0F1B2D] text-sm mb-2">
                  사업분야 가중치 (실적 59건 비례)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white border border-[#E2E9F2] rounded-xl">
                    <div className="font-semibold text-[#0F1B2D] mb-1">유지보수 분야 (최다실적)</div>
                    <div className="text-[11px] text-[#5A6B82] mb-2">39건 / 143억원</div>
                    <input
                      type="number"
                      value={formData.scoringWeights.fieldWeights.유지보수}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scoringWeights: {
                            ...formData.scoringWeights,
                            fieldWeights: {
                              ...formData.scoringWeights.fieldWeights,
                              유지보수: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="w-full h-8 px-2 border rounded font-bold text-[#2F76D2] text-center"
                    />
                  </div>

                  <div className="p-3 bg-white border border-[#E2E9F2] rounded-xl">
                    <div className="font-semibold text-[#0F1B2D] mb-1">구축 분야 (주력)</div>
                    <div className="text-[11px] text-[#5A6B82] mb-2">18건 / 173억원</div>
                    <input
                      type="number"
                      value={formData.scoringWeights.fieldWeights.구축}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scoringWeights: {
                            ...formData.scoringWeights,
                            fieldWeights: {
                              ...formData.scoringWeights.fieldWeights,
                              구축: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="w-full h-8 px-2 border rounded font-bold text-[#2F76D2] text-center"
                    />
                  </div>

                  <div className="p-3 bg-white border border-[#E2E9F2] rounded-xl">
                    <div className="font-semibold text-[#0F1B2D] mb-1">설계/감리 분야</div>
                    <div className="text-[11px] text-[#5A6B82] mb-2">2건 / 10억원</div>
                    <input
                      type="number"
                      value={formData.scoringWeights.fieldWeights.설계}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scoringWeights: {
                            ...formData.scoringWeights,
                            fieldWeights: {
                              ...formData.scoringWeights.fieldWeights,
                              설계: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="w-full h-8 px-2 border rounded font-bold text-[#2F76D2] text-center"
                    />
                  </div>
                </div>
              </div>

              {/* 계약방식 및 금액 배점 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E2E9F2]">
                <div className="p-3 bg-white border border-[#E2E9F2] rounded-xl">
                  <h4 className="font-bold text-[#0F1B2D] mb-2">계약방식 가점</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>협상에 의한 계약:</span>
                      <input
                        type="number"
                        value={formData.scoringWeights.contractMethodWeights.negotiation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scoringWeights: {
                              ...formData.scoringWeights,
                              contractMethodWeights: {
                                ...formData.scoringWeights.contractMethodWeights,
                                negotiation: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-16 h-7 text-center border rounded font-bold"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>제한경쟁:</span>
                      <input
                        type="number"
                        value={formData.scoringWeights.contractMethodWeights.restricted}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scoringWeights: {
                              ...formData.scoringWeights,
                              contractMethodWeights: {
                                ...formData.scoringWeights.contractMethodWeights,
                                restricted: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-16 h-7 text-center border rounded font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 등급 컷오프 */}
                <div className="p-3 bg-white border border-[#E2E9F2] rounded-xl">
                  <h4 className="font-bold text-[#0F1B2D] mb-2">등급 부여 구간 기준</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#0E2947]">A등급 최저 컷오프:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={formData.scoringWeights.gradeCutoffs.A}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              scoringWeights: {
                                ...formData.scoringWeights,
                                gradeCutoffs: {
                                  ...formData.scoringWeights.gradeCutoffs,
                                  A: Number(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-16 h-7 text-center border rounded font-bold text-[#0E2947]"
                        />
                        <span>점 이상</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#2F76D2]">B등급 최저 컷오프:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={formData.scoringWeights.gradeCutoffs.B}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              scoringWeights: {
                                ...formData.scoringWeights,
                                gradeCutoffs: {
                                  ...formData.scoringWeights.gradeCutoffs,
                                  B: Number(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-16 h-7 text-center border rounded font-bold text-[#2F76D2]"
                        />
                        <span>점 이상</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="p-4 border-t border-[#E2E9F2] flex items-center justify-between bg-white">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#5A6B82] hover:text-[#D64545] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기값으로 복원
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#5A6B82] hover:bg-[#EFF5FD] rounded-full cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#0E2947] hover:bg-[#123766] rounded-full shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {saveSuccessToast ? '저장 및 재계산 완료!' : '가중치 저장 및 즉시 재계산'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
