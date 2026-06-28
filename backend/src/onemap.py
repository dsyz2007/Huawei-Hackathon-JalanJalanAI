import math
import time
import requests
import polyline
from dataclasses import dataclass
from backend.src import gazetteer, config


ONEMAP_BASE = "https://www.onemap.gov.sg"
_token_cache = {"token": None, "expires_at": 0.0}


def _get_token() -> str | None:
    if not config.has_onemap():
        return None
    now = time.time()
    if _token_cache["token"] and now < _token_cache["expires_at"]:
        return _token_cache["token"]   # reuse cached token
    try:
        resp = requests.post(
            f"{ONEMAP_BASE}/api/auth/post/getToken",
            json={"email": config.ONEMAP_EMAIL, "password": config.ONEMAP_PASSWORD},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
    except (requests.RequestException, ValueError):
        return None
    token = data.get("access_token")
    if token:
        _token_cache["token"] = token
        _token_cache["expires_at"] = now + 2 * 24 * 3600   # token lasts ~3 days; refresh after 2
    return token



def _onemap_route(start: GeocodeResult, end: GeocodeResult, prefer_shelter: bool) -> RouteResult | None:
    token = _get_token()
    if token is None:
        return None
    try:
        resp = requests.get(
            f"{ONEMAP_BASE}/api/public/routingsvc/route",
            params={
                "start": f"{start.lat},{start.lng}",
                "end": f"{end.lat},{end.lng}",
                "routeType": "walk",   # shelter is handled downstream (ranking / Gemini), not here
            },
            headers={"Authorization": f"Bearer {token}"},
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()
    except (requests.RequestException, ValueError):
        return None

    geometry = data.get("route_geometry")
    if not geometry:
        return None
    summary = data.get("route_summary") or {}

    return RouteResult(
        points=polyline.decode(geometry),                       # encoded string -> [(lat, lng), ...]
        instructions=data.get("route_instructions") or [],
        total_distance_m=float(summary.get("total_distance", 0)),
        total_time_s=float(summary.get("total_time", 0)),
        source="onemap",
    )



@dataclass
class GeocodeResult:
    name: str
    lat: float
    lng: float
    source: str   # "onemap" or "gazetteer" (fallback if no onemap)


def _onemap_geocode(query: str) -> GeocodeResult | None:
    token = _get_token()
    if token is None:
        return None
    try:
        resp = requests.get(
            f"{ONEMAP_BASE}/api/common/elastic/search",
            params={"searchVal": query, "returnGeom": "Y", "getAddrDetails": "Y", "pageNum": 1},
            headers={"Authorization": f"Bearer {token}"},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
    except (requests.RequestException, ValueError):
        return None
    results = data.get("results") or []
    if not results:
        return None
    top = results[0]
    try:
        lat, lng = float(top["LATITUDE"]), float(top["LONGITUDE"])
    except (KeyError, ValueError, TypeError):
        return None
    return GeocodeResult(name=top.get("SEARCHVAL") or query.strip(), lat=lat, lng=lng, source="onemap")


def geocode(query: str) -> GeocodeResult | None:
    if config.has_onemap():
        result = _onemap_geocode(query)
        if result is not None:
            return result
    # fallback: built-in gazetteer (used when no keys, or OneMap fails)
    coords = gazetteer.lookup(query)
    if coords is None:
        return None
    lat, lng = coords
    return GeocodeResult(name=query.strip(), lat=lat, lng=lng, source="gazetteer")



@dataclass
class RouteResult:
    points: list[tuple[float, float]]   # the path as a list of (lat, lng)
    instructions: list                  # turn-by-turn from OneMap (empty for synthetic)
    total_distance_m: float
    total_time_s: float
    source: str                         # "onemap" or "synthetic"


def _haversine_m(a: tuple[float, float], b: tuple[float, float]) -> float:
    R = 6_371_000  # Earth's radius in metres
    lat1, lng1 = a
    lat2, lng2 = b
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    h = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(h), math.sqrt(1 - h))


def _synthetic_route(start: GeocodeResult, end: GeocodeResult, num_points: int = 20) -> RouteResult:
    points = []
    for i in range(num_points + 1):
        t = i / num_points
        lat = start.lat + (end.lat - start.lat) * t
        lng = start.lng + (end.lng - start.lng) * t
        points.append((lat, lng))

    distance_m = _haversine_m((start.lat, start.lng), (end.lat, end.lng))
    walking_speed = 1.3  # metres per second (~4.7 km/h)
    time_s = distance_m / walking_speed

    return RouteResult(
        points=points,
        instructions=[],
        total_distance_m=distance_m,
        total_time_s=time_s,
        source="synthetic",
    )


def route(start: GeocodeResult, end: GeocodeResult, prefer_shelter: bool = False) -> RouteResult:
    if config.has_onemap():
        result = _onemap_route(start, end, prefer_shelter)
        if result is not None:
            return result
    return _synthetic_route(start, end)   # fallback: no key, or OneMap failed


