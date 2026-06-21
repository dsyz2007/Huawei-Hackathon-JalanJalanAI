# Huawei-Hackathon---JalanJalanAI

How to setup FastAPI Backend (repeat ALL 6 steps everytime u open the project):
1. Make sure ur current terminal is pointing to main project folder of Huawei-Hackathon-JalanJalanAI (type cd .. until it traverse up to parent folder until reach the project main folder instead of being inside backend folder)
2. type "python3 -m venv .venv" in terminal (This creates a folder with name of ".venv" in the "backend" folder. But don't worry it won't appear as a commit cos .gitignore already ignores "backend/.venv")
3. type "source .venv/bin/activate" into terminal (After doing this, (.venv) should appear at the start of each terminal line. The .venv stays active even if u cd to elsewhere, only way to stop it is to type deactivate or to close terminal).
4. type "pip install -r backend/requirements.txt" into terminal
5. type "uvicorn backend.main:app --reload --port 8000" into terminal ("uvicorn" is the web server that runs the app. The dot is python's way of saying "inside this folder". The colon ":" separates file from variable. "--reload" restarts the server whenever u save a file, convenient for live development. "-- port 8000" is because the frontend uses port 8000 so we use same to sync.)
6. Done. If u wanna test using command-line, u need to open a 2nd terminal. The use of this command "curl" (command-line tool to make HTTP request would be useful for testing app with command-line.
