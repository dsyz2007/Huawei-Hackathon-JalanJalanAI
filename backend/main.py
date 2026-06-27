from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.src import demo_data
from backend.src import init_db
from backend.src import config
from backend.src import onemap
from backend.src.models import (
    Action,
    RouteRequest,
    RouteResponse,
    RouteStep,
    Checkpoint,
    Landmark,
    Instruction,
    DemoRouteRequest
)


app = FastAPI(title = "JalanJalan AI")

@app.on_event("startup")
def startup():
    init_db.init()

#add CORS (Cross-Origin Resource Sharing) to allow frontend and backend to link and call each other
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], #the list of origins permitted to call you (5173 is Vite's default dev-server port, list both localhost and 127.0.0.1 as they count as diff origins)
    allow_credentials=True, #Permit cookies/auth headers to ride along
    allow_methods=["*"], # '*' allow all HTTP methods (e.g. GET, POST, OPTIONS, ...)
    allow_headers=["*"] # '*' allow all request headers (e.g. Content-Type)
)

@app.get('/health')
def health():
    return {"ok" : True, "onemap": config.has_onemap(), "gemini": config.has_gemini()}


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
                    language = req.language
                )
            )
        ]
    )


@app.post('/demo-route', response_model=RouteResponse)
def demo_route(req: DemoRouteRequest):
    return demo_data.get_demo_route(req.id, req.language)


@app.get('/geocode')
def geocode_place(q: str):
    result = onemap.geocode(q)
    if result is None:
        return {"found": False, "query": q}
    else:
        return {
            "found": True,
            "name": result.name,
            "lat": result.lat,
            "lng": result.lng,
            "source": result.source
        }


@app.get("/route-debug")
def route_debug(origin: str, destination: str):
    start = onemap.geocode(origin)
    end = onemap.geocode(destination)
    if start is None or end is None:
        return {"found": False, "origin": origin, "destination": destination}
    result = onemap.route(start, end)
    return {
        "found": True,
        "source": result.source,
        "distance_m": round(result.total_distance_m),
        "time_s": round(result.total_time_s),
        "num_points": len(result.points),
        "points": result.points,
    }
