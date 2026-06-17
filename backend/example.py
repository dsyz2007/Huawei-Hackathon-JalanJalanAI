from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/api/example")
def example(count: int = 0):
    count += 1

    return {"count": count}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)