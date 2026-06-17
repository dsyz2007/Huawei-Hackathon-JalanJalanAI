from fastapi import FastAPI
from backend.src.services import orchestrator
import uvicorn

app = FastAPI()

@app.get("api/directions")
def getDirections(prompt: str = ""):
    resp = orchestrator.get_path(prompt)
    return {"response": resp}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)

