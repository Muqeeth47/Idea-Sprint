import pandas as pd
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
import pickle
import os

# Configuration
DATASET_PATH = "../data set.csv"
MODEL_NAME = 'all-MiniLM-L6-v2'
INDEX_FILE = "vector_index.faiss"
METADATA_FILE = "schemes.pkl"

def load_and_preprocess_data():
    print("Loading dataset...")
    global DATASET_PATH
    if not os.path.exists(DATASET_PATH):
        # Startup check
        if os.path.exists("data set.csv"):
            print("Found data set.csv in current dir, adjusting path")
            DATASET_PATH = "data set.csv"
        elif os.path.exists("../data set.csv"):
             pass
        else:
             print(f"Error: Dataset not found at {DATASET_PATH} or current dir")
             return None

    try:
        # Using on_bad_lines='skip' for newer pandas
        df = pd.read_csv(DATASET_PATH, on_bad_lines='skip')
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return None

    print(f"Initial rows: {len(df)}")
    
    # Fill NaN values with empty string
    df = df.fillna('')
    
    # Rename schemeCategory to category if it exists
    if 'schemeCategory' in df.columns:
        df = df.rename(columns={'schemeCategory': 'category'})
    
    # Create a combined text column for semantic search
    # Weighting: Name and Tags are very important, so we repeat them or put them first.
    # Structure: "Name: <name>. Category: <category>. Tags: <tags>. Details: <details>"
    df['search_text'] = (
        "Scheme Name: " + df['scheme_name'].astype(str) + ". " +
        "Category: " + df['category'].astype(str) + ". " +
        "Tags: " + df['tags'].astype(str) + ". " +
        "Details: " + df['details'].astype(str)
    )
    
    return df

def build_index(df):
    print(f"Loading model {MODEL_NAME}...")
    model = SentenceTransformer(MODEL_NAME)
    
    print("Generating embeddings (this may take a while)...")
    embeddings = model.encode(df['search_text'].tolist(), show_progress_bar=True)
    
    # Normalize embeddings for cosine similarity
    faiss.normalize_L2(embeddings)
    
    print("Building FAISS index...")
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)  # Inner Product (Cosine Similarity because normalized)
    index.add(embeddings)
    
    return index, model

def main():
    df = load_and_preprocess_data()
    if df is None:
        return

    index, model = build_index(df)
    
    # Save Index
    print(f"Saving index to {INDEX_FILE}...")
    faiss.write_index(index, INDEX_FILE)
    
    # Save Metadata (Dataframe)
    print(f"Saving metadata to {METADATA_FILE}...")
    with open(METADATA_FILE, 'wb') as f:
        pickle.dump(df, f)
        
    print("Training complete. Files saved.")

if __name__ == "__main__":
    main()
