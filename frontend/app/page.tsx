/**
 * app/page.tsx — Home / Landing Page
 * Static page — no API calls. Sets the tone for the entire product.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SETU_STATS } from "@/lib/constants";
import { HeroInput } from "@/components/home/HeroInput";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { FadeUp } from "@/components/layout/FadeUp";

export default function HomePage() {
  return (
    <>
      {/* ── HERO SECTION ─────────────────────────────────────── */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent-glow)_0%,_transparent_70%)] opacity-70 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center relative z-10">
          
          <FadeUp delay={0.1}>
            {/* Pill label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent-muted text-accent-light text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Free · No Login · Telangana EAMCET
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            {/* Main headline - Display Typography with tight tracking */}
            <h1 className="text-fluid-6xl font-heading font-extrabold tracking-[-0.04em] text-text-primary mb-4 leading-[1.05]">
              Your Rank.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-light to-accent">Your Future.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.3}>
            {/* Subheadline */}
            <p className="text-fluid-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Enter your EAMCET rank and let Setu find every college seat that belongs to you.
              Counseling guidance, branch insights, and AI answers — all in one place.
            </p>
          </FadeUp>

          <FadeUp delay={0.4}>
            {/* Rank Input — interactive client component */}
            <HeroInput />
          </FadeUp>

          <FadeUp delay={0.5}>
            {/* OR Guide Me */}
            <p className="mt-6 text-text-muted text-sm font-medium">
              Not sure where to start?{" "}
              <Link href="/guide" className="text-accent-light hover:text-accent transition-colors">
                Let us guide you step by step →
              </Link>
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <FadeUp delay={0.2}>
        <section className="border-y border-subtle bg-surface/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x md:divide-subtle">
              {SETU_STATS.map((stat) => (
                <div key={stat.label} className="text-center px-4">
                  <div className="text-fluid-2xl font-heading font-bold text-accent-light tabular-nums tracking-[-0.02em]">
                    {stat.value}
                  </div>
                  <div className="text-fluid-sm text-text-muted mt-0.5 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeUp>

      {/* ── FEATURE CARDS (BENTO GRID) ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <FadeUp delay={0.1}>
          <div className="text-center mb-14">
            <h2 className="text-fluid-4xl font-heading font-extrabold tracking-[-0.03em] text-text-primary mb-4">
              Everything a student needs
            </h2>
            <p className="text-text-secondary text-fluid-lg max-w-xl mx-auto font-medium">
              From rank prediction to rulebook answers — built specifically for the Telangana EAMCET counseling journey.
            </p>
          </div>
        </FadeUp>

        {/* Client Component for animated Bento Grid */}
        <FeatureGrid />
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <FadeUp delay={0.2}>
          <div className="rounded-3xl bg-surface border border-subtle p-8 md:p-14 text-center relative overflow-hidden shadow-2xl">
            {/* Background glow */}
            <div className="absolute inset-0 hero-gradient pointer-events-none opacity-50" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--accent-glow)_0%,_transparent_70%)] opacity-40 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-fluid-4xl font-heading font-extrabold tracking-[-0.03em] text-text-primary mb-4">
                Seat set karo apna 🎯
              </h2>
              <p className="text-text-secondary text-fluid-lg mb-10 max-w-lg mx-auto font-medium">
                Don&apos;t leave your college seat to chance. Use data, not panic.
              </p>
              <Link
                href="/predict"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-fluid-base transition-all hover:shadow-[0_0_32px_var(--accent-glow)] active:scale-95"
              >
                Find My Colleges <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>
    </>
  );
}
