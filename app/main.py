from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from app.rag import retrieve, generate_answer
from passlib.context import CryptContext
from app.db import cursor, conn

app = FastAPI()

# ---------------- PASSWORD HASHING ----------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- MODELS ----------------
class QueryRequest(BaseModel):
    query: str


class AuthRequest(BaseModel):
    email: str
    password: str

import hashlib

def normalize_password(password: str):
    # convert ANY length password into fixed hash input
    return hashlib.sha256(password.encode()).hexdigest()
# ---------------- HOME ----------------
@app.get("/")
def home():
    return {"message": "Server is running"}


# =========================
# YOUR EXISTING RAG API
# =========================
@app.post("/query")
def query_api(req: QueryRequest):
    q = req.query

    docs, sources = retrieve(q)
    answer = generate_answer(q, docs)

    return {
        "query": q,
        "answer": answer,
        "sources": sources
    }


# =========================
#  REGISTER API
# =========================
@app.post("/register")
def register(req: AuthRequest):
    try:
        cursor.execute(
            "SELECT * FROM users WHERE email=%s",
            (req.email,)
        )
        user = cursor.fetchone()

        if user:
            return {"success": False, "message": "User already exists"}

        # STORE PLAIN PASSWORD (simple mode)
        cursor.execute(
            "INSERT INTO users (email, password) VALUES (%s, %s)",
            (req.email, req.password)
        )
        conn.commit()

        return {"success": True, "message": "User registered successfully"}

    except Exception as e:
        return {"success": False, "message": str(e)}


# =========================
#  LOGIN API
# =========================
@app.post("/login")
def login(req: AuthRequest):
    try:
        cursor.execute(
            "SELECT * FROM users WHERE email=%s",
            (req.email,)
        )
        user = cursor.fetchone()

        if not user:
            return {"success": False, "message": "User not found"}

        # SIMPLE PASSWORD CHECK
        if req.password != user[2]:
            return {"success": False, "message": "Wrong password"}

        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user[0],
                "email": user[1]
            }
        }

    except Exception as e:
        return {"success": False, "message": str(e)}