/**
 * app/branches/page.tsx — Branch Explorer
 * Static page — data comes from /api/branches (our local JSON).
 */

import { Suspense } from "react";
import { BranchGrid } from "@/components/branches/BranchGrid";
import { BranchQuiz } from "@/components/branches/BranchQuiz";
import { FadeUp } from "@/components/layout/FadeUp";

export const metadata = {
  title: "Branch Explorer",
  description:
    "Understand every engineering branch — career paths, salary ranges, pros, cons, and personality fit. Built for Telangana EAMCET students.",
};

export default function BranchesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <FadeUp delay={0.05}>
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent-muted text-accent-light text-sm font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            12 Branches · Honest Career Data
          </div>
          <h1 className="text-fluid-4xl font-heading font-extrabold tracking-[-0.03em] text-text-primary mb-4 leading-[1.05]">
            Branch{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-accent">
              Explorer
            </span>
          </h1>
          <p className="text-text-secondary text-fluid-lg max-w-2xl font-medium leading-relaxed">
            Don&apos;t just pick a branch because everyone else is. Understand what
            you&apos;ll actually study, where you&apos;ll work, and how much you&apos;ll earn.
          </p>
        </div>
      </FadeUp>

      {/* Quiz — helps students identify matching branches */}
      <FadeUp delay={0.15}>
        <Suspense>
          <BranchQuiz />
        </Suspense>
      </FadeUp>

      {/* Branch cards grid */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-xl bg-surface border border-subtle animate-pulse" />
            ))}
          </div>
        }
      >
        <BranchGrid />
      </Suspense>
    </div>
  );
}

