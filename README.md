# Perplexity AI Clone

> Production RAG-based AI search system — FastAPI + FAISS + Groq LLM + React, deployed on AWS EC2 with Nginx

[![Live Demo](https://img.shields.io/badge/Live%20Demo-43.205.243.167-00e5a0)](http://43.205.243.167)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev)
[![AWS](https://img.shields.io/badge/AWS-EC2-FF9900)](https://aws.amazon.com/ec2)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## What It Does

A production-ready AI-powered question answering system inspired by Perplexity AI. Users ask any question — the system retrieves semantically relevant context using FAISS vector search, then generates a grounded answer via Groq LLM. Runs 24/7 on AWS EC2 with zero local dependencies.

---

## Live Demo

```
http://43.205.243.167
```

---

## Architecture

```
User Browser
     ↓
Nginx Reverse Proxy (Port 80)
     ├── Serves React static build
     └── Proxies /api/* → FastAPI (Port 8000)
                              ├── FAISS Vector Search
                              └── Groq LLM API
```

The entire stack runs on a single AWS EC2 instance (Ubuntu). Nginx handles both static file serving and API proxying, eliminating CORS issues entirely. FastAPI is served via Gunicorn for production-grade concurrency.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, static build served by Nginx |
| Backend | FastAPI, Gunicorn (production WSGI) |
| Vector Search | FAISS (semantic similarity retrieval) |
| LLM | Groq API (llama-3.1-8b-instant) |
| Proxy | Nginx (reverse proxy + static serving) |
| Cloud | AWS EC2 Ubuntu, runs 24/7 |

---

## Project Structure

```
perplexity-ai/
│
├── frontend/                  # React application
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # FastAPI application
│   ├── main.py                # API routes
│   ├── rag.py                 # FAISS retrieval pipeline
│   ├── llm.py                 # Groq LLM integration
│   ├── ingest.py              # Document ingestion
│   └── requirements.txt
│
├── nginx/
│   └── default.conf           # Nginx reverse proxy config
│
├── deploy/
│   └── setup.sh               # EC2 deployment script
│
├── .env.example
└── README.md
```

---

## How It Works

When a user submits a query, the backend encodes it using a sentence-transformer embedding model and searches the FAISS index for the top-k semantically relevant document chunks. These chunks are passed as context to the Groq LLM, which generates a grounded, cited answer. The response is streamed back to the React frontend via the Nginx proxy.

---

## Quick Start (Local)

```bash
# Clone the repo
git clone https://github.com/atharvsatpute/perplexity-ai.git
cd perplexity-ai

# Backend
cd backend
pip install -r requirements.txt
cp ../.env.example ../.env       # Add your GROQ_API_KEY
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## Deployment (AWS EC2)

```bash
# On your EC2 instance (Ubuntu 22.04)
git clone https://github.com/atharvsatpute/perplexity-ai.git
cd perplexity-ai

# Install dependencies
pip install -r backend/requirements.txt
cd frontend && npm install && npm run build
sudo cp -r dist /var/www/html

# Start backend with Gunicorn
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --daemon

# Configure Nginx
sudo cp nginx/default.conf /etc/nginx/sites-available/default
sudo nginx -t && sudo systemctl reload nginx
```

### Nginx Config

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

---

## Environment Variables

```bash
GROQ_API_KEY=your_groq_api_key
EMBEDDING_MODEL=sentence-transformers/all-mpnet-base-v2
FAISS_INDEX_PATH=./data/index.faiss
TOP_K_RESULTS=5
```

---

## Key Design Decisions

**Why Nginx as reverse proxy?** It eliminates CORS entirely — the browser talks only to port 80, and Nginx routes internally. No `Access-Control-Allow-Origin` headers needed.

**Why FAISS over a cloud vector DB?** For a single-instance demo, FAISS in-memory is faster, cheaper, and has zero latency overhead versus a remote vector database call.

**Why Groq?** At 500+ tokens/second, Groq makes responses feel instant. Critical for a search UX where users expect sub-second answers.

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
