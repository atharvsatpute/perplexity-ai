# app/rag.py

import os
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from groq import Groq
from dotenv import load_dotenv
from app.web_search import fetch_web_data

model = SentenceTransformer('all-MiniLM-L6-v2')
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

# Load data
chunks = np.load("app/chunks.npy", allow_pickle=True)
index = faiss.read_index("app/faiss_index.index")



def retrieve(query, top_k=3):
    web_data = fetch_web_data(query)

    chunks = []
    metadata = []

    # create chunks + keep source
    for item in web_data:
        text = item["text"]
        url = item["url"]

        for i in range(0, len(text), 300):
            chunk = text[i:i+300]
            chunks.append(chunk)
            metadata.append(url)

    if not chunks:
        return [], []

    embeddings = model.encode(chunks)
    embeddings = np.array(embeddings).astype("float32")

    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    q_emb = model.encode([query])
    q_emb = np.array(q_emb).astype("float32")

    D, I = index.search(q_emb, top_k)

    results = []
    sources = []

    for i in I[0]:
        if i < len(chunks):
            results.append(chunks[i])
            sources.append(metadata[i])

    return results, sources

def generate_answer(query, docs):
    context = " ".join(docs)

    prompt = f"""
Answer the question using the context below.

Context:
{context}

Question:
{query}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",  # fast + good + generic
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content