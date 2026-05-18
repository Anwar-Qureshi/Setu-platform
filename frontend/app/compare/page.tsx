"use client";

/**
 * app/compare/page.tsx — College Comparator
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { compareColleges } from "@/lib/api";
import { ArrowLeft, X, Plus } from "lucide-react";
import Link from "next/link";

const SAMPLE_CODES = ["CBIT", "JNTUH", "VNRVJIET", "ANURAG", "MGIT"];

export default function ComparePage() {
  const [codes, setCodes] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const addCode = () => {
    const code = input.trim().toUpperCase();
    if (!code || codes.includes(code) || codes.length >= 3) return;
    setCodes([...codes, code]);
    setInput("");
  };

  const removeCode = (code: string) => setCodes(codes.filter((c) => c !== code));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["compare", codes],
    queryFn: () => compareColleges({ institute_codes: codes }),
    enabled: codes.length >= 2,
    staleTime: 10 * 60 * 1000,
  });

  const comparison = data?.comparison ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </Link>

      <h1 className="text-fluid-4xl font-heading font-bold text-text-primary mb-2">
        College Comparator
      </h1>
      <p className="text-text-secondary mb-8">Compare up to 3 colleges side by side.</p>

      {/* Input */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCode()}
          placeholder="Enter institute code (e.g. CBIT)"
          className="h-10 px-3 rounded-lg bg-surface border border-subtle text-text-primary text-sm focus:outline-none focus:border-accent w-64"
          disabled={codes.length >= 3}
        />
        <button
          onClick={addCode}
          disabled={codes.length >= 3 || !input.trim()}
          className="h-10 px-4 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-medium transition-all disabled:opacity-40 flex items-center gap-1"
        >
          <Plus size={14} /> Add
        </button>

        {/* Selected codes */}
        {codes.map((c) => (
          <div key={c} className="h-10 px-3 flex items-center gap-2 rounded-lg bg-accent-muted border border-accent/30 text-accent-light text-sm font-medium">
            {c}
            <button onClick={() => removeCode(c)} className="hover:text-dream transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-text-muted text-xs self-center">Try:</span>
        {SAMPLE_CODES.map((c) => (
          <button
            key={c}
            onClick={() => { if (!codes.includes(c) && codes.length < 3) setCodes([...codes, c]); }}
            className="px-2 py-1 rounded bg-surface border border-subtle text-text-muted text-xs hover:border-accent/40 hover:text-text-primary transition-all"
          >
            {c}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {codes.map((c) => (
            <div key={c} className="h-64 rounded-xl bg-surface border border-subtle animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <p className="text-dream text-sm">Failed to load comparison data. Check that the backend is running.</p>
      )}

      {/* Prompt */}
      {codes.length < 2 && !isLoading && (
        <div className="text-center py-16 border border-dashed border-subtle rounded-xl text-text-muted">
          <p>Add at least 2 college codes to compare.</p>
        </div>
      )}

      {/* Comparison Grid */}
      {comparison.length >= 2 && !isLoading && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 text-text-muted text-sm font-medium border-b border-subtle w-32">Field</th>
                {comparison.map((c) => (
                  <th key={c.inst_code} className="p-4 text-left border-b border-subtle">
                    <div className="font-heading font-semibold text-text-primary text-sm">
                      {c.college_info?.institute_name ?? c.inst_code}
                    </div>
                    <div className="text-text-muted text-xs mt-0.5">{c.inst_code}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Location",    key: "district" },
                { label: "Type",        key: "college_type" },
                { label: "Co-Ed",       key: "co_ed" },
                { label: "Tuition Fee", key: "tuition_fee" },
                { label: "Phone",       key: "phone" },
              ].map((row) => (
                <tr key={row.key} className="border-b border-subtle hover:bg-surface transition-colors">
                  <td className="p-4 text-text-muted text-sm">{row.label}</td>
                  {comparison.map((c) => (
                    <td key={c.inst_code} className="p-4 text-text-secondary text-sm">
                      {c.college_info?.[row.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Cutoff rows */}
              {comparison[0]?.cutoffs?.slice(0, 5).map((cutoffRow, idx) => (
                <tr key={idx} className="border-b border-subtle hover:bg-surface transition-colors">
                  <td className="p-4 text-text-muted text-sm">
                    <span className="font-medium">{cutoffRow.branch}</span>
                    <div className="text-xs">{cutoffRow.academic_year}</div>
                  </td>
                  {comparison.map((c) => {
                    const matchingCutoff = c.cutoffs?.find(
                      (cr) => cr.branch === cutoffRow.branch && cr.academic_year === cutoffRow.academic_year
                    );
                    return (
                      <td key={c.inst_code} className="p-4 text-text-primary text-sm tabular-nums font-medium">
                        {matchingCutoff?.oc_boys ?? "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
