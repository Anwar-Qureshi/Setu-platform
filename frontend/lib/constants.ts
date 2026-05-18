/**
 * lib/constants.ts
 * Shared constants used across the frontend.
 * Update counseling dates here when official 2026 schedule is released.
 */

/* ── Category Options ───────────────────────────────────────── */
// Maps display label → API value (must match Supabase column names)
export const CATEGORIES = [
  { label: "OC Boys",    value: "oc_boys" },
  { label: "OC Girls",   value: "oc_girls" },
  { label: "BC-A Boys",  value: "bc_a_boys" },
  { label: "BC-A Girls", value: "bc_a_girls" },
  { label: "BC-B Boys",  value: "bc_b_boys" },
  { label: "BC-B Girls", value: "bc_b_girls" },
  { label: "BC-C Boys",  value: "bc_c_boys" },
  { label: "BC-C Girls", value: "bc_c_girls" },
  { label: "BC-D Boys",  value: "bc_d_boys" },
  { label: "BC-D Girls", value: "bc_d_girls" },
  { label: "BC-E Boys",  value: "bc_e_boys" },
  { label: "BC-E Girls", value: "bc_e_girls" },
  { label: "SC Boys",    value: "sc_boys" },
  { label: "SC Girls",   value: "sc_girls" },
  { label: "ST Boys",    value: "st_boys" },
  { label: "ST Girls",   value: "st_girls" },
] as const;

export type CategoryValue = typeof CATEGORIES[number]["value"];

/* ── Stream Options ─────────────────────────────────────────── */
export const STREAMS = [
  { label: "MPC (Engineering)",          value: "MPC" },
  { label: "BiPC (Pharmacy/Biotech)",    value: "BIPC" },
] as const;

/* ── Fee Reimbursement Categories ──────────────────────────── */
export const FEE_CATEGORIES = [
  { label: "OC (General)",   value: "OC" },
  { label: "BC-A",           value: "BC_A" },
  { label: "BC-B",           value: "BC_B" },
  { label: "BC-C",           value: "BC_C" },
  { label: "BC-D",           value: "BC_D" },
  { label: "BC-E",           value: "BC_E" },
  { label: "SC",             value: "SC" },
  { label: "ST",             value: "ST" },
  { label: "EWS",            value: "EWS" },
] as const;

/* ── Branch Emoji Map ───────────────────────────────────────── */
export const BRANCH_EMOJI: Record<string, string> = {
  CSE:  "💻",
  ECE:  "📡",
  EEE:  "⚡",
  MECH: "⚙️",
  CIVIL: "🏗️",
  IT:   "🖥️",
  CSM:  "🤖",  // CSE (AI & ML)
  CSD:  "📊",  // CSE (Data Science)
  CSC:  "🔐",  // CSE (Cyber Security)
  CHEM: "⚗️",
  BT:   "🧬",  // Biotechnology
  PHRM: "💊",  // B.Pharm
};

/* ── Tier Classification ────────────────────────────────────── */
// These margins define Safe/Probable/Dream categorization in the frontend.
// Must match the logic in backend /api/guided-recommendation
export const TIER_MARGINS = {
  safe: 5000,     // cutoff >= rank + 5000
  probable: 1000, // cutoff >= rank + 1000
  // dream: everything else above rank
} as const;

/* ── Counseling Dates (UPDATE WHEN 2026 SCHEDULE IS RELEASED) ── */
export const COUNSELING_DATES = {
  phase1Start: new Date("2026-07-01T00:00:00+05:30"),
  phase1End:   new Date("2026-07-10T00:00:00+05:30"),
  phase2Start: new Date("2026-07-15T00:00:00+05:30"),
  phase2End:   new Date("2026-07-25T00:00:00+05:30"),
  // Update these dates once TSCHE releases the official schedule
} as const;

/* ── Suggested Questions for Rulebook AI ────────────────────── */
export const SUGGESTED_QUESTIONS = {
  en: [
    "What is local area status?",
    "What is the difference between Save and Freeze?",
    "What documents do I need for verification?",
    "Am I eligible for fee reimbursement?",
    "What is management quota?",
    "How many options should I fill?",
    "Can I change my options after saving?",
  ],
  te: [
    "లోకల్ స్టేటస్ అంటే ఏమిటి?",
    "సేవ్ మరియు ఫ్రీజ్ మధ్య తేడా ఏమిటి?",
    "వెరిఫికేషన్‌కు ఏ పత్రాలు అవసరం?",
    "ఫీ రీఇంబర్స్‌మెంట్‌కు అర్హత ఉందా?",
  ],
} as const;

/* ── Stats for Home Page ────────────────────────────────────── */
export const SETU_STATS = [
  { value: "291",    label: "Colleges" },
  { value: "2,290+", label: "Cutoff Rows" },
  { value: "163",    label: "Rulebook Pages" },
  { value: "12",     label: "Branches Explained" },
] as const;
