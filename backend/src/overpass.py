import requests
from dataclasses import dataclass
from backend.src.onemap import _haversine_m

# Try mirrors in order until one answers (the main one is usually fine)
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]
# Identifying yourself is OSM etiquette and reduces throttling (OSM services tend to to throttle anonymouse traffic more)
HEADERS = {"User-Agent": "JalanJalanAI/1.0 (Huawei hackathon project)"}

# In-memory cache so we never re-query the same spot in a session
_cache: dict = {}



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



def _query(lat: float, lng: float, radius: int) -> list["OsmFeature"]:
    ql = _build_query(lat, lng, radius)
    for url in OVERPASS_URLS:
        try:
            resp = requests.post(url, data={"data": ql}, headers=HEADERS, timeout=20)
            if resp.status_code in (429, 504):   # too busy / overloaded
                continue                          # -> try the next mirror
            resp.raise_for_status()
            return _parse(resp.json(), lat, lng)
        except (requests.RequestException, ValueError):
            continue                              # unreachable -> try the next mirror
    return []                                     # all failed -> graceful fallback


def _parse(data: dict, lat: float, lng: float) -> list["OsmFeature"]:
    features = []
    for el in data.get("elements", []):
        el_lat, el_lng = el.get("lat"), el.get("lon")
        if el_lat is None or el_lng is None:
            continue
        tags = el.get("tags", {})
        features.append(
            OsmFeature(
                osm_id=el.get("id"), name=tags.get("name"), tags=tags,
                lat=el_lat, lng=el_lng,
                dist_m=_haversine_m((lat, lng), (el_lat, el_lng)),
            )
        )
    return features



def nearby_landmarks(lat: float, lng: float, radii=(60, 150)) -> list[OsmFeature]:
    key = (round(lat, 4), round(lng, 4))   # ~11m precision
    if key in _cache:
        return _cache[key]
    for radius in radii:
        features = _query(lat, lng, radius)
        if features:
            _cache[key] = features          # remember successes
            return features
    return []                               # don't cache failures, so retries can still succeed
