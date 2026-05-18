"use client";

/**
 * components/branches/BranchGrid.tsx
 * Fetches all branches from /api/branches and renders cards.
 */

import { useQuery } from "@tanstack/react-query";
import { listBranches } from "@/lib/api";
import { BRANCH_EMOJI } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp, Minus, TrendingDown } from "lucide-react";

function TrendIcon({ trend }: { trend: string }) {
  if (trend.includes("RISING")) return <TrendingUp size={14} className="text-safe" />;
  if (trend.includes("DECLINING")) return <TrendingDown size={14} className="text-dream" />;
  return <Minus size={14} className="text-probable" />;
}

const BRANCH_IMAGES: Record<string, string> = {
  CSE:   "/branches/cse.png",
  ECE:   "/branches/ece.png",
  EEE:   "/branches/eee.png",
  MECH:  "/branches/mech.png",
  CIVIL: "/branches/civil.png",
  IT:    "/branches/it.png",
  CSM:   "/branches/ai.png",    // CSE (AI & ML)
  CSD:   "/branches/ds.png",    // CSE (Data Science)
  CSC:   "/branches/cyber.png", // CSE (Cyber Security)
  CHEM:  "/branches/chem.png",
  BT:    "/branches/biotech.png",
  PHRM:  "/branches/pharma.png",
};

export function BranchGrid() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["branches"],
    queryFn: listBranches,
    staleTime: Infinity, // static data — never re-fetch
  });

  if (isError) {
    return (
      <div className="text-center py-12 text-dream">
        Failed to load branch data. Please ensure the backend is running.
      </div>
    );
  }

  const branches = data?.branches ?? [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {isLoading
        ? Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-52 rounded-xl bg-surface border border-subtle animate-pulse" />
          ))
        : branches.map((branch) => {
            const emoji = BRANCH_EMOJI[branch.code] ?? "🎓";
            const trendShort = branch.industry_trend.split(" — ")[0];

            return (
              <Link
                key={branch.code}
                href={`/branches/${branch.code}`}
                className="group block rounded-2xl border border-subtle overflow-hidden relative card-glow h-[320px] transition-all duration-500 hover:shadow-[0_8px_32px_rgba(124,58,237,0.15)] hover:-translate-y-1 flex flex-col justify-end p-6"
              >
                {/* Background Image / Gradient */}
                {BRANCH_IMAGES[branch.code] ? (
                  <div className="absolute inset-0 z-0 bg-background">
                    <Image 
                      src={BRANCH_IMAGES[branch.code]} 
                      alt={`${branch.code} Abstract Concept`} 
                      fill 
                      className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 ease-out mix-blend-screen" 
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_var(--accent-muted)_0%,_var(--surface)_100%)] opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                )}
                
                {/* Gradient Overlay for Text Legibility */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/80 to-transparent" />

                {/* Content */}
                <div className="relative z-20 mt-auto">
                  <div className="flex items-center justify-between mb-3">
                    {/* Emoji badge fallback */}
                    <span className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-xl shadow-lg border border-white/5">
                      {emoji}
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-elevated/80 backdrop-blur-md border border-white/5 text-xs font-medium text-text-primary shadow-lg">
                      <TrendIcon trend={branch.industry_trend} />
                      {trendShort}
                    </div>
                  </div>

                {/* Name */}
                <h2 className="font-heading font-semibold text-text-primary text-fluid-lg mb-2 group-hover:text-accent-light transition-colors leading-snug">
                  {branch.full_name}
                </h2>

                  {/* Stream badge */}
                  <div className="inline-block px-2 py-0.5 rounded-md bg-surface-elevated/50 backdrop-blur-md border border-white/5 text-text-muted text-xs mb-3">
                    {branch.stream}
                  </div>

                  {/* Best for */}
                  <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed">
                    {branch.best_for}
                  </p>

                  {/* CTA */}
                  <div className="mt-4 flex items-center gap-1.5 text-accent-light text-sm font-medium opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    Explore branch <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            );
          })}
    </div>
  );
}
