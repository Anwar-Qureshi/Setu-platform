"use client";

/**
 * components/layout/Providers.tsx
 * Wraps the app with TanStack Query and Language context.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, createContext, useContext } from "react";
import type { Language } from "@/lib/types";

/* ── Language Context ───────────────────────────────────────── */
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

/* ── Providers ──────────────────────────────────────────────── */
export function Providers({ children }: { children: React.ReactNode }) {
  // TanStack Query client — created once per app instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 60 * 1000, // 10 minutes default
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Language — persisted in localStorage
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("setu-lang") as Language) ?? "en";
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("setu-lang", lang);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageContext.Provider value={{ language, setLanguage }}>
        {children}
      </LanguageContext.Provider>
    </QueryClientProvider>
  );
}
