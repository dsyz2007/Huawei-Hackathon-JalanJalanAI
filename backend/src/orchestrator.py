import uuid
from backend.src import onemap, checkpoints, glossary, overpass, ranking, gemini
from backend.src.models import RouteResponse, RouteStep, Instruction, Landmark
from dataclasses import replace

# Cap how many landmark candidates we hand Gemini per checkpoint. Keeps the prompt
# small and fast, and avoids hitting the free-tier token-per-minute rate limit.
MAX_CANDIDATES = 10

# In-memory store of generated routes so /checkpoints and /story can replay a route
# by its id without re-running geocode/routing/overpass.
_store: dict = {}



def _format_distance(metres: float) -> str:
    m = checkpoints.round_to_5(metres)
    if m >= 1000:
        return f"{m / 1000:.1f}km"
    return f"{m}m"


def _format_duration(seconds: float) -> str:
    minutes = max(1, round(seconds / 60))
    return f"{minutes} min" if minutes == 1 else f"{minutes} mins"


def _category_name(tags: dict) -> str:
    if tags.get("railway") == "subway_entrance":
        return "MRT entrance"
    if tags.get("highway") == "bus_stop":
        return "bus stop"
    if tags.get("amenity"):
        return tags["amenity"].replace("_", " ")
    if tags.get("shop"):
        return tags["shop"].replace("_", " ") + " shop"
    return "landmark"


def _to_landmark(feature: overpass.OsmFeature) -> Landmark:
    name = feature.name or _category_name(feature.tags)
    return Landmark(name=name, description=f"About {checkpoints.round_to_5(feature.dist_m)}m away")


def _pick_landmark(features, action, prefer_shelter: bool) -> Landmark | None:
    result = ranking.best_landmark(features, action, prefer_shelter)
    if result is None:
        return None
    feature, score = result
    landmark = _to_landmark(feature)
    landmark.salience_score = score
    return landmark


def _features_near(cp, all_features, radius: float = 150.0):
    near = []
    for f in all_features:
        d = onemap._haversine_m((cp.lat, cp.lng), (f.lat, f.lng))
        if d <= radius:
            near.append(replace(f, dist_m=d))   # a copy of f with dist_m set for THIS checkpoint
    return near


def build_route(origin: str, destination: str, language: str, prefer_shelter: bool) -> RouteResponse | None:
    start = onemap.geocode(origin)
    end = onemap.geocode(destination)
    if start is None or end is None:
        return None

    route_result = onemap.route(start, end, prefer_shelter)
    cps = checkpoints.extract_checkpoints(route_result, checkpoints.looks_like_mrt(origin))

    all_features = overpass.landmarks_for_points([(cp.lat, cp.lng) for cp in cps])
    features_per_cp = [
        sorted(_features_near(cp, all_features), key=lambda f: f.dist_m)[:MAX_CANDIDATES]
        for cp in cps
    ]

    steps = _build_steps(cps, features_per_cp, language, origin, destination, prefer_shelter)

    route_id = "rt-" + uuid.uuid4().hex[:8]
    distance = _format_distance(route_result.total_distance_m)
    duration = _format_duration(route_result.total_time_s)

    _store[route_id] = {
        "cps": cps,
        "features_per_cp": features_per_cp,
        "steps": steps,
        "origin": origin,
        "destination": destination,
        "prefer_shelter": prefer_shelter,
    }
    _persist_to_db(route_id, origin, destination, distance, duration, steps)

    return RouteResponse(route_id=route_id, distance=distance, duration=duration, steps=steps)


def get_checkpoints(route_id: str) -> list[RouteStep] | None:
    entry = _store.get(route_id)
    return entry["steps"] if entry else None


def get_story(route_id: str, language: str) -> list[RouteStep] | None:
    entry = _store.get(route_id)
    if entry is None:
        return None
    # re-run only the selection/phrasing step in the new language (skips the slow steps)
    return _build_steps(
        entry["cps"], entry["features_per_cp"], language,
        entry["origin"], entry["destination"], entry["prefer_shelter"],
    )


def _persist_to_db(route_id, origin, destination, distance, duration, steps):
    try:
        from backend.src.database import SessionLocal
        from backend.src import db_models
        db = SessionLocal()
        try:
            db.merge(db_models.Route(route_id=route_id, origin=origin, destination=destination,
                                     distance=distance, duration=duration))
            for s in steps:
                cp_id = f"{route_id}-{s.step}"
                db.merge(db_models.DBCheckpoint(
                    id=cp_id, route_id=route_id, step_number=s.step,
                    action=s.checkpoint.action.value, lat=s.checkpoint.lat, lng=s.checkpoint.lng,
                    distance=s.checkpoint.distance, bearing=s.checkpoint.bearing,
                ))
                if s.landmark:
                    db.add(db_models.DBLandmark(
                        checkpoint_id=cp_id, name=s.landmark.name, description=s.landmark.description,
                        image_url=s.landmark.image_url, salience_score=s.landmark.salience_score,
                    ))
            db.commit()
        finally:
            db.close()
    except Exception as e:
        import sys
        print(f"[db] route persist failed (non-fatal): {e}", file=sys.stderr)


def _build_steps(cps, features_per_cp, language, origin, destination, prefer_shelter):
    # Hand real candidates to the Gemini engine
    payload = [
        {
            "step": i,
            "action": cp.action.value,
            "candidates": [
                {"index": j, "name": f.name or _category_name(f.tags),
                 "type": _category_name(f.tags), "dist_m": checkpoints.round_to_5(f.dist_m)}
                for j, f in enumerate(feats)
            ],
        }
        for i, (cp, feats) in enumerate(zip(cps, features_per_cp), start=1)
    ]
    decision = gemini.decide_route(payload, language, prefer_shelter, origin, destination)
    by_step = {d.step: d for d in decision} if decision else {}

    steps = []
    for i, (cp, feats) in enumerate(zip(cps, features_per_cp), start=1):
        d = by_step.get(i)
        if d and 0 <= d.chosen_index < len(feats):           # Gemini engine path
            landmark = _to_landmark(feats[d.chosen_index])
            landmark.salience_score = round(d.confidence, 2)
            text, audio = d.instruction_text, d.instruction_audio
        else:                                                # deterministic fallback
            landmark = _pick_landmark(feats, cp.action, prefer_shelter)
            text, audio = glossary.phrase(cp.action, language, origin=origin,
                                          destination=destination,
                                          landmark=landmark.name if landmark else None)
        steps.append(RouteStep(step=i, checkpoint=cp, landmark=landmark,
                               instruction=Instruction(text=text, audio_text=audio, language=language)))
    return steps
