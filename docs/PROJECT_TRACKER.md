# PROJECT SETU: DEVELOPMENT LOG & TRACKER

This document serves as the master changelog and progress tracker. It will record all completed steps, technical decisions, and scripts written. If any hallucinations occur or if a script fails in the future, we will refer back to this log to re-iterate and fix the issue.

---

## [Phase 1: Data Collection] - STATUS: ✅ COMPLETED
**Date:** May 3, 2026

### Updates & Actions:
* **Folder Structure Created:** `raw_data/` initialized with subfolders `cutoffs`, `rulebooks`, and `college_info`.
* **Data Gathered by User:**
  * `cutoffs/MPC/`: Contains 2022, 2023, 2024, and 2025 data (PDF, CSV).
  * `cutoffs/BiPC/`: Contains 2022, 2023, and 2024 data (PDF, XLSX). *Note: 2025 data pending.*
  * `rulebooks/`: Contains 2025 User Guides and Detailed Notification (2026 pending official release).
  * `college_info/`: Contains Pharmacy lists, Fee G.O., and `manabadi_college_list.csv`.
* **Data Scraped:** User successfully executed `script.py` (pandas `read_html`) to scrape the Manabadi TS EAMCET college list into a CSV.

### Architectural Decisions Locked:
* **Versioned Vector Store:** Rulebooks will be tagged with JSON metadata (`{"academic_year": 2025, "is_latest": true}`).
* **Kill Switch Prompt:** PydanticAI agent will be programmed to explicitly warn users when referencing 2025 data for 2026 queries until the 2026 PDFs are uploaded.

---

## [Phase 1.5: Data Engineering & Cleaning] - STATUS: ✅ COMPLETED
**Goal:** Convert all raw PDFs, CSVs, and XLSX files into a unified, clean database schema suitable for Supabase upload.

### Pending Tasks:
- [x] Set up Python environment/requirements (`pandas`, `pdfplumber`, `openpyxl`).
- [x] Write Python parser for `cutoffs/MPC` (handling mixed PDF and CSV formats).
- [x] Write Python parser for `cutoffs/BiPC` (handling mixed PDF and XLSX formats).
- [x] Parse the `college_info` Fee G.O. PDF and merge it with the `manabadi_college_list.csv`. (OCR Script Built & Executed)
- [x] Execute Data Engineering pipelines to generate `_MASTER_CUTOFFS.csv` files. (COMPLETED)

---

## [Phase 2: Database & Frontend Setup] - STATUS: ✅ COMPLETED
**Date:** May 4, 2026

### Updates & Actions:
- [x] Generated `supabase_schema.sql` containing tables `colleges` and `cutoffs`.
- [x] Created `upload_to_supabase.py` using `pandas` and `supabase`.
- [x] Handled Postgres `ON CONFLICT` duplicate issues by deduplicating colleges. 
- [x] Successfully populated Database with 291 colleges, 1500 MPC cutoffs, and 344 BiPC cutoffs.

---

## [Phase 3: Agentic Logic & RAG Integration] - STATUS: 🔄 IN PROGRESS
**Date:** May 5, 2026

### Architectural Upgrades:
- **Multi-Model Routing:** 
  - **Groq (Llama-3):** Fast API routing and logic-based options strategy evaluation.
  - **Gemini Flash:** Large context RAG reading and Telugu translation.
  - **Cohere:** Reranking API added to reduce hallucinations.

### Updates & Actions:
- [x] Initialized Python Backend (`backend/`) with FastAPI.
- [x] Drafted `backend/requirements.txt` and `backend/main.py`.
- [x] Web-scraped a step-by-step EAMCET counseling guide from trusted educational blogs to supplement RAG context (`raw_data/rulebooks/blog_counseling_step_by_step.md`).
- [x] Generated `pgvector_schema.sql` to prepare the Supabase database for vector embeddings.
- [x] Built `embed_rulebooks.py` using `PyPDF2`, `langchain-text-splitters`, and Gemini APIs to upload chunked documents to Supabase.
- [x] Executed `embed_rulebooks.py` using 100% free local HuggingFace Embeddings (`all-MiniLM-L6-v2`) to completely populate the Supabase vector database.
- [x] Implemented PydanticAI endpoints in `backend/main.py` (Tier 1 Deterministic SQL, Tier 2 Gemini RAG, Tier 3 Groq Option Strategy).

---

## [Phase 3.5: Feature Expansion] - STATUS: COMPLETED
**Date:** May 5, 2026

### Updates & Actions:
- [x] Deep diagnostic review: Fixed Supabase 1000-row truncation bug, updated PROJECT_SETU_CONTEXT.md to reflect actual tech stack.
- [x] Folder cleanup: Moved `read_pdf.py` and `V4.0.pdf` into `_archive/` folder.
- [x] Created `backend/branch_data.json` with curated data for 12 engineering branches (career paths, pros, cons, salary ranges, personality fit).
- [x] Added 5 new endpoints to `backend/main.py`:
  - `GET /api/branches` — List all branches (static JSON, $0)
  - `GET /api/branches/{code}` — Branch detail with career paths and pros/cons
  - `POST /api/compare-colleges` — Side-by-side college comparison (SQL, $0)
  - `POST /api/peer-insights` — What similar-ranked students typically chose (SQL, $0)
  - `POST /api/fee-check` — Fee reimbursement eligibility checker (deterministic, $0)
  - `POST /api/guided-recommendation` — Orchestrated "I'm Confused" flow (Safe/Probable/Dream categorization)
- **Total endpoints: 8 (3 original + 5 new). All additive, zero existing code modified.**
