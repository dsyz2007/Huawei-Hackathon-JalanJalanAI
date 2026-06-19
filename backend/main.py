from fastapi import FastAPI
from backend.src.models import (
    Action,
    RouteRequest,
    RouteResponse,
    RouteStep,
    Checkpoint,
    Landmark,
    Instruction,
)


app = FastAPI(title = "JalanJalan AI")

@app.get('/health')
def health():
    return {"ok" : True}


@app.post('/route', response_model=RouteResponse)
def route(req: RouteRequest):
    return RouteResponse(
        route_id = "rt-demo",
        distance = "650m",
        duration = "8 min",
        steps = [
            RouteStep(
                step=1,
                checkpoint=Checkpoint(
                    id = "S1", action = Action.exit_mrt, lat = 1.3236, lng = 103.93, distance = 0                   
                ),
                landmark=Landmark(
                    name = "Bedok MRT Exit B", description = "Blue MRT sign above the exit"
                ),
                instruction=Instruction(
                    text = f"Exit at {req.origin}.",
                    audio_text = "Exit here.",
                    language = req.language,
                ),
            )
        ],
    )