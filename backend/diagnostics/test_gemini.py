import os
from dotenv import load_dotenv

load_dotenv()

# Set sys.path so we can import from app
import sys
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)
from app.core.gemini_client import gemini_ai_service

print("Testing Gemini AI verification connection...")
res = gemini_ai_service.verify_ai_connection()
print("Result:", res)
