import requests
from dataclasses import dataclass
from backend.src.onemap import _haversine_m

OVERPASS_URL = "https://overpass-api.de/api/interpreter"


@dataclass
class OsmFeature:
    osm_id: int
    name: str | None
    tags: dict
    lat: float
    lng: float
    dist_m: float


def _build_query(lat: float, lng: float, radius: int) -> str:
    around = f"around:{radius},{lat},{lng}"
    return f"""[out:json][timeout:15];
(
  node({around})[railway=subway_entrance];
  node({around})[highway=bus_stop];
  node({around})[amenity~"^(atm|bank|post_box|clinic|hospital|pharmacy|place_of_worship|shelter|bus_station)$"];
  node({around})[shop][name];
);
out body;"""


def _query(lat: float, lng: float, radius: int) -> list[OsmFeature]:
    ql = _build_query(lat, lng, radius)
    try:
        resp = requests.post(OVERPASS_URL, data={"data": ql}, timeout=20)
        resp.raise_for_status()
        data = resp.json()
    except (requests.RequestException, ValueError):
        return []  # network error / bad JSON -> graceful fallback

    features = []
    for el in data.get("elements", []):
        el_lat, el_lng = el.get("lat"), el.get("lon")
        if el_lat is None or el_lng is None:
            continue
        tags = el.get("tags", {})
        features.append(
            OsmFeature(
                osm_id=el.get("id"),
                name=tags.get("name"),
                tags=tags,
                lat=el_lat,
                lng=el_lng,
                dist_m=_haversine_m((lat, lng), (el_lat, el_lng)),
            )
        )
    return features


def nearby_landmarks(lat: float, lng: float, radii=(30, 60, 120)) -> list[OsmFeature]:
    for radius in radii:
        features = _query(lat, lng, radius)
        if features:
            return features
    return []
