from pydantic import BaseModel
from typing import Optional

class LanguageRequest(BaseModel):
    language: str  # en, hi, te, kn, ta, mr

class TranslationResponse(BaseModel):
    text: str
    translated_text: str
    language: str