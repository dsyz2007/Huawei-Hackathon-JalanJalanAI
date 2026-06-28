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

JalanJalan AI turns any Singapore walking route into a short sequence of large **"story cards"** — each showing *one* landmark, *one* simple instruction, and *one* icon — so older users can navigate by what they **see** instead of reading dense map directions.

### Features

**🗺️ Route input**
- Enter any origin & destination — real Singapore places, building names, or 6-digit postal codes.
- **Autosuggest** of common SG places, a one-tap **swap** button, and a **shelter-first** preference for covered/barrier-free routes.
- Three one-tap **demo routes** for instant trials (work even with no internet/keys).

**🧭 Story cards (the core)**
- Each checkpoint = one landmark + one short instruction + a **category icon** (🚇 MRT, 🚌 bus stop, 🏧 ATM, 🏬 mall, 🏥 clinic, 📮 post box …) + the **live distance** to it.
- Swipe or tap through 3–7 steps, with a progress bar and a "jump to any step" drawer.
- Distances are rounded to clean multiples of 5 m to reduce reading effort.

**🔊 Audio narration**
- Browser text-to-speech reads each card aloud — free and on-device (no audio API cost).
- Per-language **voice-matching** with graceful fallback, slower speaking rates and sentence pauses for clarity.

**📍 Live navigation & safety**
- GPS tracks progress, **auto-advances** when you reach a checkpoint, and shows **which way** the landmark is (using the device compass heading).
- **Proactive help** triggers if you stop moving for too long or start walking the wrong way.
- **SOS popup**: one-tap call to a **configurable next-of-kin**, plus **"share my location"** (sends a live Google Maps pin via the phone's share sheet).

**🌏 9 languages**
- English, Singlish, Cantonese, Teochew, Hokkien, Chinese, Malay, Tamil, Hindi — picked on a dedicated **big-button** screen and remembered across visits.

### How it works (notable technical details)

**Grounded LLM decision engine.** Gemini is the *brain*: for every checkpoint it **picks the best landmark, ranks the candidates, scores shelter, and writes the instruction** in one structured-output call. Critically, it chooses a landmark **by index from a real candidate list** (sourced live from OpenStreetMap) — so it physically *cannot* hallucinate a place that doesn't exist. The AI supplies judgment; deterministic code guarantees grounding.

**Never-breaks fallback (adapter pattern).** Every external dependency has a live path *and* a no-key fallback: OneMap geocoding → built-in gazetteer; OneMap routing → synthetic straight-line route; Overpass → static set; Gemini → a deterministic 5-dimension ranker + locked phrase templates. The entire app **runs with zero API keys** — keys only *upgrade* fidelity. Transient Gemini `503`/`429` spikes are retried with backoff before any fallback.

**Deterministic checkpoint extraction.** The walking polyline is reduced to 3–7 memorable steps with bearing math (signed turn angles → `turn_left`/`turn_right`/`go_straight`), a forced "exit MRT" start and "arrive" end, then capped and padded so every route stays digestible.

**Deterministic 5-dimension ranker** (the fallback brain) scores each OSM feature on **permanence, visibility, turn-relevance, uniqueness, and accessibility**, re-weighting toward shelter when requested.

**Performance & cost engineering.** A route's checkpoints are resolved in a **single batched Overpass query** (with mirror-rotation + in-memory caching), candidates are capped to the best ~10 per checkpoint, and Gemini is called **once per route** — keeping latency low and usage inside the free tier.

**Other details:** OneMap token caching + Google-polyline decoding; **SQLite persistence** plus an in-memory route store powering `/checkpoints` and `/story` (re-translate a saved route into a new language *without* re-routing); Pydantic alias models bridging snake_case Python ↔ camelCase JSON; and a multilingual TTS layer with Chrome keep-alive and sentence-pause handling.
  
  
