# Architecture & Implementation Guide

## 1. System Architecture
```text
[User Interface (CLI / Web / Mobile)]
       |
       v
[FastAPI Server (Python)]
       |
       +---> [Endpoint: /search] 
       |       |
       |       v
       |    [SentenceTransformer (all-MiniLM-L6-v2)] --> Convert Query to Vector
       |       |
       |       v
       |    [FAISS Index] --> Retrieve Top-k Similar Schemes (Semantic Search)
       |
       +---> [Endpoint: /verify]
               |
               v
            [Eligibility Engine (Regex/Heuristic)] --> Match User Profile (Age, Income) vs Scheme Criteria
               |
               v
            [Response: ELIGIBLE / NOT ELIGIBLE + Reasons]
```

## 2. Python Packages
Install the strict minimal set of packages:
```bash
pip install fastapi uvicorn pandas numpy sentence-transformers faiss-cpu python-multipart
```

## 3. Data Preprocessing Pipeline
1.  **Ingest**: Load `data set.csv`.
2.  **Clean**: Handle bad lines/encoding, fill NaNs.
3.  **Feature Engineering**: Create a `search_text` schema:
    *   `"Scheme Name: {name}. Category: {category}. Tags: {tags}. Details: {details}"`
    *   This ensures the model matches both the official title and colloquial keywords/descriptions.
4.  **Embedding**: Pass `search_text` through `all-MiniLM-L6-v2` to get 384-dimensional vectors.
5.  **Normalization**: L2 Normalize vectors to allow Cosine Similarity using Inner Product (IP) index.

## 4. Model Building & Training
*   **Model**: `sentence-transformers/all-MiniLM-L6-v2` (Small, fast, runs on CPU).
*   **Index**: `FAISS IndexFlatIP` (Exact search, no approximation needed for <100k rows).
*   **Storage**: Save index to `vector_index.faiss` and metadata to `schemes.pkl`.

## 5. Query Handling & Logic
The conversation flows in two API steps:
1.  **Discovery**: User asks natural language question -> System returns top schemes.
2.  **Qualification**: User selects scheme & provides details -> System checks eligibility.

**Logic for Eligibility:**
*   **Age**: Regex extraction of "18-60 years", "above 21" etc.
*   **Income**: Regex extraction of "less than rs 100000".
*   **Comparison**: Strict integer comparison. If regex fails to extract clear logic, defaults to showing the raw text to user (Safety fallback).

## 6. Accuracy Integration
1.  **Deduplication**: Dataset rows are unique per scheme.
2.  **Rich Context**: Using "Tags" and "Details" in embedding improves retrieval recall.
3.  **Strict Filtering**: verification is done via deterministic code (Regex), not AI generation, preventing logical hallucinations.

## 7. Avoiding Hallucinations
*   **Retrieval Strictness**: If FAISS similarity score < 0.3 (threshold), return "No relevant schemes found."
*   **No Generative Text**: The bot never "generates" a sentence. It only *retrieves* text strings from the CSV.
*   **Source of Truth**: All "Benefits" and "Application Steps" are verbatim copies from the CSV columns.

## 8. How to Run
1.  **Install**: `pip install -r requirements.txt`
2.  **Train**: `python train_model.py` (Creates index)
3.  **Run Server**: `uvicorn main:app --reload`
4.  **Test**: Open `http://localhost:8000/docs` to try the API.
