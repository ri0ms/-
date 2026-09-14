export type BidGrade = 'A' | 'B' | 'C';

export type BidField = '유지보수' | '구축' | '설계' | '기타';

export type AgencyGroup = '기존실적' | '확장목표' | '기타';

export type FeedbackStatus = 'SUITABLE' | 'UNSUITABLE' | 'HOLD' | 'NONE';

export interface ScoreContribution {
  category: string;
  item: string;
  points: number;
  maxPoints: number;
  reason: string;
}

export interface BidItem {
  id: string; // 공고번호-차수 (예: 20260914001-00)
  bidNo: string; // 공고번호
  bidSeq: string; // 차수
  title: string; // 공고명
  agency: string; // 발주기관 / 수요기관
  agencyGroup: AgencyGroup; // 기존실적 / 확장목표 / 기타
  field: BidField; // 유지보수 / 구축 / 설계
  estimatedPrice: number; // 추정가격 (원)
  contractMethod: string; // 계약방법 (협상에 의한 계약, 제한경쟁 등)
  publishDate: string; // 공고일 (YYYY-MM-DD)
  deadlineDate: string; // 마감일 (YYYY-MM-DD HH:mm)
  dDay: number; // 마감까지 남은 일수
  matchingKeywords: string[]; // 매칭된 키워드 목록
  g2bUrl: string; // 나라장터 원문 URL
  isNew: boolean; // 신규 공고 여부
  isViewed: boolean; // 확인 완료 여부
  isBookmarked: boolean; // 관심 공고 여부
  dataSource?: 'G2B_LIVE' | 'SEED_DEMO'; // 데이터 출처 (실시간 나라장터 vs 사전 시연 샘플)

  // (주)세오 2026 회사정보 기반 맞춤 추천 필드
  seoSolutionMatch?: string; // 5대 주력 솔루션 매칭 (GCN AI, CUBE HIDE, 60GHz 단속, bluelock, 산업안전 AI)
  seoFitBadge?: string; // 예: 'GCN AI 영상감시', 'CUBE HIDE 암호화', '거점(경기/광주)'
  seoFitReasons?: string[]; // 세오 맞춤 추천 핵심 근거
  targetRegionMatch?: string; // '경기(안양/포천)', '광주(호남)', '수도권', '전국'

  // 점수 산정 결과
  score: number; // 0 ~ 100
  grade: BidGrade; // A (70+), B (40~69), C (<40)
  scoreBreakdown: ScoreContribution[];

  // 담당자 피드백
  feedback: FeedbackStatus;
  feedbackReason?: string[];
  feedbackNote?: string;
  feedbackUpdatedAt?: string;
}

export interface KeywordConfig {
  id: string;
  keyword: string;
  weight: number; // 가중치
  enabled: boolean;
  category: 'core' | 'custom';
}

export interface AgencyConfig {
  id: string;
  name: string;
  group: AgencyGroup;
  weight: number;
}

export interface ScoringWeights {
  fieldWeights: {
    유지보수: number;
    구축: number;
    설계: number;
    기타: number;
  };
  agencyWeights: {
    기존실적: number;
    확장목표: number;
    기타: number;
  };
  amountTargetAverage: number; // 기준 평균 금액 (예: 550,000,000 원)
  amountMaxWeight: number; // 금액 적합도 최대 배점 (15점)
  contractMethodWeights: {
    negotiation: number; // 협상에 의한 계약 (10점)
    restricted: number; // 제한경쟁 (6점)
    general: number; // 일반경쟁 (4점)
    other: number; // 기타 (2점)
  };
  gradeCutoffs: {
    A: number; // 70
    B: number; // 40
  };
}

export interface AppConfig {
  keywords: KeywordConfig[];
  excludedKeywords: string[];
  agencies: AgencyConfig[];
  scoringWeights: ScoringWeights;
  lastCollectedAt: string;
  autoCollectTime: string; // "06:00"
}

export interface DashboardSummary {
  todayNewCount: number;
  gradeACount: number;
  urgentCount: number; // 마감 3일 이내
  totalCount: number;
  suitableCount: number;
  lastCollectedAt: string;
}

export interface CompanyLicense {
  name: string;
  regNo: string;
  category: 'construction' | 'software' | 'engineering' | 'research';
}

export interface CompanySolution {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  certifications: string[];
  targetKeywords: string[];
}

export interface CompanyFacility {
  name: string;
  type: 'headquarters' | 'factory' | 'research';
  location: string;
  region: string;
}

export interface CompanyProfile {
  companyName: string;
  ceo: string;
  foundedDate: string;
  bizNumber: string;
  homepage: string;
  slogan: string;
  headquarters: {
    address: string;
    tel: string;
    region: string;
  };
  facilities: CompanyFacility[];
  licenses: CompanyLicense[];
  flagshipSolutions: CompanySolution[];
  keyClients: {
    powerPlants: string[];
    portsAndCustoms: string[];
    controlCenters: string[];
    defense: string[];
  };
}
