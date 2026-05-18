/**
 * components/layout/Footer.tsx
 * Minimal footer with disclaimer, data source, and links.
 */

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-subtle mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

          {/* Brand */}
          <div>
            <div className="font-heading font-bold text-text-primary mb-1">
              Setu
            </div>
            <p className="text-text-muted text-sm max-w-sm">
              Built for Telangana students. Not affiliated with TSCHE or any government body.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
            <Link href="/predict"  className="hover:text-text-primary transition-colors">Predict</Link>
            <Link href="/branches" className="hover:text-text-primary transition-colors">Branches</Link>
            <Link href="/compare"  className="hover:text-text-primary transition-colors">Compare</Link>
            <Link href="/ask"      className="hover:text-text-primary transition-colors">Ask AI</Link>
            <Link href="/guide"    className="hover:text-text-primary transition-colors">Guide Me</Link>
          </nav>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-6 border-t border-subtle">
          <p className="text-text-muted text-xs leading-relaxed max-w-3xl">
            <strong className="text-text-secondary">Data Notice:</strong>{" "}
            College cutoffs and fee data are based on 2024–25 official records.
            2026 data will be updated as soon as it is released by TSCHE.
            Always cross-verify with the official{" "}
            <a
              href="https://tgeapcet.nic.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-light hover:underline"
            >
              TGEAPCET portal
            </a>{" "}
            before making decisions.
          </p>
          <p className="text-text-muted text-xs mt-2">
            © {new Date().getFullYear()} Setu. Made with ❤️ for students.
          </p>
        </div>
      </div>
    </footer>
  );
}
