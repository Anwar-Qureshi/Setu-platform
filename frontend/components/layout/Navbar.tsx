"use client";

/**
 * components/layout/Navbar.tsx
 * Top navigation — Logo, page links, Language toggle, Countdown timer.
 * Sticky on scroll with glass morphism effect.
 */

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { useLanguage } from "./Providers";
import { COUNSELING_DATES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* ── Countdown Hook ─────────────────────────────────────────── */
function useCounselingCountdown() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    const target = COUNSELING_DATES.phase1Start;
    const diff = target.getTime() - now.getTime();
    if (diff > 0) {
      setDays(Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
  }, []);

  return days;
}

/* ── Nav Links ──────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: "/predict",  label: "Predict" },
  { href: "/branches", label: "Branches" },
  { href: "/compare",  label: "Compare" },
  { href: "/options",  label: "Options" },
  { href: "/ask",      label: "Ask AI" },
  { href: "/guide",    label: "Guide Me" },
];

/* ── Component ──────────────────────────────────────────────── */
export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const countdown = useCounselingCountdown();

  // Add glass effect on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "glass border-subtle"
          : "bg-background border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0 group"
        >
          {/* Custom logo */}
          <Image
            src="/logo.png"
            alt="Setu Logo"
            width={36}
            height={36}
            className="w-9 h-9 rounded-xl object-cover shadow-sm group-hover:shadow-[0_0_16px_var(--accent-glow)] transition-all group-hover:-translate-y-0.5"
          />
          <span className="font-heading font-bold text-xl tracking-tight text-text-primary">
            Setu
          </span>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm transition-colors font-medium",
                pathname === link.href
                  ? "bg-accent-muted text-accent-light"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Right Side Controls ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Countdown pill */}
          {countdown !== null && countdown > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-muted border border-accent/30 text-accent-light text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Phase 1 in {countdown}d
            </div>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === "en" ? "te" : "en")}
            className="px-3 py-1.5 rounded-md text-sm font-medium border border-subtle text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all touch-target"
            title="Switch language"
            aria-label={language === "en" ? "Switch to Telugu" : "Switch to English"}
          >
            {language === "en" ? "తెలుగు" : "English"}
          </button>

          {/* Ask AI shortcut (mobile) */}
          <Link
            href="/ask"
            className="md:hidden touch-target rounded-md text-text-secondary hover:text-accent transition-colors"
            aria-label="Ask AI"
          >
            <MessageCircle size={20} />
          </Link>

          {/* Hamburger (mobile) */}
          <button
            className="md:hidden touch-target rounded-md text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu Dropdown ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-subtle bg-surface px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-accent-muted text-accent-light"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
              )}
            >
              {link.label}
            </Link>
          ))}
          {/* Countdown in mobile menu */}
          {countdown !== null && countdown > 0 && (
            <div className="mt-2 px-3 py-2 rounded-md bg-accent-muted text-accent-light text-xs">
              Counseling Phase 1 starts in {countdown} days
            </div>
          )}
        </div>
      )}
    </header>
  );
}
