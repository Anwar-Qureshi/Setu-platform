"use client";

/**
 * app/predict/page.tsx — College Predictor Page
 * Reads rank/category/stream from URL query params,
 * fetches from /api/predict-rank, and renders Safe/Probable/Dream cards.
 */

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { predictRank } from "@/lib/api";
import { CATEGORIES, STREAMS, BRANCH_EMOJI } from "@/lib/constants";
import type { CollegeResult } from "@/lib/types";
import { CollegeCard } from "@/components/predict/CollegeCard";
import { CollegeCardSkeleton } from "@/components/predict/CollegeCardSkeleton";
import { ResultsSummary } from "@/components/predict/ResultsSummary";

/* ── Tier logic ─────────────────────────────────────────────── */
function classifyTier(rank: number, cutoff: number): "safe" | "probable" | "dream" {
  const margin = cutoff - rank;
  if (margin >= 5000) return "safe";
  if (margin >= 1000) return "probable";
  return "dream";
}

function PredictContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rankParam    = searchParams.get("rank")     ?? "";
  const categoryParam = searchParams.get("category") ?? "oc_boys";
  const streamParam  = searchParams.get("stream")   ?? "MPC";

  // Local filter/edit state
  const [rank, setRank]         = useState(rankParam);
  const [category, setCategory] = useState(categoryParam);
  const [stream, setStream]     = useState(streamParam);
  const [activeTab, setActiveTab] = useState<"all" | "safe" | "probable" | "dream">("all");
  const [branchFilter, setBranchFilter] = useState("");
  const [showFilters, setShowFilters]   = useState(false);

  const rankNum = parseInt(rank, 10);
  const isValidRank = !isNaN(rankNum) && rankNum > 0;

  // TanStack Query — caches result for 10 min
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["predict", rankNum, category, stream],
    queryFn: () => predictRank({ rank: rankNum, category, stream }),
    enabled: isValidRank,
    staleTime: 10 * 60 * 1000,
  });

  // Classify and filter results
  const allResults: CollegeResult[] = data?.recommendations ?? [];
  const filtered = allResults.filter((r) => {
    if (branchFilter && !r.branch.toUpperCase().includes(branchFilter.toUpperCase())) return false;
    if (activeTab === "all") return true;
    return classifyTier(rankNum, r.cutoff) === activeTab;
  });

  const safeCount     = allResults.filter((r) => classifyTier(rankNum, r.cutoff) === "safe").length;
  const probableCount = allResults.filter((r) => classifyTier(rankNum, r.cutoff) === "probable").length;
  const dreamCount    = allResults.filter((r) => classifyTier(rankNum, r.cutoff) === "dream").length;

  const handleApply = () => {
    const n = parseInt(rank, 10);
    if (!isNaN(n) && n > 0) {
      router.push(`/predict?rank=${n}&category=${category}&stream=${stream}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Back Link ── */}
      <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors font-medium">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <h1 className="text-fluid-4xl font-heading font-extrabold tracking-[-0.03em] text-text-primary mb-6 leading-[1.05]">
        College{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-accent">
          Predictor
        </span>
      </h1>

      {/* ── Sticky Filter Bar ── */}
      <div className="sticky top-16 z-30 bg-background/70 backdrop-blur-xl border-b border-subtle py-4 mb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Rank */}
          <input
            type="number"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            placeholder="Rank"
            className="w-full sm:w-32 h-12 sm:h-10 px-3 rounded-lg bg-surface border border-subtle text-text-primary text-base sm:text-sm focus:outline-none focus:border-accent tabular-nums"
          />

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full sm:w-auto h-12 sm:h-10 px-3 rounded-lg bg-surface border border-subtle text-text-primary text-base sm:text-sm focus:outline-none focus:border-accent cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} style={{ background: "var(--surface)" }}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Stream */}
          <select
            value={stream}
            onChange={(e) => setStream(e.target.value)}
            className="w-full sm:w-auto h-12 sm:h-10 px-3 rounded-lg bg-surface border border-subtle text-text-primary text-base sm:text-sm focus:outline-none focus:border-accent cursor-pointer"
          >
            {STREAMS.map((s) => (
              <option key={s.value} value={s.value} style={{ background: "var(--surface)" }}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleApply}
            className="w-full sm:w-auto h-12 sm:h-10 px-6 rounded-lg bg-accent hover:bg-accent/90 text-white font-semibold sm:font-medium text-base sm:text-sm transition-all active:scale-95"
          >
            Update
          </button>

          {/* Branch filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto h-12 sm:h-10 px-4 rounded-lg bg-surface border border-subtle text-text-secondary hover:text-text-primary text-base sm:text-sm flex items-center justify-center gap-2 transition-colors sm:ml-auto"
          >
            <SlidersHorizontal size={16} /> Filter Branch
          </button>
        </div>

        {showFilters && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Filter by branch (e.g. CSE, ECE)"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="h-12 sm:h-10 w-full sm:w-64 px-3 rounded-lg bg-surface border border-subtle text-text-primary text-base sm:text-sm focus:outline-none focus:border-accent"
            />
          </div>
        )}
      </div>

      {/* ── Results Summary ── */}
      {data && (
        <ResultsSummary
          total={allResults.length}
          safeCount={safeCount}
          probableCount={probableCount}
          dreamCount={dreamCount}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {/* ── Error State ── */}
      {isError && (
        <div className="rounded-xl border border-dream/30 bg-dream-bg p-6 text-center">
          <p className="text-dream font-medium mb-2">Failed to load results</p>
          <p className="text-text-muted text-sm mb-4">{(error as Error)?.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-surface border border-subtle text-text-secondary hover:text-text-primary text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── No rank entered ── */}
      {!isValidRank && !isLoading && (
        <div className="text-center py-20 text-text-muted">
          <p className="text-fluid-lg">Enter your rank above to see results.</p>
        </div>
      )}

      {/* ── Results Grid ── */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <AnimatePresence mode="popLayout">
          {isLoading
            ? Array.from({ length: 9 }).map((_, i) => (
                <motion.div key={`skeleton-${i}`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <CollegeCardSkeleton />
                </motion.div>
              ))
            : filtered.map((result, idx) => (
                <motion.div
                  key={`${result.inst_code}-${result.branch}-${idx}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <CollegeCard
                    result={result}
                    tier={classifyTier(rankNum, result.cutoff)}
                    rank={rankNum}
                    category={category}
                  />
                </motion.div>
              ))}
        </AnimatePresence>
      </motion.div>

      {/* ── Empty state ── */}
      {!isLoading && isValidRank && filtered.length === 0 && data && (
        <div className="text-center py-16 text-text-muted">
          <p className="text-fluid-lg mb-2">No colleges found for this filter.</p>
          <p className="text-sm">Try changing the branch filter or switch tabs to see all results.</p>
        </div>
      )}
    </div>
  );
}

export default function PredictPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-text-muted">Loading Predictor...</div>}>
      <PredictContent />
    </Suspense>
  );
}
