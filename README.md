# Perplexity AI Clone

> Production RAG-based AI search system — FastAPI + FAISS + Groq LLM + React, deployed on AWS EC2 with Nginx

[![Live Demo](https://img.shields.io/badge/Live%20Demo-43.205.243.167-00b894?style=flat-square)](http://43.205.243.167)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?style=flat-square&logo=amazonaws&logoColor=white)](https://aws.amazon.com/ec2)

---

## Live Demo

```
http://43.205.243.167
```

Runs 24/7 on AWS EC2. No login required — open and ask anything.

---

## What It Does

Users type any question. The backend encodes it into a vector, searches the FAISS index for the most semantically relevant chunks from `data.txt`, and passes that context to the Groq LLM to generate a grounded answer. The response is returned to the React frontend via Nginx proxy — no CORS, no latency overhead.

---

## Architecture

```
User Browser
     |
     v
Nginx (Port 80)
     |-- Serves React static build  (/var/www/html)
     |-- Proxies /api/*  ----------> FastAPI (Port 8000)
                                          |
                                          |-- rag.py  --> FAISS index (.index)
                                          |              + chunks.npy
                                          |
                                          |-- web_search.py (optional web fallback)
                                          |
                                          `-- Groq LLM API
```

---

## Project Structure

```
perplexity-ai/
|
|-- app/                        # FastAPI backend
|   |-- main.py                 # API routes and app entrypoint
|   |-- rag.py                  # FAISS retrieval pipeline
|   |-- db.py                   # Database helpers
|   |-- web_search.py           # Optional web search fallback
|   |-- local_ingest.py         # Ingest data.txt into FAISS index
|   |-- data.txt                # Source knowledge base
|   |-- sample.txt              # Sample documents for testing
|   |-- faiss_index.index       # Persisted FAISS vector index
|   |-- chunks.npy              # Numpy array of text chunks
|   `-- __init__.py
|
|-- frontend/                   # React + Vite frontend
|   |-- src/                    # React source files
|   |-- public/                 # Static assets
|   |-- index.html
|   |-- vite.config.js
|   |-- package.json
|   `-- eslint.config.js
|
|-- .gitignore
`-- README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, served as static build via Nginx |
| Backend | FastAPI, Gunicorn + Uvicorn workers |
| Vector Search | FAISS — persisted as `faiss_index.index` + `chunks.npy` |
| Embeddings | sentence-transformers (local, no API cost) |
| LLM | Groq API — llama-3.1-8b-instant (500+ tok/s) |
| Web Fallback | `web_search.py` — optional live web search layer |
| Proxy | Nginx — reverse proxy + static file serving |
| Cloud | AWS EC2 Ubuntu — 24/7 independent deployment |

---

## How It Works

**Ingestion** (`local_ingest.py`) reads `data.txt`, splits it into chunks, generates embeddings using sentence-transformers, and saves the FAISS index to `faiss_index.index` and raw chunks to `chunks.npy`. This runs once before deployment.

**Query** (`rag.py`) encodes the user query into a vector, searches `faiss_index.index` for top-k nearest chunks, and returns them as context. `main.py` passes this context to Groq LLM and streams the answer back to the frontend.

**Web search fallback** (`web_search.py`) activates when the FAISS retrieval confidence is low, supplementing local context with live web results.

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/atharvsatpute/perplexity-ai.git
cd perplexity-ai
```

### 2. Backend setup

```bash
cd app
pip install -r requirements.txt
cp .env.example .env          # add your GROQ_API_KEY
```

### 3. Ingest your knowledge base

```bash
# Edit data.txt with your content, then run:
python local_ingest.py
# This generates faiss_index.index and chunks.npy
```

### 4. Start the backend

```bash
uvicorn main:app --reload --port 8000
```

### 5. Start the frontend

```bash
cd ../frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## AWS EC2 Deployment

```bash
# 1. Build React frontend
cd frontend
npm run build
sudo cp -r dist /var/www/html

# 2. Start FastAPI via Gunicorn (background)
cd app
gunicorn main:app \
  -w 4 \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --daemon

# 3. Configure Nginx
sudo nano /etc/nginx/sites-available/default
```

**Nginx config:**

```nginx
server {
    listen 80;

    location / {
        root /var/www/html;
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## Environment Variables

```bash
GROQ_API_KEY=your_groq_api_key
EMBEDDING_MODEL=sentence-transformers/all-mpnet-base-v2
FAISS_INDEX_PATH=./faiss_index.index
CHUNKS_PATH=./chunks.npy
TOP_K_RESULTS=5
```

---

## Key Design Decisions

**Why Nginx as reverse proxy?**
The browser only ever talks to port 80. Nginx routes `/api/*` to FastAPI internally — no `Access-Control-Allow-Origin` headers needed, no CORS issues.

**Why FAISS + numpy chunks?**
`faiss_index.index` and `chunks.npy` are saved to disk so the index survives EC2 restarts without re-ingestion. Fast, zero-cost, no external vector DB dependency.

**Why Groq?**
At 500+ tokens/second, Groq makes responses feel instant. For a search interface, perceived latency is everything.

**Why local embeddings?**
`sentence-transformers` runs on CPU with no API cost, making ingestion free and offline-capable.

---

## Author

**Atharv Satpute** — ML Engineer
📩 atharvsatpute777@gmail.com
🔗 [LinkedIn](https://linkedin.com/in/atharvsatpute)
🌐 [Live Demo](http://43.205.243.167)
☁️ AWS Certified AI Practitioner + ML Engineer Associate

---

## License

MIT
