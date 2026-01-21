from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import pandas as pd
import numpy as np
import faiss
import pickle
from sentence_transformers import SentenceTransformer
import os
from eligibility import EligibilityVerifier

app = FastAPI(title="Scheme Eligibility Chatbot")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global State ---
class GlobalState:
    index = None
    df = None
    model = None
    verifier = None

state = GlobalState()

# --- Config ---
MODEL_NAME = 'all-MiniLM-L6-v2'
INDEX_FILE = "vector_index.faiss"
METADATA_FILE = "schemes.pkl"

# --- Models ---
class UserProfile(BaseModel):
    age: Optional[int] = None
    income: Optional[int] = None
    gender: Optional[str] = None
    caste: Optional[str] = None
    occupation: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5

class VerifyRequest(BaseModel):
    scheme_name: str
    user_profile: UserProfile

# --- Startup ---
@app.on_event("startup")
def load_artifacts():
    print("Loading artifacts...")
    if not os.path.exists(INDEX_FILE) or not os.path.exists(METADATA_FILE):
        print("Artifacts not found! Please run train_model.py first.")
        return

    # Load FAISS index
    state.index = faiss.read_index(INDEX_FILE)
    
    # Load DF
    with open(METADATA_FILE, 'rb') as f:
        state.df = pickle.load(f)
        
    # Load Model (for encoding queries)
    state.model = SentenceTransformer(MODEL_NAME)
    
    # Init Verifier
    state.verifier = EligibilityVerifier()
    
    print("System verified and loaded.")

# --- Endpoints ---

@app.post("/search")
def search_schemes(request: SearchRequest):
    if state.index is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run training script.")

    # 1. Encode query
    query_vector = state.model.encode([request.query])
    faiss.normalize_L2(query_vector)
    
    # 2. Search
    D, I = state.index.search(query_vector, request.top_k)
    
    results = []
    # I[0] contains indices, D[0] contains scores
    for i, idx in enumerate(I[0]):
        score = float(D[0][i])
        if idx == -1: continue # No match
        
        row = state.df.iloc[idx]
        scheme_details = str(row['details'])
        snippet = scheme_details[:200] + "..." if len(scheme_details) > 200 else scheme_details
        
        results.append({
            "scheme_name": row['scheme_name'],
            "score": score,
            "category": row['category'],
            "benefits": str(row['benefits'])[:100] + "...", 
            "details": snippet,
            "eligibility_text": str(row['eligibility']),
            "application_steps": str(row['application'])
        })
    
    if not results or results[0]['score'] < 0.3: # Low threshold for specialized embeddings
        return {"status": "No relevant schemes found", "results": []}

    return {"status": "success", "results": results}

@app.post("/verify")
def verify_eligibility(request: VerifyRequest):
    if state.df is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    # Find the scheme
    scheme_row = state.df[state.df['scheme_name'] == request.scheme_name]
    
    if scheme_row.empty:
        raise HTTPException(status_code=404, detail="Scheme not found")
        
    scheme_data = scheme_row.iloc[0].to_dict()
    
    # Run Verification Logic
    profile_dict = request.user_profile.dict(exclude_none=True)
    status, reasons = state.verifier.check_eligibility(scheme_data, profile_dict)
    
    response = {
        "verdict": status,
        "reasons": reasons,
        "scheme_details": {
            "name": scheme_data['scheme_name'],
            "benefits": scheme_data.get('benefits', 'No benefits listed'),
            "documents": scheme_data.get('documents', 'No documents listed'),
            "application": scheme_data.get('application', 'No steps listed')
        }
    }
    
    return response

@app.get("/")
def health_check():
    return {"status": "running"}
