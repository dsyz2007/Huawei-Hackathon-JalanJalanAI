import uuid
from backend.src import onemap, checkpoints, glossary, overpass
from backend.src.models import RouteResponse, RouteStep, Instruction, Landmark


def _format_distance(metres: float) -> str:
    metres = round(metres)
    if metres >= 1000:
        return f"{metres / 1000:.1f}km"
    return f"{metres}m"


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
    return Landmark(name=name, description=f"About {round(feature.dist_m)}m away")


def _pick_landmark(features: list[overpass.OsmFeature]) -> Landmark | None:
    if not features:
        return None
    nearest = min(features, key=lambda f: f.dist_m)   # Lesson 9 replaces this with ranking
    return _to_landmark(nearest)


def build_route(origin: str, destination: str, language: str, prefer_shelter: bool) -> RouteResponse | None:
    start = onemap.geocode(origin)
    end = onemap.geocode(destination)
    if start is None or end is None:
        return None

    route_result = onemap.route(start, end, prefer_shelter)
    cps = checkpoints.extract_checkpoints(route_result, checkpoints.looks_like_mrt(origin))

    steps = []
    for i, cp in enumerate(cps, start=1):
        landmark = _pick_landmark(overpass.nearby_landmarks(cp.lat, cp.lng))
        text, audio = glossary.phrase(
            cp.action, language,
            origin=origin, destination=destination,
            landmark=landmark.name if landmark else None,
        )
        steps.append(
            RouteStep(
                step=i,
                checkpoint=cp,
                landmark=landmark,
                instruction=Instruction(text=text, audio_text=audio, language=language),
            )
        )

    return RouteResponse(
        route_id="rt-" + uuid.uuid4().hex[:8],
        distance=_format_distance(route_result.total_distance_m),
        duration=_format_duration(route_result.total_time_s),
        steps=steps,
    )
