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
  
  
