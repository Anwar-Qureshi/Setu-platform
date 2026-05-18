"use client";

/**
 * app/branches/[code]/page.tsx — Branch Detail Page
 */

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBranch } from "@/lib/api";
import { BRANCH_EMOJI } from "@/lib/constants";
import { ArrowLeft, TrendingUp, Minus, TrendingDown, CheckCircle, XCircle, Briefcase } from "lucide-react";
import Link from "next/link";

function TrendBadge({ trend }: { trend: string }) {
  const isRising   = trend.includes("RISING");
  const isDeclining = trend.includes("DECLINING");
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
      isRising   ? "border-safe/30 bg-safe-soft text-safe" :
      isDeclining ? "border-dream/30 bg-dream-soft text-dream" :
                    "border-probable/30 bg-probable-soft text-probable"
    }`}>
      {isRising ? <TrendingUp size={14} /> : isDeclining ? <TrendingDown size={14} /> : <Minus size={14} />}
      {trend.split(" — ")[0]}
    </div>
  );
}

export default function BranchDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["branch", code],
    queryFn: () => getBranch(code),
    staleTime: Infinity,
  });

  const branch = data?.branch;
  const emoji = BRANCH_EMOJI[code] ?? "🎓";

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-surface rounded" />
          <div className="h-12 w-2/3 bg-surface rounded" />
          <div className="h-4 w-full bg-surface rounded" />
          <div className="h-4 w-5/6 bg-surface rounded" />
        </div>
      </div>
    );
  }

  if (isError || !branch) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
        <p className="text-dream mb-4">Branch not found.</p>
        <Link href="/branches" className="text-accent-light hover:underline">← Back to Branches</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link href="/branches" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-8 transition-colors">
        <ArrowLeft size={16} /> All Branches
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4 mb-8">
        <span className="text-5xl">{emoji}</span>
        <div>
          <h1 className="text-fluid-4xl font-heading font-bold text-text-primary mb-2">
            {branch.full_name}
          </h1>
          <div className="flex flex-wrap gap-2 items-center">
            <TrendBadge trend={branch.industry_trend} />
            <span className="px-2 py-1 rounded-md bg-surface-elevated text-text-muted text-xs">
              {branch.stream}
            </span>
          </div>
        </div>
      </div>

      {/* Story intro */}
      <div className="p-5 rounded-xl bg-surface border border-subtle mb-8">
        <h2 className="font-heading font-semibold text-text-primary mb-2">What will you actually study?</h2>
        <p className="text-text-secondary leading-relaxed">{branch.what_youll_study}</p>
      </div>

      {/* Career Paths */}
      <div className="mb-8">
        <h2 className="font-heading font-semibold text-text-primary text-fluid-xl mb-4 flex items-center gap-2">
          <Briefcase size={18} className="text-accent-light" /> Career Paths & Salaries
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {branch.career_paths.map((path, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface border border-subtle">
              <div className="font-medium text-text-primary mb-1">{path.role}</div>
              <div className="text-accent-light font-semibold text-sm mb-1 tabular-nums">{path.salary_range}</div>
              <div className="text-text-muted text-xs">{path.companies}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-5 rounded-xl bg-safe-soft border border-safe/20">
          <h3 className="font-heading font-semibold text-safe mb-3 flex items-center gap-2">
            <CheckCircle size={16} /> Pros
          </h3>
          <ul className="space-y-2">
            {branch.pros.map((pro, i) => (
              <li key={i} className="text-text-secondary text-sm flex items-start gap-2">
                <span className="text-safe mt-0.5">✓</span> {pro}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-5 rounded-xl bg-dream-soft border border-dream/20">
          <h3 className="font-heading font-semibold text-dream mb-3 flex items-center gap-2">
            <XCircle size={16} /> Cons
          </h3>
          <ul className="space-y-2">
            {branch.cons.map((con, i) => (
              <li key={i} className="text-text-secondary text-sm flex items-start gap-2">
                <span className="text-dream mt-0.5">✗</span> {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Best For */}
      <div className="p-5 rounded-xl bg-accent-muted border border-accent/20 mb-8">
        <h3 className="font-heading font-semibold text-accent-light mb-2">🎯 Best For</h3>
        <p className="text-text-secondary">{branch.best_for}</p>
      </div>

      {/* Industry Trend */}
      <div className="p-5 rounded-xl bg-surface border border-subtle mb-10">
        <h3 className="font-heading font-semibold text-text-primary mb-2">📈 Industry Trend</h3>
        <p className="text-text-secondary">{branch.industry_trend}</p>
      </div>

      {/* CTA */}
      <Link
        href={`/predict?stream=${branch.stream}`}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold transition-all hover:shadow-[0_0_24px_var(--accent-glow)] active:scale-95"
      >
        Find Colleges Offering {branch.code} →
      </Link>
    </div>
  );
}
