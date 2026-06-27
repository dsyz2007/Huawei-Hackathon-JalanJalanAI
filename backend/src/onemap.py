import math
from dataclasses import dataclass
from backend.src import gazetteer, config


@dataclass
class GeocodeResult:
    name: str
    lat: float
    lng: float
    source: str   # "onemap" or "gazetteer" (fallback if no onemap)


def geocode(query: str) -> GeocodeResult | None:
    # Lesson 10: live OneMap search will go here (when we have a key)
    # For now, we use the temporary built-in gazetteer for testing
    coords = gazetteer.lookup(query)
    if coords is None: # handle edge case of unable to find location name given in query
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
    # Lesson 10: if config.has_onemap(), call live OneMap routing here instead.
    return _synthetic_route(start, end)


