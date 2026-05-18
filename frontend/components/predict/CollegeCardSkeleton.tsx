/**
 * components/predict/CollegeCardSkeleton.tsx
 * Matches exact dimensions of the new CollegeCard — no layout shift on load.
 */

import { Skeleton } from "@/components/ui/skeleton";

export function CollegeCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-[#111111] border border-white/[0.06] flex flex-col gap-3 animate-pulse">
      {/* Top bar: tier pill + emoji */}
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-16 rounded-full bg-surface-elevated" />
        <Skeleton className="h-9 w-9 rounded-xl bg-surface-elevated" />
      </div>

      {/* Branch code + name */}
      <div>
        <Skeleton className="h-3 w-10 mb-1.5 bg-surface-elevated" />
        <Skeleton className="h-3 w-24 bg-surface-elevated" />
      </div>

      {/* College name */}
      <Skeleton className="h-5 w-full bg-surface-elevated" />
      <Skeleton className="h-4 w-2/3 bg-surface-elevated" />

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-xl bg-surface-elevated" />
        <Skeleton className="h-16 rounded-xl bg-surface-elevated" />
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between mb-1.5">
          <Skeleton className="h-2.5 w-20 bg-surface-elevated" />
          <Skeleton className="h-2.5 w-10 bg-surface-elevated" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full bg-surface-elevated" />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-auto">
        <Skeleton className="h-10 flex-1 rounded-xl bg-surface-elevated" />
        <Skeleton className="h-10 w-10 rounded-xl bg-surface-elevated" />
      </div>
    </div>
  );
}
