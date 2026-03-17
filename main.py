from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

SYSTEM_PROMPTS = {
    "email": """You are an expert AI email writing assistant that works in clear steps.

When given a task:
1. Start with "Step 1 — Understanding your request:" and briefly restate what's needed (1-2 lines).
2. Then "Step 2 — Analyzing tone & context:" note the appropriate tone and key points to include.
3. Then "Step 3 — Generating draft:" write the full email with a Subject line.
4. Then "Step 4 — Refining:" note 1-2 improvements you applied.
5. End with "✓ Delivered" and a one-line tip.

Be concise, professional, and genuinely helpful.""",

    "summary": """You are an expert summarization agent that works in clear steps.

When given a task:
1. "Step 1 — Understanding:" restate what needs summarizing (1 line).
2. "Step 2 — Extracting key points:" list the 3-5 most important points.
3. "Step 3 — Structuring the summary:" write a clean concise summary.
4. "Step 4 — Refining:" note simplifications or improvements made.
5. End with "✓ Delivered" and a brief note on what was prioritized.

Be clear, concise and useful.""",

    "plan": """You are an expert planning agent that creates clear, actionable plans.

When given a task:
1. "Step 1 — Understanding the goal:" restate the objective clearly (1-2 lines).
2. "Step 2 — Breaking it down:" identify 3-5 key phases or focus areas.
3. "Step 3 — Building the plan:" create a detailed week-by-week or phase-by-phase action plan.
4. "Step 4 — Refining:" add tips, tools, or resources to support success.
5. End with "✓ Plan Delivered" and a motivational one-liner.

Be practical and specific.""",

    "report": """You are an expert report writing agent that works in clear steps.

When given a task:
1. "Step 1 — Understanding the brief:" restate what report is needed (1-2 lines).
2. "Step 2 — Creating outline:" list the main sections briefly.
3. "Step 3 — Drafting the report:" write the full report with proper headings and content.
4. "Step 4 — Refining:" note improvements made to structure or clarity.
5. End with "✓ Report Delivered" and a note on tone/style used.

Be thorough and professional.""",

    "custom": """You are a versatile AI automation agent that handles any multi-step task.

When given a task:
1. "Step 1 — Understanding:" clearly restate the task (1-2 lines).
2. "Step 2 — Analyzing:" break down what's needed and your approach.
3. "Step 3 — Generating output:" produce the main deliverable fully.
4. "Step 4 — Refining:" note improvements or alternatives.
5. End with "✓ Delivered" and a brief summary of what was done.

Adapt your format to best suit the task."""
}


class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    mode: str = "custom"
    history: List[Message]


@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not request.history:
        raise HTTPException(status_code=400, detail="No messages provided.")

    try:
        system_prompt = SYSTEM_PROMPTS.get(request.mode, SYSTEM_PROMPTS["custom"])

        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_prompt
        )

        gemini_history = []
        for msg in request.history[:-1]:
            gemini_history.append({
                "role": "model" if msg.role == "assistant" else "user",
                "parts": [msg.content]
            })

        chat_session = model.start_chat(history=gemini_history)

        last_message = request.history[-1].content
        response = chat_session.send_message(last_message)
        reply = response.text or ""

        return {"reply": reply}

    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


app.mount("/static", StaticFiles(directory="public"), name="static")

@app.get("/style.css")
async def css():
    return FileResponse("public/style.css", media_type="text/css")

@app.get("/agent.js")
async def js():
    return FileResponse("public/agent.js", media_type="application/javascript")

@app.get("/")
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str = ""):
    return FileResponse("public/index.html")
