from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.src import demo_data
from backend.src import init_db
from backend.src import config
from backend.src import onemap
from backend.src import checkpoints
from backend.src import orchestrator
from backend.src import overpass
from backend.src import ranking
from backend.src import gemini
from backend.src.models import (
    Action,
    RouteRequest,
    RouteResponse,
    RouteStep,
    Checkpoint,
    Landmark,
    Instruction,
    DemoRouteRequest,
    CheckpointsRequest,
    StoryRequest,
)


app = FastAPI(title = "JalanJalan AI")

@app.on_event("startup")
def startup():
    init_db.init()

#add CORS (Cross-Origin Resource Sharing) to allow frontend and backend to link and call each other
_origins = config.cors_origins()          # set via CORS_ORIGINS env (comma-separated), or "*"
_allow_all = _origins == ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=not _allow_all,     # credentials can't be combined with "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/health')
def health():
    return {"ok" : True, "onemap": config.has_onemap(), "gemini": config.has_gemini(), "maps": config.has_maps()}


@app.post("/route", response_model=RouteResponse)
def route(req: RouteRequest):
    result = orchestrator.build_route(req.origin, req.destination, req.language, req.prefer_shelter)
    if result is None:
        raise HTTPException(status_code=404, detail="Could not find that origin or destination.")
    return result


@app.post("/checkpoints", response_model=list[RouteStep])
def checkpoints_endpoint(req: CheckpointsRequest):
    steps = orchestrator.get_checkpoints(req.route_id)
    if steps is None:
        raise HTTPException(status_code=404, detail="Route not found (it may have expired).")
    return steps


@app.post("/story", response_model=list[RouteStep])
def story_endpoint(req: StoryRequest):
    steps = orchestrator.get_story(req.route_id, req.language)
    if steps is None:
        raise HTTPException(status_code=404, detail="Route not found (it may have expired).")
    return steps


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


@app.get("/checkpoints-debug")
def checkpoints_debug(origin: str, destination: str):
    start = onemap.geocode(origin)
    end = onemap.geocode(destination)
    if start is None or end is None:
        return {"found": False}
    result = onemap.route(start, end)
    cps = checkpoints.extract_checkpoints(result, checkpoints.looks_like_mrt(origin))
    return {"found": True, "count": len(cps), "checkpoints": cps}


@app.get("/landmarks-debug")
def landmarks_debug(lat: float, lng: float):
    features = overpass.nearby_landmarks(lat, lng)
    return {
        "count": len(features),
        "landmarks": [{"name": f.name, "dist_m": round(f.dist_m), "tags": f.tags} for f in features],
    }


@app.get("/rank-debug")
def rank_debug(lat: float, lng: float):
    features = overpass.nearby_landmarks(lat, lng)
    scored = sorted(
        ((f, ranking.score_feature(f, Action.go_straight, features)) for f in features),
        key=lambda p: p[1],
        reverse=True,
    )
    return {
        "ranked": [
            {
                "name": f.name or "(unnamed)",
                "category": ranking._category_key(f.tags),
                "dist_m": round(f.dist_m),
                "score": s,
            }
            for f, s in scored
        ]
    }


@app.get("/onemap-token-debug")
def onemap_token_debug():
    return {"got_token": bool(onemap._get_token())}


@app.get("/gemini-debug")
def gemini_debug(language: str = "english"):
    sample = [
        {"step": 1, "action": "exit_mrt", "candidates": [
            {"index": 0, "name": "Bedok MRT Exit B", "type": "subway entrance", "dist_m": 10},
            {"index": 1, "name": "7-Eleven", "type": "shop", "dist_m": 25},
        ]},
        {"step": 2, "action": "arrive", "candidates": [
            {"index": 0, "name": "Bedok Interchange", "type": "bus station", "dist_m": 15},
        ]},
    ]
    decision = gemini.decide_route(sample, language, prefer_shelter=False)
    if decision is None:
        return {"ok": False, "reason": "no key, package missing, or Gemini failed"}
    return {"ok": True, "steps": [d.model_dump() for d in decision]}
