/**
 * lib/api.ts
 * All Axios API calls — typed, centralized, and environment-aware.
 * API_BASE reads from NEXT_PUBLIC_API_URL so the same code
 * works both locally (localhost:8000) and in production.
 */

import axios from "axios";
import type {
  PredictRankRequest,
  PredictRankResponse,
  AskRulebookRequest,
  RulebookResponse,
  EvaluateOptionsRequest,
  EvaluateOptionsResponse,
  CompareCollegesRequest,
  CollegeComparison,
  PeerInsightsRequest,
  PeerInsightsResponse,
  FeeCheckRequest,
  FeeCheckResponse,
  GuidedRecommendationRequest,
  GuidedRecommendationResponse,
  BranchDetail,
  BranchSummary,
} from "./types";

/* ── Axios Instance ─────────────────────────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30s — Gemini/Groq can be slow on first call
  headers: {
    "Content-Type": "application/json",
  },
});

/* ── Error Interceptor — normalize errors ───────────────────── */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.detail ??
      error?.message ??
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

/* ── Endpoint 1: Predict Rank ───────────────────────────────── */
export async function predictRank(
  req: PredictRankRequest
): Promise<PredictRankResponse> {
  const { data } = await api.post<PredictRankResponse>(
    "/api/predict-rank",
    req
  );
  return data;
}

/* ── Endpoint 2: Ask Rulebook AI ────────────────────────────── */
export async function askRulebook(
  req: AskRulebookRequest
): Promise<RulebookResponse> {
  const { data } = await api.post<RulebookResponse>(
    "/api/ask-rulebook",
    req
  );
  return data;
}

/* ── Endpoint 3: Evaluate Options ──────────────────────────── */
export async function evaluateOptions(
  req: EvaluateOptionsRequest
): Promise<EvaluateOptionsResponse> {
  const { data } = await api.post<EvaluateOptionsResponse>(
    "/api/evaluate-options",
    req
  );
  return data;
}

/* ── Endpoint 4: List All Branches ─────────────────────────── */
export async function listBranches(): Promise<{ status: string; branches: BranchSummary[] }> {
  const { data } = await api.get("/api/branches");
  return data;
}

/* ── Endpoint 5: Get Single Branch Detail ──────────────────── */
export async function getBranch(
  code: string
): Promise<{ status: string; branch: BranchDetail }> {
  const { data } = await api.get(`/api/branches/${code}`);
  return data;
}

/* ── Endpoint 6: Compare Colleges ──────────────────────────── */
export async function compareColleges(
  req: CompareCollegesRequest
): Promise<{ status: string; comparison: CollegeComparison[] }> {
  const { data } = await api.post("/api/compare-colleges", req);
  return data;
}

/* ── Endpoint 7: Peer Insights ──────────────────────────────── */
export async function getPeerInsights(
  req: PeerInsightsRequest
): Promise<PeerInsightsResponse> {
  const { data } = await api.post<PeerInsightsResponse>(
    "/api/peer-insights",
    req
  );
  return data;
}

/* ── Endpoint 8: Fee Reimbursement Check ────────────────────── */
export async function checkFeeReimbursement(
  req: FeeCheckRequest
): Promise<FeeCheckResponse> {
  const { data } = await api.post<FeeCheckResponse>("/api/fee-check", req);
  return data;
}

/* ── Endpoint 9: Guided Recommendation ─────────────────────── */
export async function getGuidedRecommendation(
  req: GuidedRecommendationRequest
): Promise<GuidedRecommendationResponse> {
  const { data } = await api.post<GuidedRecommendationResponse>(
    "/api/guided-recommendation",
    req
  );
  return data;
}
