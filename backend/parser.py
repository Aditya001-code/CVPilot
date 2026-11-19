import io
import re
import pdfplumber

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

def extract_resume_data(file_input):
    """
    Extracts text layer, email, and phone directly from memory or file path.
    Does not require saving anything to disk!
    """
    text = ""

    # Convert bytes to BytesIO stream if needed
    if isinstance(file_input, bytes):
        stream = io.BytesIO(file_input)
    elif hasattr(file_input, "read"):
        content = file_input.read()
        stream = io.BytesIO(content)
    else:
        stream = file_input

    # 1. Try pdfplumber
    try:
        with pdfplumber.open(stream) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"[CVPilot Parser] pdfplumber parse warning: {e}")

    # 2. PyPDF2 fallback if text is still empty
    if not text.strip() and isinstance(stream, io.BytesIO) and PyPDF2 is not None:
        try:
            stream.seek(0)
            reader = PyPDF2.PdfReader(stream)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as e:
            print(f"[CVPilot Parser] PyPDF2 fallback error: {e}")

    email = ""
    phone = ""

    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    phone_match = re.search(r'\+?\d[\d\s-]{8,15}', text)

    if email_match:
        email = email_match.group()

    if phone_match:
        phone = phone_match.group()

    return {
        "text": text.strip(),
        "email": email,
        "phone": phone
    }