"use client";

/**
 * components/home/HeroInput.tsx
 * The main rank entry form on the home page.
 * On submit → redirects to /predict with query params.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { CATEGORIES, STREAMS } from "@/lib/constants";

export function HeroInput() {
  const router = useRouter();
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("oc_boys");
  const [stream, setStream] = useState("MPC");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rankNum = parseInt(rank, 10);

    if (!rank || isNaN(rankNum) || rankNum < 1) {
      setError("Please enter a valid rank (e.g. 15420)");
      return;
    }
    if (rankNum > 200000) {
      setError("Rank should be below 2,00,000");
      return;
    }

    setError("");
    router.push(
      `/predict?rank=${rankNum}&category=${category}&stream=${stream}`
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Rank Input */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Enter your rank (e.g. 15420)"
            value={rank}
            onChange={(e) => {
              setRank(e.target.value);
              setError("");
            }}
            className="w-full h-14 pl-11 pr-4 rounded-xl bg-surface border border-subtle text-text-primary placeholder:text-text-muted text-fluid-base focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all tabular-nums"
            aria-label="Enter your EAMCET rank"
          />
        </div>

        {/* Category Select */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-14 px-4 rounded-xl bg-surface border border-subtle text-text-primary text-fluid-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all cursor-pointer"
          aria-label="Select category"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value} style={{ background: "var(--surface)" }}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Stream Select */}
        <select
          value={stream}
          onChange={(e) => setStream(e.target.value)}
          className="h-14 px-4 rounded-xl bg-surface border border-subtle text-text-primary text-fluid-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all cursor-pointer"
          aria-label="Select stream"
        >
          {STREAMS.map((s) => (
            <option key={s.value} value={s.value} style={{ background: "var(--surface)" }}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Submit CTA */}
        <button
          type="submit"
          className="h-14 px-6 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-fluid-base transition-all hover:shadow-[0_0_24px_var(--accent-glow)] active:scale-95 whitespace-nowrap"
          aria-label="Find my colleges"
        >
          Find Colleges →
        </button>
      </div>

      {/* Validation error */}
      {error && (
        <p className="mt-2 text-dream text-sm text-left pl-1" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
