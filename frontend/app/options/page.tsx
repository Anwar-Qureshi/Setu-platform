"use client";

/**
 * app/options/page.tsx — Option Builder + Strategy Guard
 * Drag-and-drop list using @dnd-kit.
 * Options stored in localStorage + shareable via URL.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, AlertTriangle, CheckCircle, Printer, Share2, Trash2, Search, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { evaluateOptions } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import type { DraftOption } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ── Sortable Item ──────────────────────────────────────────── */
function SortableItem({ option, onRemove }: { option: DraftOption; onRemove: (code: string, branch: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${option.institute_code}-${option.branch}`,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl bg-surface border border-subtle transition-all",
        isDragging && "opacity-50 shadow-lg border-accent/50"
      )}
    >
      {/* Priority number */}
      <span className="text-text-muted text-sm tabular-nums w-6 text-center shrink-0">
        {option.priority}
      </span>

      {/* Drag handle */}
      <button
        className="touch-target text-text-muted hover:text-text-secondary cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>

      {/* College info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-text-primary text-sm truncate">{option.institute_name}</div>
        <div className="text-text-muted text-xs">{option.branch} · {option.branch_name}</div>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(option.institute_code, option.branch)}
        className="touch-target text-text-muted hover:text-dream transition-colors"
        aria-label="Remove option"
      >
        <X size={16} />
      </button>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function OptionsPage() {
  const [options, setOptions] = useState<DraftOption[]>([]);
  const [feedback, setFeedback] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("oc_boys");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("setu-options");
    if (saved) {
      const parsed: DraftOption[] = JSON.parse(saved);
      setOptions(parsed.map((o, i) => ({ ...o, priority: i + 1 })));
    }
  }, []);

  // Save to localStorage whenever options change
  useEffect(() => {
    localStorage.setItem("setu-options", JSON.stringify(options));
  }, [options]);

  // Debounced strategy evaluation
  const runEvaluation = useCallback(
    async (currentOptions: DraftOption[], currentRank: number, currentCategory: string) => {
      if (currentOptions.length < 1) { setFeedback(""); return; }
      setIsEvaluating(true);
      try {
        const res = await evaluateOptions({
          rank: currentRank || 50000,
          category: currentCategory,
          options: currentOptions.map((o) => ({
            priority: o.priority,
            institute_code: o.institute_code,
            branch: o.branch,
          })),
        });
        setFeedback(res.feedback);
      } catch {
        setFeedback("Could not evaluate. Ensure the backend is running.");
      } finally {
        setIsEvaluating(false);
      }
    },
    []
  );

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      runEvaluation(options, parseInt(rank) || 50000, category);
    }, 1500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, rank, category]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOptions((items) => {
      const oldIndex = items.findIndex((i) => `${i.institute_code}-${i.branch}` === active.id);
      const newIndex = items.findIndex((i) => `${i.institute_code}-${i.branch}` === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      return reordered.map((o, i) => ({ ...o, priority: i + 1 }));
    });
  };

  const removeOption = (code: string, branch: string) => {
    setOptions((prev) => {
      const filtered = prev.filter((o) => !(o.institute_code === code && o.branch === branch));
      return filtered.map((o, i) => ({ ...o, priority: i + 1 }));
    });
    toast.success("Removed from list.");
  };

  const clearAll = () => {
    setOptions([]);
    setFeedback("");
    localStorage.removeItem("setu-options");
    toast.info("Options list cleared.");
  };

  const shareList = () => {
    const encoded = options
      .map((o) => `${o.institute_code}-${o.branch}`)
      .join(",");
    const url = `${window.location.origin}/options?list=${encodeURIComponent(encoded)}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Shareable link copied to clipboard!");
    });
  };

  const printList = () => window.print();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-fluid-4xl font-heading font-bold text-text-primary mb-2">
        Option Builder
      </h1>
      <p className="text-text-secondary mb-8">
        Build your web options list. Drag to reorder. The AI reviews your strategy automatically.
      </p>

      {/* Rank input for better evaluation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <input
          type="number"
          value={rank}
          onChange={(e) => setRank(e.target.value)}
          placeholder="Your rank (for AI feedback)"
          className="h-12 sm:h-10 px-3 rounded-lg bg-surface border border-subtle text-text-primary text-base sm:text-sm focus:outline-none focus:border-accent w-full sm:w-64 tabular-nums"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-12 sm:h-10 px-3 rounded-lg bg-surface border border-subtle text-text-primary text-base sm:text-sm focus:outline-none focus:border-accent cursor-pointer w-full sm:w-auto"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <a
          href="/predict"
          className="h-12 sm:h-10 px-4 rounded-lg bg-surface border border-subtle text-text-secondary hover:text-text-primary text-base sm:text-sm flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
        >
          <Search size={16} /> Import from Predictor
        </a>
      </div>

      {/* Strategy Guard Panel */}
      <div className={cn(
        "mb-6 p-5 rounded-xl border transition-all",
        isEvaluating ? "border-border bg-surface animate-pulse" :
        feedback ? "border-accent/30 bg-accent-muted" : "border-subtle bg-surface"
      )}>
        <div className="flex items-center gap-2 mb-2 font-medium text-sm">
          {isEvaluating
            ? <><span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" /> Groq is analyzing your list...</>
            : <><AlertTriangle size={14} className="text-accent-light" /> Strategy Guard (Powered by Groq Llama-3)</>
          }
        </div>
        {!isEvaluating && feedback && (
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{feedback}</p>
        )}
        {!isEvaluating && !feedback && (
          <p className="text-text-muted text-sm">Add colleges to your list. AI feedback will appear here automatically.</p>
        )}
        {/* Always-visible save reminder */}
        <div className="mt-3 flex items-center gap-2 text-dream text-xs font-medium">
          <AlertTriangle size={12} /> Always click SAVE — never FREEZE until the final counseling day!
        </div>
      </div>

      {/* Options count & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <span className="text-text-muted text-sm font-medium">
          {options.length} option{options.length !== 1 ? "s" : ""}
          {options.length < 10 && options.length > 0 && (
            <span className="text-probable ml-2 font-normal">⚠ Aim for at least 10–15</span>
          )}
        </span>
        
        {options.length > 0 && (
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <button onClick={shareList} className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-11 sm:h-9 px-4 rounded-lg bg-surface border border-subtle text-text-secondary hover:text-text-primary text-sm transition-colors">
              <Share2 size={16} /> Share
            </button>
            <button onClick={printList} className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-11 sm:h-9 px-4 rounded-lg bg-surface border border-subtle text-text-secondary hover:text-text-primary text-sm transition-colors">
              <Printer size={16} /> Print
            </button>
            <button onClick={clearAll} className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 sm:h-9 px-4 rounded-lg bg-dream-soft border border-dream/30 text-dream hover:bg-dream hover:text-white text-sm transition-colors mt-1 sm:mt-0">
              <Trash2 size={16} /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* Drag and Drop List */}
      {options.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4 border border-dashed border-subtle/50 rounded-2xl bg-surface/50 backdrop-blur-sm card-glow">
          <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent flex items-center justify-center border border-accent/20 shadow-[0_0_40px_rgba(124,58,237,0.15)]">
            <ListChecks size={32} className="text-accent-light" />
          </div>
          <p className="text-fluid-lg font-heading font-bold text-text-primary mb-2">Your list is empty</p>
          <p className="text-text-secondary text-sm mb-8 max-w-sm leading-relaxed">
            Start building your perfect options list. Drag to reorder, and let our AI evaluate your strategy before you freeze.
          </p>
          <a href="/predict" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-accent hover:bg-accent/90 text-white font-medium transition-all hover:-translate-y-0.5 shadow-lg active:scale-95">
            <Search size={18} /> Find Colleges
          </a>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={options.map((o) => `${o.institute_code}-${o.branch}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {options.map((option) => (
                <SortableItem
                  key={`${option.institute_code}-${option.branch}`}
                  option={option}
                  onRemove={removeOption}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Print-only styles */}
      <style>{`
        @media print {
          header, footer, nav, button, .no-print { display: none !important; }
          body { background: white; color: black; }
          .bg-surface { background: #f9f9f9; }
          .border-subtle { border-color: #ddd; }
          .text-text-primary { color: black; }
          .text-text-secondary { color: #444; }
          .text-text-muted { color: #666; }
        }
      `}</style>
    </div>
  );
}
