"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, ListChecks, TrendingUp, Users, Database } from "lucide-react";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "College Predictor",
    description: "Enter your rank and category. Instantly see Safe, Probable, and Dream colleges — sorted by cutoff. No guessing, pure data.",
    href: "/predict",
    color: "var(--safe)",
    className: "md:col-span-2 lg:col-span-2 lg:row-span-2 flex flex-col justify-between"
  },
  {
    icon: Brain,
    title: "Branch Explorer",
    description: "Confused between CSE and ECE? Get honest career paths, salary ranges, pros, cons, and personality fit for 12 branches.",
    href: "/branches",
    color: "var(--accent)",
    className: "md:col-span-1 lg:col-span-1 lg:row-span-2"
  },
  {
    icon: BookOpen,
    title: "Rulebook AI",
    description: "Ask anything about counseling rules, eligibility, or fee reimbursement. Gemini answers from official TSCHE documents only.",
    href: "/ask",
    color: "var(--accent-light)",
    className: "md:col-span-1 lg:col-span-1 lg:row-span-1"
  },
  {
    icon: ListChecks,
    title: "Option Builder",
    description: "Build your web options list and get instant AI feedback. Catch strategic mistakes before you submit.",
    href: "/options",
    color: "var(--probable)",
    className: "md:col-span-1 lg:col-span-1 lg:row-span-1"
  },
  {
    icon: Users,
    title: "Peer Insights",
    description: "See what branches students with similar ranks historically chose. Know what options are realistic.",
    href: "/predict",
    color: "var(--dream)",
    className: "md:col-span-1 lg:col-span-2 lg:row-span-1"
  },
  {
    icon: Database,
    title: "Fee Check",
    description: "Enter your family income and caste category. Instantly know if you qualify for government fee reimbursement.",
    href: "/guide",
    color: "var(--safe)",
    className: "md:col-span-2 lg:col-span-2 lg:row-span-1"
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    }
  },
};

export function FeatureGrid() {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[220px]"
    >
      {FEATURES.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.href + feature.title}
            variants={item}
            className={feature.className}
          >
            <Link
              href={feature.href}
              className={`group block p-8 rounded-3xl bg-[#111111]/80 backdrop-blur-xl border border-white/5 transition-all duration-500 hover:border-white/10 hover:-translate-y-1.5 relative overflow-hidden h-full flex flex-col justify-between`}
              style={{
                boxShadow: "0 4px 24px -1px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.05)"
              }}
            >
              {/* Luxury abstract gradient glow inside the card on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
                style={{
                  background: `radial-gradient(circle at 80% 20%, color-mix(in srgb, ${feature.color} 20%, transparent), transparent 60%)`
                }}
              />

              <div className="relative z-10 flex flex-col h-full">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner"
                  style={{ 
                    background: `linear-gradient(135deg, color-mix(in srgb, ${feature.color} 15%, transparent), transparent)`,
                    border: `1px solid color-mix(in srgb, ${feature.color} 30%, transparent)`
                  }}
                >
                  <Icon
                    size={28}
                    style={{ color: feature.color }}
                  />
                </div>

                <div className="mt-auto">
                  {/* Text */}
                  <h3 className="font-heading font-bold text-white mb-3 text-2xl group-hover:text-transparent group-hover:bg-clip-text transition-colors"
                      style={{ backgroundImage: `linear-gradient(to right, #fff, ${feature.color})` }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-medium">
                    {feature.description}
                  </p>

                  {/* Arrow */}
                  <div className="mt-6 flex items-center gap-2 text-sm font-bold opacity-0 -translate-x-4 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300"
                       style={{ color: feature.color }}>
                    Explore <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
