from dataclasses import dataclass
from backend.src import gazetteer


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

