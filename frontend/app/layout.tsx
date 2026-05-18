import type { Metadata, Viewport } from "next";
import { Inter, Geist, Geist_Mono, Noto_Sans_Telugu } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Toaster } from "sonner";

/* ── Fonts ─────────────────────────────────────────────────── */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const notoTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-telugu",
  display: "swap",
});

/* ── SEO Metadata ───────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: "Setu — Your EAMCET College & Counseling Guide",
    template: "%s | Setu",
  },
  description:
    "Setu helps Telangana EAMCET students find the right college. Get rank-based predictions, counseling rulebook answers, option strategy guidance, and branch career insights — all free.",
  keywords: [
    "EAMCET college predictor",
    "TG EAPCET counseling",
    "Telangana engineering counseling",
    "EAMCET rank calculator",
    "college options list",
    "fee reimbursement Telangana",
    "EAMCET branch guide",
  ],
  openGraph: {
    title: "Setu — Your EAMCET College & Counseling Guide",
    description:
      "Find colleges, understand branches, plan options. Built for Telangana students.",
    type: "website",
    locale: "en_IN",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
};

/* ── Root Layout ────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geist.variable} ${geistMono.variable} ${notoTelugu.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col antialiased">
        <SmoothScroll>
          {/* TanStack Query + Language Provider */}
          <Providers>
            {/* Top navigation bar */}
            <Navbar />

            {/* Page content */}
            <main className="flex-1">
              {children}
            </main>

            {/* Footer */}
            <Footer />

            {/* Toast notifications (Sonner) */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                },
              }}
            />
          </Providers>
        </SmoothScroll>
      </body>
    </html>
  );
}
