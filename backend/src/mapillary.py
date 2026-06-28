import requests
from backend.src import config

# Mapillary = free crowd-sourced street-level photos (only needs a token, no billing).
GRAPH_URL = "https://graph.mapillary.com/images"

# cache: (rounded lat, rounded lng) -> image url, so we don't re-query the same spot
_cache: dict = {}


def image_url_near(lat: float, lng: float) -> str | None:
    """Return a real street-level photo URL near (lat, lng), or None if unavailable."""
    if not config.has_mapillary():
        return None
    key = (round(lat, 4), round(lng, 4))
    if key in _cache:
        return _cache[key]

    d = 0.0005  # ~55m half-box around the point
    bbox = f"{lng - d},{lat - d},{lng + d},{lat + d}"
    try:
        resp = requests.get(
            GRAPH_URL,
            params={
                "access_token": config.MAPILLARY_TOKEN,
                "fields": "thumb_1024_url",
                "bbox": bbox,
                "limit": 1,
            },
            timeout=4,
        )
        resp.raise_for_status()
        data = resp.json()
    except (requests.RequestException, ValueError):
        return None  # graceful fallback -> frontend shows an icon

    items = data.get("data") or []
    url = items[0].get("thumb_1024_url") if items else None
    if url:
        _cache[key] = url
    return url
