from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import os
from app.core.config import settings

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

SYSTEM_PROMPT = """You are AgriOS AI Copilot, an expert agricultural advisor for Indian farmers.
You have deep knowledge of:
- Indian crops (Kharif, Rabi, Zaid seasons)
- Soil types across Indian states
- Pest and disease management
- Irrigation techniques
- Government schemes (PM-KISAN, Fasal Bima, etc.)
- Market prices and selling strategies
- Organic and modern farming practices

Always give practical, actionable advice in simple language.
When relevant, mention specific Indian states, seasons, or local context.
Be encouraging and supportive to farmers."""

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        from groq import Groq
        # client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        client = Groq(api_key=settings.GROQ_API_KEY)

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for m in request.history[-10:]:  # last 10 messages for context
            messages.append({"role": m.role, "content": m.content})
        messages.append({"role": "user", "content": request.message})

        response = client.chat.completions.create(
            # model="llama-3.1-8b-instant",
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=1024,
            temperature=0.7
        )

        return {"response": response.choices[0].message.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))