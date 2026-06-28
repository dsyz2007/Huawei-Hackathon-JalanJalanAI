# Huawei-Hackathon---JalanJalanAI  

## How to setup FastAPI Backend (depending whether first-time setup on ur computer OR non-first-time setup on ur computer):  

#### <u>FIRST-TIME setup (only on a fresh machine with no backend/.venv — only for ur first time setting up on ur computer):</u>  
cd /home/dsyz/Huawei-Hackathon-JalanJalanAI  
python3 -m venv backend/.venv          # note the path: puts it INSIDE backend/ (gitignored)   
source backend/.venv/bin/activate  
pip install -r backend/requirements.txt  
<br>
<br>

#### <u>EVERY TIME you open the project (just these 3):</u>  
cd /home/dsyz/Huawei-Hackathon-JalanJalanAI  
source backend/.venv/bin/activate      # (.venv) appears at the start of the line  
uvicorn backend.main:app --reload --port 8000  
  
<br>
<br>

Btw: You'll only re-run the FIRST-TIME setup block again if you're on a new computer, or when we add new packages to requirements.txt (then just rerun pip install -r backend/requirements.txt once, with the venv active).

<br>
<br>

## How to setup the React Frontend:

#### <u>FIRST-TIME setup (only on a fresh machine with no frontend/node_modules):</u>
```
cd /home/dsyz/Huawei-Hackathon-JalanJalanAI/frontend
npm install
```

#### <u>EVERY TIME (with the backend already running on port 8000, in another terminal):</u>
```
cd /home/dsyz/Huawei-Hackathon-JalanJalanAI/frontend
npm run dev          # opens http://localhost:5173
```

<br>
<br>

## API keys (`backend/.env`)

The app **runs without any keys** — it falls back to a built-in place list, a straight-line route, and template instructions. Add keys to unlock the real pipeline. Create `backend/.env`:
```
ONEMAP_EMAIL=your@email.com         # free account at onemap.gov.sg (real SG geocoding + walking routes)
ONEMAP_PASSWORD=yourpassword
GEMINI_API_KEY=your_key             # free key at aistudio.google.com (the AI engine)
GEMINI_MODEL=gemini-2.5-flash-lite  # optional; this is the default
```
Restart uvicorn after editing `.env`, then check `http://localhost:8000/health` → it should show `{"onemap": true, "gemini": true}`.

<br>
<br>

## What it does

JalanJalan AI turns a Singapore route into a few large "story cards" (one landmark + one instruction each) that older users can follow with very low cognitive load.

**Backend pipeline:** OneMap geocodes the origin/destination → OneMap returns a walking route → we reduce it to 3–7 checkpoints via turn detection → Overpass finds real nearby landmarks → the **Gemini engine** picks the best landmark per checkpoint, scores shelter, and writes the instruction in the chosen language. If Gemini (or any service) is unavailable, a deterministic ranker + template phrasing take over, so the app never breaks.

**Frontend (React + Vite):** story cards with browser text-to-speech in 9 languages (English, Singlish, Cantonese, Teochew, Hokkien, Chinese, Malay, Tamil, Hindi), live GPS progress, and a safety system (no-movement / wrong-direction alerts and a one-tap call to a next-of-kin).
  
  
