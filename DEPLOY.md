# Deploying JalanJalan AI

Two free services: **Render** (FastAPI backend) + **Vercel** (React frontend). Both deploy straight from this GitHub repo.

---

## 1. Backend → Render

1. Go to **render.com** → sign up (free) → **New → Web Service** → connect this GitHub repo.
2. Settings:
   - **Root Directory:** *(leave blank — repo root)*
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free
3. Add **Environment Variables** (Advanced → Add):
   | Key | Value |
   |---|---|
   | `PYTHON_VERSION` | `3.11.9` |
   | `GEMINI_API_KEY` | *your Gemini key* |
   | `GEMINI_MODEL` | `gemini-2.5-flash-lite` |
   | `ONEMAP_EMAIL` | *your OneMap email* |
   | `ONEMAP_PASSWORD` | *your OneMap password* |
   | `MAPILLARY_TOKEN` | *your Mapillary token* |
   | `CORS_ORIGINS` | `*` *(simplest; tighten to your Vercel URL later)* |
4. **Create Web Service.** You'll get a URL like `https://jalanjalan-backend.onrender.com`.
5. Test it: open `https://<your-backend>/health` → should show `{"ok":true,...}`.

> The repo also has a `render.yaml` — you can instead use **New → Blueprint** and it pre-fills these settings (you still paste the secret values).

---

## 2. Frontend → Vercel

1. Go to **vercel.com** → sign up (free) → **Add New → Project** → import this repo.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite *(auto-detected)*
   - Build Command `npm run build`, Output Directory `dist` *(auto)*
3. Add **Environment Variable**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | your Render backend URL, e.g. `https://jalanjalan-backend.onrender.com` |
4. **Deploy.** You'll get a URL like `https://jalanjalan.vercel.app`.

---

## 3. Connect them

- If you set `CORS_ORIGINS=*` on Render, you're done.
- For a tighter setup: set Render's `CORS_ORIGINS` to your exact Vercel URL (e.g. `https://jalanjalan.vercel.app`) and redeploy the backend.
- Open the Vercel URL and generate a route to confirm the full stack works.

---

## Notes
- **Render free tier sleeps after ~15 min idle** and takes ~1 min to wake. Before judging, open `/health` once to warm it up.
- The app **works without any keys** (fallbacks), so it deploys even before you add credentials — keys just turn on live OneMap / Gemini / photos.
- The SQLite DB on Render is ephemeral (resets on redeploy); demo routes re-seed automatically on startup, so this is fine.
- The frontend has a `vercel.json` so client-side routes (`/route`, `/story`, `/language`) don't 404 on refresh.
