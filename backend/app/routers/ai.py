import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import google.generativeai as genai

from app.database import get_db
from app.models import Product
from app.core.config import settings

# Router prefix and tags
router = APIRouter(prefix="/ai", tags=["ai"])

# Pydantic Schemas
class ChatMessage(BaseModel):
    role: str  # 'user' or 'model'
    content: str

class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class AIChatResponse(BaseModel):
    response: str
    is_simulated: bool

# Initialize Gemini SDK safely
api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
has_gemini = False

if api_key:
    try:
        genai.configure(api_key=api_key)
        has_gemini = True
        print("[AI ROUTER] Google Gemini SDK successfully configured.")
    except Exception as e:
        print(f"[AI ROUTER] Failed to configure Gemini SDK: {e}")
else:
    print("[AI ROUTER] No GEMINI_API_KEY found. Falling back to high-fidelity local keyword simulation engine.")

# High-fidelity simulated responses fallback
SIMULATED_CATALOG = {
    "headphones": "**Prathazon Sound Pro Wireless Headphones** (₹149.99)\nExperience top-tier audio with Active Noise Cancellation (ANC), 40-hour battery life, and high-fidelity sound. They have 100 units in stock! 🎧",
    "watch": "**Titanium Smart Watch Series 5** (₹299.99)\nAn incredible watch with premium fitness tracking, AMOLED display, built-in GPS, and advanced heart health monitoring. 75 units in stock! ⌚",
    "chair": "**Ergonomic Office Chair** (₹189.50)\nAdjustable lumbar support, 3D armrests, breathable mesh, and tilt lock. Perfect for long coding or browsing sessions! 🪑",
    "wallet": "**Minimalist Leather Wallet** (₹45.00)\nRFID blocking, handcrafted top-grain leather with an ultra-thin profile. 120 units in stock! 💼",
    "backpack": "**Urban Explorer Backpack** (₹85.00)\nWater-resistant, padded 15.6\" laptop slot, integrated USB charging port, and ergonomic design. 90 units in stock! 🎒",
    "jacket": "**Classic Denim Jacket** (₹79.99)\nHeavy-duty denim, chest pockets, timeless relaxed fit. 110 units in stock! 🧥",
    "shoes": "**Comfort Running Shoes** (₹120.00)\nLightweight breathable knit mesh with impact-absorbing foam soles. 85 units in stock! 👟",
    "lamp": "**Smart LED Desk Lamp** (₹35.99)\nDimmable lighting, 5 color modes, built-in wireless charging pad. 150 units in stock! 💡",
    "bottle": "**Stainless Steel Water Bottle** (₹24.99)\nDouble-wall vacuum insulation, keeps drinks cold for 24h/hot for 12h. 200 units in stock! 💧",
    "diffuser": "**Aromatherapy Oil Diffuser** (₹29.99)\nQuiet ultrasonic cool mist, 7 color LED lights, auto-off. 130 units in stock! 🌸"
}

def get_simulated_response(user_msg: str) -> str:
    user_msg_lower = user_msg.lower()
    
    # Check catalog items
    matched_items = []
    for key, value in SIMULATED_CATALOG.items():
        if key in user_msg_lower:
            matched_items.append(value)
            
    if matched_items:
        return (
            "🤖 *[Simulated Assistant]* I would love to help you find that! Here is what we have in our store:\n\n"
            + "\n\n".join(matched_items) +
            "\n\nWould you like me to add any of these premium products to your cart? Just click **Buy** on the home page!"
        )
        
    if "hello" in user_msg_lower or "hi " in user_msg_lower or "hey" in user_msg_lower:
        return (
            "👋 **Welcome to Nova Cart Smart Living Assistant!**\n\n"
            "I am your dedicated AI guide. You can ask me to recommend gadgets, check pricing, "
            "or find details about headphones, smart watches, office chairs, and backpacks!\n\n"
            "What premium product are you looking to add to your luxury lifestyle today?"
        )
        
    if "recommend" in user_msg_lower or "best" in user_msg_lower or "smart" in user_msg_lower:
        return (
            "🌟 **Nova Cart Top Smart Recommendations:**\n\n"
            "1. 🎧 **Prathazon Sound Pro Headphones** (₹149.99) - Essential for music and focus.\n"
            "2. ⌚ **Titanium Smart Watch Series 5** (₹299.99) - A gorgeous health companion on your wrist.\n"
            "3. 🪑 **Ergonomic Office Chair** (₹189.50) - Protect your back and maximize productivity.\n\n"
            "All of these are fully in stock and ready to ship!"
        )
        
    return (
        "🤖 *[Simulated Assistant]* Thanks for asking! I am currently running in demo mode. "
        "I can help you find products like **headphones**, **watches**, **office chairs**, **backpacks**, "
        "**wallets**, **jackets**, or **running shoes**.\n\n"
        "Try asking me: *'What headphones do you have?'* or *'Recommend the best products!'*"
    )

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_assistant(
    request: AIChatRequest,
    db: AsyncSession = Depends(get_db)
):
    user_message = request.message
    
    # 1. Fetch active products catalog context
    try:
        result = await db.execute(select(Product))
        products = result.scalars().all()
        
        catalog_items = []
        for p in products:
            catalog_items.append(
                f"- Product: {p.name}\n"
                f"  ID: {p.id}\n"
                f"  Category: {p.category}\n"
                f"  Price: ₹{p.price}\n"
                f"  Stock: {p.stock} remaining\n"
                f"  Specs: {p.description}\n"
            )
        catalog_context = "\n".join(catalog_items)
    except Exception as e:
        print(f"[AI ROUTER] Error compiling product context: {e}")
        catalog_context = "Product catalog currently unavailable."

    # 2. Call Gemini API if active, otherwise use Simulated Fallback
    if has_gemini:
        try:
            # We use gemini-1.5-flash as the fast, high-quality recommended model
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            # Format system instructions
            system_instruction = (
                "You are the Nova Cart (Prathazon) E-Commerce Personal AI Assistant.\n"
                "Your job is to answer questions, guide buyers, and recommend smart-living products.\n\n"
                "Here is the ACTIVE real-time store inventory:\n"
                f"{catalog_context}\n\n"
                "Rules:\n"
                "1. Be helpful, professional, polite, and engaging. Use shopping and gadget emojis nicely.\n"
                "2. ONLY suggest products that exist in the catalog above. If a user asks about items we don't carry (e.g. food, cars), "
                "kindly explain that we specialize in Smart Living accessories (Headphones, Watches, Office Chairs, LED Lamps, etc.) and direct them to what we do sell.\n"
                "3. Print product prices and stock explicitly so they know what's available.\n"
                "4. Keep replies formatting in clean, readable markdown (bolding, lists, etc.) and relatively concise."
            )
            
            # Formulate full conversation payload
            contents = []
            
            # Append historical messages
            for msg in request.history[-6:]: # Keep last 6 exchanges to avoid token bloat
                contents.append({
                    "role": "user" if msg.role == "user" else "model",
                    "parts": [msg.content]
                })
                
            # Append system prompt and active message
            full_prompt = f"{system_instruction}\n\nUser Message: {user_message}\nAI Assistant Response:"
            contents.append({
                "role": "user",
                "parts": [full_prompt]
            })
            
            # Generate content
            response = model.generate_content(contents)
            return AIChatResponse(
                response=response.text.strip(),
                is_simulated=False
            )
        except Exception as e:
            print(f"[AI ROUTER] Gemini API call error: {e}. Falling back to simulated response.")
            # Fall back gracefully to keyword simulation if API fails
            simulated_text = get_simulated_response(user_message)
            return AIChatResponse(
                response=simulated_text,
                is_simulated=True
            )
    else:
        # No API Key, use simulated response
        simulated_text = get_simulated_response(user_message)
        return AIChatResponse(
            response=simulated_text,
            is_simulated=True
        )
