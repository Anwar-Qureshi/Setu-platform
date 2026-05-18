import os
import glob
from dotenv import load_dotenv
import PyPDF2
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client

# Load env variables
load_dotenv()

# Setup Supabase
supabase_url = os.getenv("SUPABASE_DATABASE_URL")
supabase_key = os.getenv("SUPABASE_DATABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# Load Local Sentence Transformer Model
print("Loading Local Embedding Model (all-MiniLM-L6-v2)...")
embedder = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text):
    """Fetch 384-dimensional embedding from local model"""
    # encode() returns a numpy array, we need a list of floats for pgvector
    embedding = embedder.encode(text)
    return embedding.tolist()

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
    return text

def process_and_upload():
    print("Initializing Text Splitter...")
    # Chunk size of 1000 characters with 200 overlap is ideal for RAG context
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )

    documents = []

    # 1. Process the Markdown Blog (Secondary Source)
    blog_path = "raw_data/rulebooks/blog_counseling_step_by_step.md"
    if os.path.exists(blog_path):
        with open(blog_path, 'r', encoding='utf-8') as f:
            blog_content = f.read()
        
        chunks = text_splitter.create_documents([blog_content])
        for chunk in chunks:
            documents.append({
                "content": chunk.page_content,
                "metadata": {
                    "source": "blog",
                    "filename": "blog_counseling_step_by_step.md"
                }
            })
        print(f"Processed Blog into {len(chunks)} chunks.")

    # 2. Process Official Rulebook PDFs
    pdf_files = glob.glob("raw_data/rulebooks/*.pdf")
    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        print(f"Reading {filename}...")
        pdf_text = extract_text_from_pdf(pdf_path)
        
        chunks = text_splitter.create_documents([pdf_text])
        for chunk in chunks:
            documents.append({
                "content": chunk.page_content,
                "metadata": {
                    "source": "official",
                    "filename": filename,
                    "academic_year": "2025" # Hardcoded as per our schema kill switch
                }
            })
        print(f"Processed {filename} into {len(chunks)} chunks.")

    # 3. Generate Embeddings and Upload
    print(f"\nTotal Chunks to Embed and Upload: {len(documents)}")
    
    # We will upload in small batches to avoid hitting API limits
    for i, doc in enumerate(documents):
        try:
            print(f"Generating embedding for chunk {i+1}/{len(documents)}...")
            embedding = get_embedding(doc["content"])
            
            record = {
                "content": doc["content"],
                "metadata": doc["metadata"],
                "embedding": embedding
            }
            
            # Insert to Supabase
            supabase.table("rulebook_chunks").insert(record).execute()
        except Exception as e:
            print(f"Error on chunk {i+1}: {e}")

    print("All documents embedded and uploaded successfully!")

if __name__ == "__main__":
    # Clear old data if re-running
    try:
        supabase.table("rulebook_chunks").delete().neq("id", 0).execute()
        print("Cleared old chunks from database.")
    except Exception as e:
        print("Could not clear old chunks (table might be empty or not created yet).")
        
    process_and_upload()
