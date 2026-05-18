import os
import sys

def read_pdf(file_path):
    try:
        import PyPDF2
    except ImportError:
        os.system(f"{sys.executable} -m pip install PyPDF2 -q")
        import PyPDF2

    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for i, page in enumerate(reader.pages):
                text += f"--- Page {i+1} ---\n"
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    pdf_paths = [
        r"c:\AI Engineer\Major Project 01\Project Setu Master Plan V3.pdf",
        r"c:\AI Engineer\Major Project 01\V4.0.pdf",
        r"c:\AI Engineer\Major Project 01\_(That would be Step 1!).pdf"
    ]
    
    with open("all_pdfs_content.txt", "w", encoding="utf-8") as f:
        for path in pdf_paths:
            f.write(f"\n\n{'='*40}\nFILE: {path}\n{'='*40}\n")
            f.write(read_pdf(path))
