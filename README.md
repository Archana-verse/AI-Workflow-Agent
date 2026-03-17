# AI Workflow Automation Agent

An AI-powered multi-step automation agent built with **Gemini 2.5 Flash (Google AI)** and **Python FastAPI**. It takes any task, breaks it into steps, generates content, refines it, and delivers the result — all through a clean chat interface.

## Features

- 5 task modes: Write Email, Summarize, Action Plan, Draft Report, Custom Task
- Real-time pipeline step tracker (Understand → Analyze → Generate → Refine → Deliver)
- Persistent conversation history per session
- Secure backend — API key never exposed to browser
- Fully responsive, works on mobile

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Python, FastAPI, Uvicorn
- **AI**: Google Gemini API (`gemini-2.5-flash`)

---

## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Archana-verse/AI-Workflow-Agent.git
cd AI-Workflow-Agent
```

### 2. Create a virtual environment
```bash
python -m venv venv

# Activate on Windows:
venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Add your API key

Create a `.env` file in the project root:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

### 5. Run the app
```bash
uvicorn main:app --reload
```

Visit [http://localhost:8000](http://localhost:8000)

---

## Project Structure
```
AI-Workflow-Agent/
├── public/
│   ├── index.html      # App UI
│   ├── style.css       # Styles
│   └── agent.js        # Frontend logic
├── main.py             # FastAPI server + Gemini API
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variable template
├── .gitignore
└── README.md
```

---

## Getting a Gemini API Key (Free)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **Create API key → Create API key in new project**
4. Copy the key and paste it into your `.env` file

---

## License

MIT