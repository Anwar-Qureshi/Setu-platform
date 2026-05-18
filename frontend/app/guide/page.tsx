"use client";

/**
 * app/guide/page.tsx — Guided Counseling Flow
 * 5-step wizard. Step encoded in URL for browser back/forward support.
 */

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getGuidedRecommendation } from "@/lib/api";
import { CATEGORIES, STREAMS, BRANCH_EMOJI } from "@/lib/constants";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { CollegeCard } from "@/components/predict/CollegeCard";
import Link from "next/link";

const STEPS = ["Basics", "Your Options", "Understand Branches", "Build List", "Action Plan"];

function GuideContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = parseInt(searchParams.get("step") ?? "1", 10);
  const step = Math.max(1, Math.min(5, isNaN(stepParam) ? 1 : stepParam));

  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("oc_boys");
  const [stream, setStream] = useState("MPC");

  const rankNum = parseInt(rank, 10);
  const isValidRank = !isNaN(rankNum) && rankNum > 0;

  const setStep = (s: number) => router.push(`/guide?step=${s}`);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["guided", rankNum, category, stream],
    queryFn: () => getGuidedRecommendation({ rank: rankNum, category, stream }),
    enabled: false, // manual trigger
  });

  const handleStep1Submit = async () => {
    if (!isValidRank) return;
    await refetch();
    setStep(2);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        {STEPS.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = stepNum === step;
          const isDone = stepNum < step;
          return (
            <div key={label} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => isDone && setStep(stepNum)}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  isActive  ? "bg-accent text-white" :
                  isDone    ? "bg-safe text-white cursor-pointer hover:opacity-80" :
                              "bg-surface border border-subtle text-text-muted"
                }`}
              >
                {isDone ? <CheckCircle size={14} /> : stepNum}
              </button>
              <span className={`text-xs hidden sm:block ${isActive ? "text-text-primary font-medium" : "text-text-muted"}`}>
                {label}
              </span>
              {idx < STEPS.length - 1 && (
                <div className={`w-6 h-px ${isDone ? "bg-safe" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: Basics ── */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-fluid-4xl font-heading font-bold text-text-primary mb-3">
            Let&apos;s figure this out together 👋
          </h1>
          <p className="text-text-secondary mb-8">
            You just got your rank. Don&apos;t panic. Give us 5 minutes and we&apos;ll have a clear plan.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-text-secondary text-sm mb-2 font-medium">Your EAMCET Rank</label>
              <input
                type="number"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="e.g. 15420"
                className="w-full h-12 px-4 rounded-xl bg-surface border border-subtle text-text-primary focus:outline-none focus:border-accent tabular-nums text-lg transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary text-sm mb-2 font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-surface border border-subtle text-text-primary focus:outline-none focus:border-accent cursor-pointer text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} style={{ background: "var(--surface)" }}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text-secondary text-sm mb-2 font-medium">Stream</label>
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-surface border border-subtle text-text-primary focus:outline-none focus:border-accent cursor-pointer text-sm"
                >
                  {STREAMS.map((s) => (
                    <option key={s.value} value={s.value} style={{ background: "var(--surface)" }}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <button
            onClick={handleStep1Submit}
            disabled={!isValidRank || isLoading}
            className="mt-8 w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95"
          >
            {isLoading ? "Finding options..." : <>Show My Options <ArrowRight size={18} /></>}
          </button>
        </div>
      )}

      {/* ── STEP 2: Results ── */}
      {step === 2 && data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-fluid-4xl font-heading font-bold text-text-primary mb-2">
            Here&apos;s what&apos;s available for you
          </h2>
          <p className="text-text-secondary mb-6">Rank: <strong className="text-text-primary tabular-nums">{rankNum.toLocaleString("en-IN")}</strong> · {category} · {stream}</p>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Safe", count: data.summary.safe_count, cls: "text-safe bg-safe-soft border-safe/20" },
              { label: "Probable", count: data.summary.probable_count, cls: "text-probable bg-probable-soft border-probable/20" },
              { label: "Dream", count: data.summary.dream_count, cls: "text-dream bg-dream-soft border-dream/20" },
            ].map((t) => (
              <div key={t.label} className={`p-4 rounded-xl border text-center ${t.cls}`}>
                <div className="text-2xl font-bold tabular-nums">{t.count}</div>
                <div className="text-sm font-medium mt-1">{t.label}</div>
              </div>
            ))}
          </div>

          <p className="text-text-secondary text-sm mb-6">
            You have <strong className="text-text-primary">{data.summary.total_options} total options</strong>.
            {data.summary.safe_count > 5 && " Great news — you have many safe choices!"}
            {data.summary.safe_count <= 3 && " Focus on your probable options — they're your best bet."}
          </p>

          {/* Top 3 safe */}
          <h3 className="font-heading font-semibold text-text-primary mb-3">Your top safe options:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {data.safe_colleges.slice(0, 4).map((r) => (
              <CollegeCard key={`${r.inst_code}-${r.branch}`} result={r} tier="safe" rank={rankNum} category={category} />
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-subtle text-text-secondary text-sm hover:text-text-primary transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={() => setStep(3)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-accent hover:bg-accent/90 text-white font-medium text-sm transition-all active:scale-95">
              Next: Understand Branches <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Branches ── */}
      {step === 3 && data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-fluid-4xl font-heading font-bold text-text-primary mb-3">
            Branches available to you
          </h2>
          <p className="text-text-secondary mb-6">These are the branches you can realistically get into. Tap any to learn more.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {data.available_branches.map((b) => (
              <Link key={b.code} href={`/branches/${b.code}`}
                className="flex items-start gap-3 p-4 rounded-xl bg-surface border border-subtle hover:border-accent/40 hover:bg-surface-elevated transition-all group"
              >
                <span className="text-2xl">{BRANCH_EMOJI[b.code] ?? "🎓"}</span>
                <div>
                  <div className="font-medium text-text-primary text-sm group-hover:text-accent-light transition-colors">{b.full_name}</div>
                  <div className="text-text-muted text-xs mt-0.5 line-clamp-2">{b.best_for}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-subtle text-text-secondary text-sm hover:text-text-primary transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={() => setStep(4)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-accent hover:bg-accent/90 text-white font-medium text-sm transition-all active:scale-95">
              Next: Build Your List <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Build List ── */}
      {step === 4 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-fluid-4xl font-heading font-bold text-text-primary mb-3">
            Build your options list
          </h2>
          <p className="text-text-secondary mb-8">
            Go to the Predictor and tap <strong className="text-text-primary">&quot;+ Add to Options&quot;</strong> on each college you want.
            Then come back here to continue.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/predict" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-subtle text-text-primary font-medium text-sm hover:border-accent/40 transition-all">
              Go to Predictor
            </Link>
            <Link href="/options" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-subtle text-text-primary font-medium text-sm hover:border-accent/40 transition-all">
              Open Option Builder
            </Link>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(3)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-subtle text-text-secondary text-sm hover:text-text-primary transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={() => setStep(5)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-accent hover:bg-accent/90 text-white font-medium text-sm transition-all active:scale-95">
              Next: My Action Plan <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: Action Plan ── */}
      {step === 5 && data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-fluid-4xl font-heading font-bold text-text-primary mb-3">
            Your Action Plan 🎯
          </h2>
          <p className="text-text-secondary mb-8">Follow these steps in order. Don&apos;t skip any.</p>
          <div className="space-y-3 mb-8">
            {data.next_steps.map((stepText, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-subtle">
                <div className="w-7 h-7 rounded-full bg-accent-muted text-accent-light text-sm font-bold flex items-center justify-center shrink-0">{idx + 1}</div>
                <p className="text-text-secondary text-sm leading-relaxed">{stepText}</p>
              </div>
            ))}
          </div>
          <div className="p-5 rounded-xl border border-dream/30 bg-dream-soft">
            <p className="text-dream font-semibold text-sm">⚠ Critical Reminder</p>
            <p className="text-text-secondary text-sm mt-1">
              Always use <strong className="text-text-primary">SAVE</strong> when submitting your options.
              Never click <strong className="text-dream">FREEZE</strong> until you are 100% sure on the last day.
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setStep(4)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-subtle text-text-secondary text-sm hover:text-text-primary transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
            <Link href="/" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-surface border border-subtle text-text-primary font-medium text-sm hover:border-accent/40 transition-all">
              Done — Back to Home
            </Link>
          </div>
        </div>
      )}

      {/* If step > 1 but no data */}
      {step > 1 && !data && !isLoading && (
        <div className="text-center py-16 text-text-muted">
          <p className="mb-4">Please start from Step 1 to load your data.</p>
          <button onClick={() => setStep(1)} className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium">
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-16 text-center text-text-muted">Loading Guide...</div>}>
      <GuideContent />
    </Suspense>
  );
}
