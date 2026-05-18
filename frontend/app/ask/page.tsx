"use client";

/**
 * app/ask/page.tsx — Rulebook AI Chat
 * Premium chat interface connected to /api/ask-rulebook (Gemini + Cohere).
 */

import { useState, useRef, useEffect } from "react";
import { Send, Bot, AlertCircle } from "lucide-react";
import { askRulebook } from "@/lib/api";
import { SUGGESTED_QUESTIONS } from "@/lib/constants";
import { useLanguage } from "@/components/layout/Providers";

interface Message {
  role: "user" | "ai";
  text: string;
}

export default function AskPage() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: language === "te"
        ? "నమస్కారం! TSCHE నిబంధనల గురించి మీకు ఏదైనా అడగండి. నేను అధికారిక రూల్‌బుక్‌ల నుండి మాత్రమే సమాధానం ఇస్తాను."
        : "Hello! Ask me anything about TGEAPCET counseling rules. I answer only from official TSCHE documents — no guessing.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;
    const userMsg = text.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsThinking(true);

    try {
      const res = await askRulebook({ query: userMsg, language });
      setMessages((prev) => [...prev, { role: "ai", text: res.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, I couldn't connect to the server. Please check that the backend is running." },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const suggestions = SUGGESTED_QUESTIONS[language] as readonly string[];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col relative" style={{ minHeight: "calc(100vh - 10rem)" }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-fluid-4xl font-heading font-bold text-text-primary mb-2">
          Ask Setu AI
        </h1>
        <p className="text-text-secondary text-fluid-base">
          Powered by Gemini 2.5 Flash + official TSCHE rulebooks.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-probable-soft border border-probable/20 mb-6 text-sm text-text-secondary">
        <AlertCircle size={16} className="text-probable mt-0.5 shrink-0" />
        Based on 2025 rules. 2026 may differ. Always verify with the official TSCHE notification.
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-accent-muted flex items-center justify-center shrink-0 mt-1">
                <Bot size={14} className="text-accent-light" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-fluid-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent text-white rounded-tr-sm"
                  : "bg-surface border border-subtle text-text-primary rounded-tl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-muted flex items-center justify-center shrink-0 mt-1">
              <Bot size={14} className="text-accent-light" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface border border-subtle">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Questions */}
      <div className="flex gap-2 mb-4 pb-2 overflow-x-auto snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {suggestions.slice(0, 4).map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={isThinking}
            className="flex-shrink-0 snap-start px-4 py-2 rounded-full bg-surface border border-subtle text-text-muted text-sm hover:border-accent/50 hover:text-text-primary transition-all disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="sticky bottom-4 z-10 w-full">
        <div className="flex gap-3 p-2 rounded-2xl bg-background/80 backdrop-blur-xl border border-subtle/50 shadow-lg focus-within:shadow-[0_0_30px_rgba(124,58,237,0.15)] focus-within:border-accent/30 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(input); }}
            placeholder={language === "te" ? "మీ ప్రశ్న టైప్ చేయండి..." : "Ask your question..."}
            disabled={isThinking}
            className="flex-1 h-12 px-4 bg-transparent text-text-primary placeholder:text-text-muted text-fluid-sm focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isThinking || !input.trim()}
            className="h-12 w-12 rounded-xl bg-accent hover:bg-accent/90 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 shrink-0"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
