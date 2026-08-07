import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

models_to_test = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "models/gemini-2.5-flash",
    "models/gemini-2.0-flash"
]

for model_name in models_to_test:
    try:
        model = genai.GenerativeModel(model_name)
        res = model.generate_content("Hello! Respond with 'UdanPath Gemini Ready'")
        print(f"✅ Success with model '{model_name}': {res.text.strip()}")
        break
    except Exception as e:
        print(f"❌ Failed with model '{model_name}': {e}")
