"use client";

/**
 * components/predict/ResultsSummary.tsx
 * Animated tab bar with a sliding underline indicator (Framer Motion layoutId).
 */

import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tab = "all" | "safe" | "probable" | "dream";

interface ResultsSummaryProps {
  total: number;
  safeCount: number;
  probableCount: number;
  dreamCount: number;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: {
  key: Tab;
  label: string;
  dot: string;
  activeText: string;
  activeBg: string;
  activeDot: string;
}[] = [
  {
    key: "all",
    label: "All Results",
    dot: "bg-text-muted",
    activeText: "text-text-primary",
    activeBg: "bg-surface-elevated",
    activeDot: "bg-accent",
  },
  {
    key: "safe",
    label: "Safe",
    dot: "bg-safe/40",
    activeText: "text-safe",
    activeBg: "bg-safe/10",
    activeDot: "bg-safe",
  },
  {
    key: "probable",
    label: "Probable",
    dot: "bg-probable/40",
    activeText: "text-probable",
    activeBg: "bg-probable/10",
    activeDot: "bg-probable",
  },
  {
    key: "dream",
    label: "Dream",
    dot: "bg-dream/40",
    activeText: "text-dream",
    activeBg: "bg-dream/10",
    activeDot: "bg-dream",
  },
];

export function ResultsSummary({
  total,
  safeCount,
  probableCount,
  dreamCount,
  activeTab,
  onTabChange,
}: ResultsSummaryProps) {
  const counts: Record<Tab, number> = {
    all: total,
    safe: safeCount,
    probable: probableCount,
    dream: dreamCount,
  };

  return (
    <div className="mb-6">
      {/* Tab Strip */}
      <div
        role="tablist"
        className="relative flex items-center gap-1 p-1 rounded-2xl bg-surface/60 backdrop-blur-md border border-subtle w-full sm:w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = counts[tab.key];

          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.key)}
              className="relative flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {/* Sliding background pill (Framer Motion layoutId trick) */}
              {isActive && (
                <motion.div
                  layoutId="active-tab-bg"
                  className={cn("absolute inset-0 rounded-xl border border-white/5", tab.activeBg)}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  style={{
                    boxShadow: "0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                />
              )}

              {/* Content — sits above the sliding bg */}
              <span className="relative z-10 flex items-center gap-2">
                {/* Coloured dot */}
                <span
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors duration-300",
                    isActive ? tab.activeDot : tab.dot
                  )}
                />
                {/* Label */}
                <span
                  className={cn(
                    "transition-colors duration-200",
                    isActive ? tab.activeText : "text-text-muted"
                  )}
                >
                  {tab.label}
                </span>
                {/* Count badge */}
                <motion.span
                  key={count}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-bold tabular-nums flex items-center justify-center transition-colors duration-200",
                    isActive
                      ? "bg-white/10 text-text-primary"
                      : "bg-surface-elevated text-text-muted"
                  )}
                >
                  {count}
                </motion.span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Result count line below */}
      <motion.p
        key={`${activeTab}-${counts[activeTab]}`}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-3 text-xs text-text-muted font-medium pl-1"
      >
        Showing{" "}
        <span className="text-text-secondary font-bold">
          {counts[activeTab]}
        </span>{" "}
        {activeTab === "all" ? "total" : activeTab} college
        {counts[activeTab] !== 1 ? "s" : ""}
      </motion.p>
    </div>
  );
}
