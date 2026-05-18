"use client";

/**
 * components/branches/BranchQuiz.tsx
 * 3-question quiz that highlights matching branches.
 * Pure frontend logic — zero API calls.
 */

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";

const QUESTIONS = [
  {
    id: "workStyle",
    question: "Do you prefer working with…",
    options: [
      { label: "Code and software",    value: "code",     matches: ["CSE", "IT", "CSM", "CSD", "CSC"] },
      { label: "Hardware and devices", value: "hardware", matches: ["ECE", "EEE"] },
      { label: "Machines and tools",   value: "machines", matches: ["MECH", "CIVIL"] },
      { label: "Chemistry and biology", value: "bio",     matches: ["CHEM", "BT", "PHRM"] },
    ],
  },
  {
    id: "environment",
    question: "Where do you see yourself working?",
    options: [
      { label: "Office / Remote",  value: "office", matches: ["CSE", "IT", "CSM", "CSD", "CSC"] },
      { label: "Lab / Factory",    value: "lab",    matches: ["CHEM", "BT", "PHRM", "MECH"] },
      { label: "Field / Outdoors", value: "field",  matches: ["CIVIL", "EEE"] },
      { label: "Any environment",  value: "any",    matches: ["CSE", "ECE", "MECH"] },
    ],
  },
  {
    id: "goal",
    question: "What's your primary goal?",
    options: [
      { label: "High salary / startup",     value: "salary",   matches: ["CSE", "CSM", "CSC", "CSD"] },
      { label: "Stable government job",     value: "govt",     matches: ["CIVIL", "EEE", "MECH", "CHEM"] },
      { label: "Research / higher studies", value: "research", matches: ["BT", "PHRM", "CHEM"] },
      { label: "Work abroad",               value: "abroad",   matches: ["CSE", "ECE", "CSM", "MECH"] },
    ],
  },
];

export function BranchQuiz() {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [showResult, setShowResult] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelect = (questionId: string, value: string, matches: string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: matches }));
  };

  const answeredAll = Object.keys(answers).length === QUESTIONS.length;

  // Scoring: count how many questions each branch appears in
  const scores: Record<string, number> = {};
  Object.values(answers).forEach((matchList) => {
    matchList.forEach((branch) => {
      scores[branch] = (scores[branch] ?? 0) + 1;
    });
  });
  const topBranches = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([branch]) => branch);

  return (
    <div className="mb-10 p-4 sm:p-6 rounded-2xl bg-surface border border-subtle hover:border-accent/30 transition-all">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-accent-light" />
          </div>
          <h2 className="font-heading font-semibold text-text-primary text-base sm:text-lg text-left">
            Not sure which branch suits you? 
            <span className="hidden sm:inline text-text-muted font-normal text-sm ml-2">Take the quick matching quiz</span>
          </h2>
        </div>
        <div className="w-8 h-8 rounded-full border border-subtle flex items-center justify-center text-text-muted shrink-0 transition-transform">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-subtle animate-in fade-in slide-in-from-top-2 duration-300">
          {!showResult ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {QUESTIONS.map((q) => (
                  <div key={q.id}>
                    <p className="text-text-secondary text-sm font-medium mb-3">{q.question}</p>
                    <div className="flex flex-col gap-2">
                      {q.options.map((opt) => {
                        const selected = answers[q.id]?.includes(opt.matches[0]);
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleSelect(q.id, opt.value, opt.matches)}
                            className={`text-left px-3 py-2.5 rounded-lg text-sm transition-all border ${
                              selected
                                ? "border-accent bg-accent-muted text-accent-light"
                                : "border-subtle bg-surface-elevated text-text-secondary hover:border-accent/40 hover:text-text-primary"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowResult(true)}
                disabled={!answeredAll}
                className="mt-6 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Show Matching Branches →
              </button>
            </>
          ) : (
            <div>
              <p className="text-text-secondary text-sm mb-4">
                Based on your answers, these branches are a strong match:
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                {topBranches.map((branch, idx) => (
                  <a
                    key={branch}
                    href={`/branches/${branch}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-muted border border-accent/30 text-accent-light font-medium text-sm hover:bg-accent/20 transition-colors"
                  >
                    {idx === 0 && "🥇"} {idx === 1 && "🥈"} {idx === 2 && "🥉"} {branch}
                  </a>
                ))}
              </div>
              <button
                onClick={() => { setAnswers({}); setShowResult(false); }}
                className="text-text-muted text-sm hover:text-text-secondary transition-colors"
              >
                Retake quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
