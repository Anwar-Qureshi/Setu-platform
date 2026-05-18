import os
import json
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# PydanticAI
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.gemini import GeminiModel
from pydantic_ai.models.groq import GroqModel

# Supabase, Embeddings, and Cohere
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer
import cohere

# Load environment variables
load_dotenv()

# ==========================================
# 1. INITIALIZATION
# ==========================================

app = FastAPI(
    title="Project Setu API", 
    version="1.0.0",
    description="Agentic Backend for the Setu EAMCET Counseling Platform"
)

# CORS Configuration for Frontend (Next.js)
# NOTE: allow_credentials=True is incompatible with allow_origins=["*"]
# Use explicit origins list instead.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "https://setu.pages.dev",       # Cloudflare Pages (production)
        "https://setu.app",             # Custom domain (when ready)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Initialize Supabase
SUPABASE_URL = os.getenv("SUPABASE_DATABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_DATABASE_ANON_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase URL or Key is missing in .env")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize Embedding Model for RAG (Loaded once at startup)
print("Loading Local Embedding Model...")
embedder = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize Cohere for Reranking
print("Initializing Cohere Reranker...")
cohere_client = cohere.Client(os.getenv("COHERE_API_KEY"))

# Load Branch Data (Static JSON — $0 cost, loaded once at startup)
print("Loading Branch Explorer Data...")
with open(os.path.join(os.path.dirname(__file__), "branch_data.json"), "r", encoding="utf-8") as f:
    BRANCH_DATA = json.load(f)

# Initialize AI Models
# Gemini for RAG (Large Context)
gemini_model = GeminiModel('gemini-2.5-flash')
# Groq (Llama-3) for fast strategic reasoning
groq_model = GroqModel('llama-3.3-70b-versatile')

# ==========================================
# 2. AGENT DEFINITIONS (PydanticAI)
# ==========================================

# Agent 1: The Rulebook RAG Agent
rulebook_agent = Agent(
    model=gemini_model,
    system_prompt=(
        "You are 'Setu', an expert counselor for TS EAMCET/TG EAPCET. "
        "Your job is to answer student questions purely based on the provided Rulebook context. "
        "CRITICAL RULE: If the user asks about rules, you MUST state that 2026 rules are tentative and based on 2025 rulebooks. "
        "Do NOT hallucinate. If the context does not contain the answer, say 'I don't have that information in the official rulebooks.' "
        "Translate the response into Telugu ONLY if the user explicitly requests it or if the language code is 'te'."
    )
)

# Agent 2: The Option Strategy Guard
strategy_agent = Agent(
    model=groq_model,
    system_prompt=(
        "You are the Setu Option Strategy Guard. A student has submitted their list of 'Web Options' (colleges and branches they want). "
        "Your job is to review their list and warn them about common mistakes. "
        "Specifically, ensure they understand the 'Save vs Freeze' logic (tell them never to freeze prematurely, always SAVE). "
        "Warn them if they haven't provided enough options (less than 10 is risky). "
        "Warn them about the Priority Trap (they should order by preference, not by cutoff probability). "
        "Keep your feedback highly concise, actionable, and encouraging."
    )
)

# ==========================================
# 3. PYDANTIC SCHEMAS (Request/Response)
# ==========================================

class PredictRankRequest(BaseModel):
    rank: int
    category: str # e.g., 'oc_boys', 'bc_a_girls', 'sc_boys'
    stream: str   # 'MPC' or 'BIPC'

class AskRulebookRequest(BaseModel):
    query: str
    language: str = "en" # 'en' or 'te'

class OptionItem(BaseModel):
    priority: int
    institute_code: str
    branch: str

class EvaluateOptionsRequest(BaseModel):
    rank: int
    category: str
    options: List[OptionItem]

class CompareCollegesRequest(BaseModel):
    institute_codes: List[str]  # 2-3 institute codes to compare
    branch: str = ""            # optional branch filter for cutoff comparison

class PeerInsightsRequest(BaseModel):
    rank: int
    category: str       # e.g., 'oc_boys'
    stream: str          # 'MPC' or 'BIPC'
    rank_range: int = 2000  # how wide the rank window should be (e.g. +/- 2000)

class FeeCheckRequest(BaseModel):
    category: str        # 'OC', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'SC', 'ST', 'EWS'
    family_income: float # annual income in rupees
    college_type: str = "private"  # 'university' or 'private'

class GuidedRecommendationRequest(BaseModel):
    rank: int
    category: str
    stream: str

# ==========================================
# 4. API ENDPOINTS
# ==========================================

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Project Setu Agentic Backend is fully operational."}

@app.post("/api/predict-rank")
def predict_rank(req: PredictRankRequest):
    """
    Tier 1 Deterministic Logic: 
    Fetches raw historical cutoffs from Supabase and filters out colleges the student cannot get into.
    """
    # 1. Fetch data from Supabase for the specific stream
    # WARNING: Supabase defaults to 1000 rows. We MUST use .limit(3000) because MPC has ~1946 rows.
    response = supabase.table("cutoffs").select(
        f"inst_code, institute_name, branch, {req.category}, tuition_fee"
    ).ilike("stream", req.stream).limit(3000).execute()
    
    data = response.data
    possible_seats = []
    
    # 2. Filter logic in Python to safely handle "N/A" and string-based ranks
    for row in data:
        cutoff_str = row.get(req.category)
        if not cutoff_str or cutoff_str.strip() == "N/A":
            continue
            
        try:
            cutoff_val = int(float(cutoff_str))
            # If the student's rank is LESS THAN OR EQUAL to the cutoff, they have a chance.
            if req.rank <= cutoff_val:
                possible_seats.append({
                    "institute_name": row["institute_name"],
                    "inst_code": row["inst_code"],
                    "branch": row["branch"],
                    "cutoff": cutoff_val,
                    "tuition_fee": row["tuition_fee"]
                })
        except ValueError:
            pass # Ignore malformed data
            
    # Sort by the most premium colleges (lowest cutoff ranks first)
    possible_seats.sort(key=lambda x: x["cutoff"])
    
    return {
        "status": "success",
        "user_rank": req.rank,
        "category": req.category,
        "total_chances": len(possible_seats),
        "recommendations": possible_seats
    }


@app.post("/api/ask-rulebook")
def ask_rulebook(req: AskRulebookRequest):
    """
    Tier 2 RAG Logic:
    Embeds the user's query, searches Supabase pgvector, and passes context to Gemini.
    """
    # 1. Generate query embedding locally ($0 cost)
    query_embedding = embedder.encode(req.query).tolist()
    
    # 2. Search Supabase Vector DB (Fetch 15 broad results first)
    try:
        search_res = supabase.rpc(
            'match_rulebook_chunks', 
            {'query_embedding': query_embedding, 'match_threshold': 0.1, 'match_count': 15}
        ).execute()
        
        raw_chunks = search_res.data
        if not raw_chunks:
            return {"status": "success", "answer": "I don't have that information in the official rulebooks.", "sources_used": 0}
            
        # 3. Use Cohere to Rerank and filter the absolute best 5 chunks
        docs_to_rerank = [chunk["content"] for chunk in raw_chunks]
        rerank_response = cohere_client.rerank(
            model="rerank-english-v3.0",
            query=req.query,
            documents=docs_to_rerank,
            top_n=5
        )
        
        # Get the top chunks based on Cohere's sophisticated scoring
        best_chunks = [docs_to_rerank[result.index] for result in rerank_response.results]
        context_text = "\n\n".join(best_chunks)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector Search or Reranking Failed: {str(e)}")

    # 4. Construct Prompt with Context
    prompt = f"Context from Official Rulebooks & Guides:\n{context_text}\n\nStudent Question: {req.query}"
    if req.language == 'te':
        prompt += "\n\nPlease answer entirely in the Telugu language."

    # 4. Agentic Response Generation
    try:
        result = rulebook_agent.run_sync(prompt)
        return {
            "status": "success",
            "answer": result.output,
            "sources_used": len(best_chunks)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini Agent Failed: {str(e)}")


@app.post("/api/evaluate-options")
def evaluate_options(req: EvaluateOptionsRequest):
    """
    Tier 3 Option Strategy Logic:
    Sends the user's web options list to Groq (Llama-3) to critique and validate the strategy.
    """
    options_text = "\n".join([f"Priority {opt.priority}: {opt.institute_code} - {opt.branch}" for opt in req.options])
    
    prompt = (
        f"Student Rank: {req.rank} ({req.category})\n"
        f"Submitted Web Options:\n{options_text}\n\n"
        "Please analyze this list. Give me 3 bullet points of strategic advice. "
        "Remind them NOT to click 'Freeze' unless it's the final day, and tell them to use 'Save' instead. "
        "Point out if they have too few options."
    )
    
    try:
        result = strategy_agent.run_sync(prompt)
        return {
            "status": "success",
            "feedback": result.output
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq Agent Failed: {str(e)}")

# ==========================================
# 5. NEW ENDPOINTS (Phase 3.5)
# ==========================================

@app.get("/api/branches")
def list_branches():
    """
    Returns a summary list of all engineering branches.
    No AI involved — pure static JSON. $0 cost.
    """
    summary = []
    for code, data in BRANCH_DATA.items():
        summary.append({
            "code": data.get("code", code),
            "full_name": data["full_name"],
            "stream": data["stream"],
            "best_for": data["best_for"],
            "industry_trend": data["industry_trend"]
        })
    return {"status": "success", "branches": summary}


@app.get("/api/branches/{branch_code}")
def get_branch_detail(branch_code: str):
    """
    Returns detailed info about a specific branch.
    Includes career paths, pros, cons, salary ranges, and personality fit.
    """
    # Try exact match first, then case-insensitive search
    branch = BRANCH_DATA.get(branch_code) or BRANCH_DATA.get(branch_code.upper())
    if not branch:
        # Search by the 'code' field inside each branch entry
        for key, data in BRANCH_DATA.items():
            if data.get("code", "").upper() == branch_code.upper():
                branch = data
                break
    
    if not branch:
        raise HTTPException(status_code=404, detail=f"Branch '{branch_code}' not found. Use /api/branches to see available branches.")
    
    return {"status": "success", "branch": branch}


@app.post("/api/compare-colleges")
def compare_colleges(req: CompareCollegesRequest):
    """
    Side-by-side comparison of 2-3 colleges.
    Pulls data from existing 'colleges' and 'cutoffs' tables. $0 cost.
    """
    if len(req.institute_codes) < 2 or len(req.institute_codes) > 3:
        raise HTTPException(status_code=400, detail="Please provide 2 or 3 institute codes to compare.")
    
    results = []
    for inst_code in req.institute_codes:
        # Get college info
        college_res = supabase.table("colleges").select("*").eq("inst_code", inst_code).execute()
        college_info = college_res.data[0] if college_res.data else {}
        
        # Get latest cutoff data for this college
        cutoff_query = supabase.table("cutoffs").select("*").eq("inst_code", inst_code)
        if req.branch:
            cutoff_query = cutoff_query.ilike("branch", req.branch)
        cutoff_res = cutoff_query.limit(10).execute()
        
        results.append({
            "inst_code": inst_code,
            "college_info": college_info,
            "cutoffs": cutoff_res.data
        })
    
    return {"status": "success", "comparison": results}


@app.post("/api/peer-insights")
def peer_insights(req: PeerInsightsRequest):
    """
    Shows what branches/colleges were historically filled by students
    with similar ranks. Pure SQL aggregation on existing data. $0 cost.
    """
    # Define the rank window: student's rank +/- the range
    rank_low = max(1, req.rank - req.rank_range)
    rank_high = req.rank + req.rank_range
    
    # Fetch all cutoff rows for this stream
    response = supabase.table("cutoffs").select(
        f"inst_code, institute_name, branch, branch_name, {req.category}"
    ).ilike("stream", req.stream).limit(3000).execute()
    
    # Filter rows where the cutoff falls within the student's rank window
    peer_choices = []
    for row in response.data:
        cutoff_str = row.get(req.category)
        if not cutoff_str or str(cutoff_str).strip() in ["N/A", "", "nan"]:
            continue
        try:
            cutoff_val = int(float(cutoff_str))
            if rank_low <= cutoff_val <= rank_high:
                peer_choices.append({
                    "institute_name": row["institute_name"],
                    "inst_code": row["inst_code"],
                    "branch": row["branch"],
                    "branch_name": row.get("branch_name", ""),
                    "cutoff": cutoff_val
                })
        except (ValueError, TypeError):
            pass
    
    # Count how many times each branch appears (popularity metric)
    branch_counts = {}
    for choice in peer_choices:
        b = choice["branch"]
        branch_counts[b] = branch_counts.get(b, 0) + 1
    
    # Sort branches by popularity
    popular_branches = sorted(branch_counts.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "status": "success",
        "rank_window": f"{rank_low} - {rank_high}",
        "total_seats_in_range": len(peer_choices),
        "popular_branches": [{"branch": b, "count": c} for b, c in popular_branches[:10]],
        "sample_colleges": peer_choices[:15]
    }


@app.post("/api/fee-check")
def fee_reimbursement_check(req: FeeCheckRequest):
    """
    Checks if a student is eligible for Telangana's fee reimbursement scheme.
    Based on official income thresholds from TSCHE rulebooks.
    Pure deterministic logic — $0 cost, zero hallucination.
    """
    # Official Telangana Fee Reimbursement Rules (from 2025 rulebooks)
    # These thresholds are the standard ones used by the Telangana government.
    # When 2026 rules arrive, update these numbers here.
    
    category_upper = req.category.upper()
    income = req.family_income
    
    eligible = False
    reason = ""
    coverage = ""
    
    if category_upper in ["SC", "ST"]:
        # SC/ST: Full fee reimbursement if income <= 5 lakhs
        if income <= 500000:
            eligible = True
            reason = "SC/ST students with family income up to Rs. 5,00,000 are eligible for full tuition fee reimbursement."
            coverage = "100% tuition fee covered by government"
        else:
            reason = "Your family income exceeds Rs. 5,00,000. SC/ST fee reimbursement requires income at or below this limit."
            coverage = "Not eligible — full fee must be paid by the student"
    
    elif category_upper in ["BC_A", "BC_B", "BC_C", "BC_D", "BC_E"]:
        # BC categories: Fee reimbursement if income <= 5 lakhs (revised threshold)
        if income <= 500000:
            eligible = True
            reason = f"{category_upper} students with family income up to Rs. 5,00,000 are eligible for fee reimbursement."
            coverage = "100% tuition fee covered by government"
        else:
            reason = f"Your family income exceeds Rs. 5,00,000. {category_upper} fee reimbursement requires income at or below this limit."
            coverage = "Not eligible — full fee must be paid by the student"
    
    elif category_upper == "EWS":
        # EWS: Fee reimbursement if income <= 8 lakhs
        if income <= 800000:
            eligible = True
            reason = "EWS students with family income up to Rs. 8,00,000 are eligible for fee reimbursement."
            coverage = "100% tuition fee covered by government"
        else:
            reason = "Your family income exceeds Rs. 8,00,000. EWS fee reimbursement requires income at or below this limit."
            coverage = "Not eligible — full fee must be paid by the student"
    
    elif category_upper == "OC":
        # OC/General: No fee reimbursement scheme available
        eligible = False
        reason = "OC (Open Category / General) students are not covered under the Telangana fee reimbursement scheme, regardless of income."
        coverage = "Full fee must be paid by the student"
    
    else:
        reason = f"Category '{req.category}' not recognized. Please use: OC, BC_A, BC_B, BC_C, BC_D, BC_E, SC, ST, or EWS."
        coverage = "Unable to determine"
    
    return {
        "status": "success",
        "eligible": eligible,
        "category": req.category,
        "family_income": income,
        "reason": reason,
        "coverage": coverage,
        "disclaimer": "These thresholds are based on 2025 rules. 2026 rules may differ slightly. Always verify with the official TSCHE notification."
    }


@app.post("/api/guided-recommendation")
def guided_recommendation(req: GuidedRecommendationRequest):
    """
    The 'I'm Confused' endpoint. Orchestrates multiple features into one
    cohesive, story-like response that walks the student through everything.
    Combines: Predictor + Branch Info + Peer Insights into a single guided flow.
    """
    # Step 1: Get all possible colleges (reuse predict-rank logic)
    response = supabase.table("cutoffs").select(
        f"inst_code, institute_name, branch, branch_name, {req.category}, tuition_fee"
    ).ilike("stream", req.stream).limit(3000).execute()
    
    all_seats = []
    for row in response.data:
        cutoff_str = row.get(req.category)
        if not cutoff_str or str(cutoff_str).strip() in ["N/A", "", "nan"]:
            continue
        try:
            cutoff_val = int(float(cutoff_str))
            if req.rank <= cutoff_val:
                all_seats.append({
                    "institute_name": row["institute_name"],
                    "inst_code": row["inst_code"],
                    "branch": row["branch"],
                    "branch_name": row.get("branch_name", ""),
                    "cutoff": cutoff_val,
                    "tuition_fee": row.get("tuition_fee", "")
                })
        except (ValueError, TypeError):
            pass
    
    all_seats.sort(key=lambda x: x["cutoff"])
    
    # Step 2: Categorize into Safe / Probable / Dream
    safe = []      # cutoff is >= rank + 5000 (very comfortable margin)
    probable = []  # cutoff is between rank and rank + 5000
    dream = []     # cutoff is very close to rank (within 1000)
    
    for seat in all_seats:
        margin = seat["cutoff"] - req.rank
        if margin >= 5000:
            safe.append(seat)
        elif margin >= 1000:
            probable.append(seat)
        else:
            dream.append(seat)
    
    # Step 3: Identify which branches are available to this student
    available_branches = list(set([s["branch"] for s in all_seats]))
    branch_details = []
    for b_code in available_branches:
        # Look up branch info from our static data
        branch_info = BRANCH_DATA.get(b_code)
        if branch_info:
            branch_details.append({
                "code": b_code,
                "full_name": branch_info["full_name"],
                "best_for": branch_info["best_for"],
                "industry_trend": branch_info["industry_trend"]
            })
    
    # Step 4: Build the guided response
    return {
        "status": "success",
        "student": {
            "rank": req.rank,
            "category": req.category,
            "stream": req.stream
        },
        "summary": {
            "total_options": len(all_seats),
            "safe_count": len(safe),
            "probable_count": len(probable),
            "dream_count": len(dream)
        },
        "safe_colleges": safe[:10],
        "probable_colleges": probable[:10],
        "dream_colleges": dream[:5],
        "available_branches": branch_details,
        "next_steps": [
            "Step 1: Explore the branches above to understand what you'd actually study.",
            "Step 2: Use the College Comparator to compare your top 2-3 choices side by side.",
            "Step 3: Build your Web Options list with a mix of Safe + Probable + Dream colleges.",
            "Step 4: Run your list through the Option Strategy Guard before submitting.",
            "Step 5: Remember — always click SAVE, never FREEZE until the final day!"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
