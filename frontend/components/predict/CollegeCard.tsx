"use client";

/**
 * components/predict/CollegeCard.tsx
 * Premium luxury card with Framer Motion hover lift and glow micro-interactions.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, BarChart2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { CollegeResult, Tier, DraftOption } from "@/lib/types";
import { BRANCH_EMOJI } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CollegeCardProps {
  result: CollegeResult;
  tier: Tier;
  rank: number;
  category: string;
}

const TIER_CONFIG = {
  safe: {
    label: "Safe",
    textClass: "text-safe",
    bgClass: "bg-safe/10",
    borderClass: "border-safe/40",
    fillClass: "bg-safe",
    glowColor: "rgba(34,197,94,0.12)",
    dotColor: "#22c55e",
  },
  probable: {
    label: "Probable",
    textClass: "text-probable",
    bgClass: "bg-probable/10",
    borderClass: "border-probable/40",
    fillClass: "bg-probable",
    glowColor: "rgba(234,179,8,0.12)",
    dotColor: "#eab308",
  },
  dream: {
    label: "Dream",
    textClass: "text-dream",
    bgClass: "bg-dream/10",
    borderClass: "border-dream/40",
    fillClass: "bg-dream",
    glowColor: "rgba(239,68,68,0.12)",
    dotColor: "#ef4444",
  },
};

export function CollegeCard({ result, tier, rank, category }: CollegeCardProps) {
  const config = TIER_CONFIG[tier];
  const emoji = BRANCH_EMOJI[result.branch] ?? "🎓";

  // Start false; sync from localStorage on the client only (avoids SSR hydration mismatch)
  const [added, setAdded] = useState(false);

  useEffect(() => {
    try {
      const existing: DraftOption[] = JSON.parse(
        localStorage.getItem("setu-options") ?? "[]"
      );
      if (existing.some((o) => o.institute_code === result.inst_code && o.branch === result.branch)) {
        setAdded(true);
      }
    } catch {
      // localStorage unavailable — keep false
    }
  }, [result.inst_code, result.branch]);

  const addToOptions = () => {
    const existing: DraftOption[] = JSON.parse(
      localStorage.getItem("setu-options") ?? "[]"
    );
    const alreadyAdded = existing.some(
      (o) => o.institute_code === result.inst_code && o.branch === result.branch
    );
    if (alreadyAdded) {
      toast.info("Already in your options list.");
      return;
    }
    const updated: DraftOption[] = [
      ...existing,
      {
        priority: existing.length + 1,
        institute_code: result.inst_code,
        institute_name: result.institute_name,
        branch: result.branch,
        branch_name: result.branch_name,
      },
    ];
    localStorage.setItem("setu-options", JSON.stringify(updated));
    setAdded(true);
    toast.success(`Added: ${result.institute_name} — ${result.branch}`);
  };

  const margin = result.cutoff - rank;
  const barWidth = Math.min(100, Math.max(2, ((margin + 2000) / 10000) * 100));

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative p-5 rounded-2xl bg-[#111111] border transition-colors duration-300 overflow-hidden flex flex-col",
        config.borderClass
      )}
      style={{
        boxShadow: "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Hover glow bleed — tier-coloured radial behind content */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${config.glowColor}, transparent 70%)`,
        }}
        whileHover={{ opacity: 1 }}
      />

      {/* Top bar — tier badge left, branch emoji right */}
      <div className="flex items-start justify-between mb-4">
        {/* Tier pill */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
            config.bgClass,
            config.textClass,
            config.borderClass
          )}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: config.dotColor }}
          />
          {config.label}
        </div>

        {/* Branch emoji badge */}
        <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-white/5 flex items-center justify-center text-xl shadow-inner">
          {emoji}
        </div>
      </div>

      {/* Branch code + name */}
      <div className="mb-3">
        <span className={cn("text-xs font-bold tracking-wider uppercase", config.textClass)}>
          {result.branch}
        </span>
        <p className="text-text-muted text-[11px] font-medium mt-0.5 leading-tight">
          {result.branch_name}
        </p>
      </div>

      {/* College name */}
      <h3 className="font-heading font-bold text-text-primary text-base leading-snug mb-4 flex-1">
        {result.institute_name}
      </h3>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="bg-surface/60 rounded-xl p-3 border border-white/[0.04]">
          <div className="text-text-muted text-[10px] font-semibold uppercase tracking-wider mb-1">
            Cutoff Rank
          </div>
          <div className={cn("font-bold text-base tabular-nums", config.textClass)}>
            {result.cutoff.toLocaleString("en-IN")}
          </div>
        </div>

        {result.tuition_fee ? (
          <div className="bg-surface/60 rounded-xl p-3 border border-white/[0.04]">
            <div className="text-text-muted text-[10px] font-semibold uppercase tracking-wider mb-1">
              Tuition Fee
            </div>
            <div className="text-text-secondary font-bold text-base">
              ₹{result.tuition_fee}
            </div>
          </div>
        ) : (
          <div className="bg-surface/60 rounded-xl p-3 border border-white/[0.04]">
            <div className="text-text-muted text-[10px] font-semibold uppercase tracking-wider mb-1">
              Margin
            </div>
            <div className={cn("font-bold text-base tabular-nums", config.textClass)}>
              {margin > 0 ? "+" : ""}{margin.toLocaleString("en-IN")}
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-text-muted text-[10px] font-semibold uppercase tracking-wider">
            Safety Margin
          </span>
          <span className={cn("text-xs font-bold tabular-nums", config.textClass)}>
            {margin > 0 ? "+" : ""}{margin.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", config.fillClass)}
            initial={{ width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto">
        <motion.button
          onClick={addToOptions}
          whileTap={{ scale: 0.96 }}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-sm font-bold transition-all duration-200",
            added
              ? "bg-safe/15 text-safe border border-safe/30"
              : "bg-accent/10 hover:bg-accent/20 text-accent-light border border-accent/20 hover:border-accent/40"
          )}
        >
          {added ? (
            <>
              <CheckCircle2 size={14} />
              Added
            </>
          ) : (
            <>
              <Plus size={14} />
              Add to Options
            </>
          )}
        </motion.button>

        <Link
          href={`/compare?add=${result.inst_code}`}
          title="Compare this college"
          className="flex items-center justify-center gap-1.5 h-10 w-10 rounded-xl bg-surface-elevated hover:bg-border border border-white/[0.06] text-text-secondary hover:text-text-primary transition-all duration-200"
        >
          <BarChart2 size={15} />
        </Link>
      </div>
    </motion.div>
  );
}
