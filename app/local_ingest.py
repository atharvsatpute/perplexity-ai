import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

# Load model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load text
with open("app/sample.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Create chunks
chunks = [text[i:i+200] for i in range(0, len(text), 200)]

# Convert to embeddings
embeddings = model.encode(chunks)
embeddings = np.array(embeddings).astype("float32")

# Create FAISS index
index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)

# Save files
np.save("app/chunks.npy", chunks)
faiss.write_index(index, "app/faiss_index.index")

print("✅ Data indexed successfully!")