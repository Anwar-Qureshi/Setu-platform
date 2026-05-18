/**
 * lib/types.ts
 * TypeScript types matching our FastAPI Pydantic schemas exactly.
 * If the backend schema changes, update here first.
 */

/* ── API Request Types ─────────────────────────────────────── */

export interface PredictRankRequest {
  rank: number;
  category: string; // e.g. "oc_boys", "bc_a_girls", "sc_boys"
  stream: string;   // "MPC" or "BIPC"
}

export interface AskRulebookRequest {
  query: string;
  language?: "en" | "te"; // default "en"
}

export interface OptionItem {
  priority: number;
  institute_code: string;
  branch: string;
}

export interface EvaluateOptionsRequest {
  rank: number;
  category: string;
  options: OptionItem[];
}

export interface CompareCollegesRequest {
  institute_codes: string[]; // 2 or 3 codes
  branch?: string;           // optional filter
}

export interface PeerInsightsRequest {
  rank: number;
  category: string;
  stream: string;
  rank_range?: number; // default 2000
}

export interface FeeCheckRequest {
  category: string;       // "OC", "BC_A", "SC", "ST", "EWS" etc.
  family_income: number;  // annual rupees
  college_type?: string;  // "university" or "private"
}

export interface GuidedRecommendationRequest {
  rank: number;
  category: string;
  stream: string;
}

/* ── API Response Types ─────────────────────────────────────── */

export interface CollegeResult {
  institute_name: string;
  inst_code: string;
  branch: string;
  branch_name: string;
  cutoff: number;
  tuition_fee?: string;
}

export interface PredictRankResponse {
  status: string;
  user_rank: number;       // backend field name
  category: string;
  total_chances: number;  // backend field name
  recommendations: CollegeResult[]; // backend field name
}

export interface RulebookResponse {
  status: string;
  answer: string;
  language: string;
}

export interface EvaluateOptionsResponse {
  status: string;
  feedback: string;
}

export interface CareerPath {
  role: string;
  salary_range: string;
  companies: string;
}

export interface BranchDetail {
  full_name: string;
  code: string;
  stream: string;
  what_youll_study: string;
  career_paths: CareerPath[];
  pros: string[];
  cons: string[];
  best_for: string;
  industry_trend: string;
}

export interface BranchSummary {
  code: string;
  full_name: string;
  stream: string;
  best_for: string;
  industry_trend: string;
}

export interface CollegeComparison {
  inst_code: string;
  college_info: Record<string, string>;
  cutoffs: Record<string, string>[];
}

export interface PeerInsightsResponse {
  status: string;
  rank_window: string;
  total_seats_in_range: number;
  popular_branches: { branch: string; count: number }[];
  sample_colleges: CollegeResult[];
}

export interface FeeCheckResponse {
  status: string;
  eligible: boolean;
  category: string;
  family_income: number;
  reason: string;
  coverage: string;
  disclaimer: string;
}

export interface GuidedRecommendationResponse {
  status: string;
  student: { rank: number; category: string; stream: string };
  summary: {
    total_options: number;
    safe_count: number;
    probable_count: number;
    dream_count: number;
  };
  safe_colleges: CollegeResult[];
  probable_colleges: CollegeResult[];
  dream_colleges: CollegeResult[];
  available_branches: BranchSummary[];
  next_steps: string[];
}

/* ── Frontend Types ─────────────────────────────────────────── */

export type Language = "en" | "te";

export type Stream = "MPC" | "BIPC";

export type Tier = "safe" | "probable" | "dream";

// A student's draft options list (stored in localStorage)
export interface DraftOption {
  priority: number;
  institute_code: string;
  institute_name: string;
  branch: string;
  branch_name: string;
}
