# PROJECT SETU (SEAT-SET): MASTER CONTEXT

**Project Lead:** Mohammed Anwar Qureshi
**Version:** 4.0 (Finalized Architecture)
**Primary Goal:** Provide a high-performance, mobile-first, intelligent decision-support system to guide 500,000+ EAPCET students (MPC & BiPC) through the counseling chaos, entirely free of cost.

---

## 1. Core Philosophy & Constraints
* **No-Hallucination Policy:** Numerical data (ranks, fees, seat matrix) MUST strictly come from deterministic SQL queries. AI is forbidden from "guessing" cutoffs.
* **$0 Operational Cost Strategy:** Maximize free tiers. Heavy lifting is done by SQL, Edge caching, and Gemini Flash.
* **Rural Accessibility:** Mobile-first design, low bandwidth optimization, and native **Telugu/English toggle**.

---

## 2. The Updated "Seat-Set" Tech Stack
* **Frontend:** Next.js hosted on **Cloudflare Pages** (for zero egress fees and extreme edge speed).
* **Database:** **Supabase (PostgreSQL + pgvector)** with heavy SQL indexing for instant data retrieval + vector similarity search for RAG.
* **Agentic Logic:** **PydanticAI v1.90.0** (Fast, lightweight Python agents with multi-model routing).
* **LLM Engines (Multi-Model Routing):**
  * **Gemini 2.5 Flash:** Massive-context RAG reading (Rulebook AI) + native Telugu language generation.
  * **Groq (Llama-3.3-70b-versatile):** Lightning-fast logical routing for Option Strategy Guard evaluation.
  * **Cohere (rerank-english-v3.0):** Neural reranking to filter the most relevant vector search results before Gemini reads them.
* **Embeddings:** **HuggingFace all-MiniLM-L6-v2** (384-dim, runs 100% locally, $0 cost forever).
* **API Server:** **FastAPI** bridging the Next.js frontend and Python-based AI agents.

---

## 3. The 3-Tier Intelligence Architecture

### Tier 1: Deterministic Engine (Speed & Accuracy)
* **Probabilistic Rank Predictor:** Instantly categorizes college branches into *Safe, Probable,* and *Dream* using historical cutoff data from direct SQL queries — zero LLM involvement, zero hallucination risk.
* **Phase-Gap Seat Matrix:** Tracks vacancies between counseling rounds.
* **Management Quota Transparency:** Displays official AFRC-sanctioned fees.

### Tier 2: Knowledge RAG (Expert Guidance)
* **Rulebook AI (Gemini + Cohere):** Answers complex queries about eligibility, "Local Status," and Fee Reimbursement. Pipeline: Local Embedding → pgvector search → Cohere rerank → Gemini 2.5 Flash generation.
* **Branch Matchmaker:** A profiling quiz that provides AI-generated summaries on why a branch fits a student's interests.

### Tier 3: Stateful Agents (Journey Management)
* **Option Strategy Guard (Groq/PydanticAI):** Autonomously reviews a student's proposed web options list to flag strategic errors (e.g., Priority Trap, premature Freezing, too few options).
* **Verification Center Navigator:** An interactive guide for physical document verification.

---

## 4. Implementation Roadmap
* **Phase 1: Data Engineering** — COMPLETED
  * Collected, scraped, and cleaned PDF tables (Cutoffs, Rulebooks, Fees).
  * Set up Python extraction scripts and structured raw data.
* **Phase 2: Database Foundation** — COMPLETED
  * Designed Supabase SQL Schema. Populated 291 colleges, 1946 MPC cutoffs, 344 BiPC cutoffs.
* **Phase 3: Logic & Agent Integration** — COMPLETED
  * Built FastAPI server with PydanticAI endpoints.
  * Embedded 163 document chunks into pgvector using local HuggingFace model.
  * Integrated Gemini 2.5 Flash, Groq Llama-3, and Cohere Rerank.
* **Phase 4: Frontend & Optimization** — NEXT
  * Build Next.js UI, simulate "Result Day" traffic spikes, finalize edge caching, and deploy.

---
*Note for Antigravity (AI Assistant): This file serves as the absolute ground truth. Do not deviate from this stack or architecture without explicit user permission.*
