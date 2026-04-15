# 🚀 Perplexity AI Clone

🌐 Live Demo: http://43.205.243.167  
⚡ AI-powered Q&A system using RAG + Groq(LLM) + FAISS  
☁️ Deployed on AWS EC2 with Nginx (Production Ready)

---

## 🏗️ System Architecture (Production Setup)

```
flowchart TD
    A[👤 User / Recruiter Browser] --> B[🌐 Nginx Reverse Proxy :80]

    B --> C[⚛️ React Frontend (Static Build)]
    C --> D[📡 API Call: /api/query]

    D --> B
    B --> E[⚡ FastAPI Backend :8000 (Gunicorn)]

    E --> F[📚 FAISS Vector Search]
    E --> G[🤖 Groq LLM API]

    F --> E
    G --> E

    E --> B
    B --> A
```

---

## 🔁 How It Works (Step-by-Step)

1. 👤 User opens the live app → http://43.205.243.167
2. 🌐 Nginx serves the React frontend
3. 💬 User enters a query (e.g., *“What is AI?”*)
4. 📡 Frontend sends request to `/api/query`
5. 🔁 Nginx forwards request to FastAPI backend
6. ⚡ Backend processes query:

   * 📚 Retrieves relevant data using FAISS
   * 🤖 Generates answer using Groq LLM
7. 📩 Response is sent back to frontend
8. 💡 UI displays AI-generated answer

---

## ⚙️ Deployment Architecture (AWS)

```
flowchart LR
    A[🌍 Internet] --> B[🖥️ AWS EC2 Instance]

    B --> C[🌐 Nginx (Port 80)]
    C --> D[⚛️ React Build (/var/www/html)]
    C --> E[⚡ FastAPI (Port 8000)]

    E --> F[📚 FAISS Index]
    E --> G[🤖 Groq API]
```

---

## 🎯 Key Highlights

* 🚀 Fully deployed on AWS EC2 (Ubuntu)
* 🌐 Nginx used as reverse proxy (production-grade)
* ⚡ FastAPI backend served via Gunicorn
* ⚛️ React frontend served as static build
* 🔁 Clean API routing using `/api` (no CORS issues)
* 🧠 RAG pipeline using FAISS + LLM
* 🟢 Runs 24/7 independently (no local dependency)

---
