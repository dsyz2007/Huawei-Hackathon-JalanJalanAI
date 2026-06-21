# Huawei-Hackathon---JalanJalanAI  

## How to setup FastAPI Backend (depending whether first-time setup on ur computer OR non-first-time setup on ur computer):  

ONE-TIME setup (only on a fresh machine with no backend/.venv — you can skip this, it's done):  
cd /home/dsyz/Huawei-Hackathon-JalanJalanAI  
python3 -m venv backend/.venv          # note the path: puts it INSIDE backend/ (gitignored). This creates a folder with name of ".venv" in the "backend" folder.  
source backend/.venv/bin/activate  
pip install -r backend/requirements.txt  


EVERY TIME you open the project (just these 3):  
cd /home/dsyz/Huawei-Hackathon-JalanJalanAI  
source backend/.venv/bin/activate      # (.venv) appears at the start of the line  
uvicorn backend.main:app --reload --port 8000  
  
  
  
Btw: You'll only re-run the one-time block again if you're on a new computer, or when we add new packages to requirements.txt (then just rerun pip install -r backend/requirements.txt once, with the venv active).
  
  
