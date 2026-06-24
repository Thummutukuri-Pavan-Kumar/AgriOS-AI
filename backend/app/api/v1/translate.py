from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import os

router = APIRouter(prefix="/translate", tags=["Translation"])

class TranslateRequest(BaseModel):
    text: str
    target_language: str  # hi, te, kn, ta, mr
    source_language: str = "en"

@router.post("/")
async def translate_text(request: TranslateRequest):
    """Translate text to target language using AI"""
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        language_names = {
            "hi": "Hindi",
            "te": "Telugu",
            "kn": "Kannada",
            "ta": "Tamil",
            "mr": "Marathi",
            "en": "English"
        }
        
        target_name = language_names.get(request.target_language, "English")
        
        prompt = f"""Translate the following text to {target_name} language. 
Only return the translated text, nothing else.

Text: {request.text}

Translated text:"""

        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": f"You are a professional translator. Translate the given text to {target_name} accurately."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=512,
            temperature=0.3
        )
        
        translated = response.choices[0].message.content.strip()
        
        return {
            "original": request.text,
            "translated": translated,
            "language": request.target_language,
            "language_name": target_name
        }
        
    except Exception as e:
        print(f"Translation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")

@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages"""
    return {
        "languages": [
            {"code": "en", "name": "English", "native_name": "English"},
            {"code": "hi", "name": "Hindi", "native_name": "हिन्दी"},
            {"code": "te", "name": "Telugu", "native_name": "తెలుగు"},
            {"code": "kn", "name": "Kannada", "native_name": "ಕನ್ನಡ"},
            {"code": "ta", "name": "Tamil", "native_name": "தமிழ்"},
            {"code": "mr", "name": "Marathi", "native_name": "मराठी"}
        ]
    }