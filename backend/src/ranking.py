from backend.src import overpass
from backend.src.models import Action


def _category_key(tags: dict) -> str:
    for k in ("railway", "highway", "amenity", "shop"):
        if tags.get(k):
            return f"{k}={tags[k]}"
    return "other"


def _permanence(tags: dict) -> float:
    if tags.get("railway") in ("subway_entrance", "station"):
        return 1.0
    if tags.get("amenity") in ("bank", "atm", "post_box", "place_of_worship"):
        return 0.9
    if tags.get("highway") == "bus_stop" or tags.get("amenity") in ("shelter", "bus_station"):
        return 0.85
    if tags.get("amenity") in ("clinic", "hospital", "pharmacy"):
        return 0.8
    if tags.get("shop"):
        return 0.5
    return 0.4


def _visibility(tags: dict) -> float:
    if tags.get("railway") == "subway_entrance":
        return 1.0
    if tags.get("amenity") in ("post_box", "bank", "atm", "bus_station"):
        return 0.85
    if tags.get("highway") == "bus_stop":
        return 0.8
    if tags.get("amenity") in ("place_of_worship", "shelter"):
        return 0.7
    if tags.get("amenity") in ("clinic", "hospital", "pharmacy") or tags.get("shop"):
        return 0.5
    return 0.3


def _turn_relevance(feature: overpass.OsmFeature, action: Action) -> float:
    falloff = max(0.0, 1.0 - feature.dist_m / 120.0)   # closer = higher
    if action == Action.exit_mrt and feature.tags.get("railway") == "subway_entrance":
        falloff = min(1.0, falloff + 0.3)              # MRT exit fits an exit_mrt step
    return falloff


def _uniqueness(feature: overpass.OsmFeature, all_features: list[overpass.OsmFeature]) -> float:
    cat = _category_key(feature.tags)
    same = sum(1 for f in all_features if _category_key(f.tags) == cat)
    base = 1.0 / same                                  # rarer category = higher
    if feature.name:
        base = min(1.0, base + 0.1)                    # named places are more distinctive
    return base


def _accessibility(tags: dict) -> float:
    if tags.get("covered") == "yes" or tags.get("amenity") == "shelter":
        return 1.0
    if tags.get("highway") == "bus_stop" and tags.get("shelter") == "yes":
        return 0.9
    if tags.get("wheelchair") == "yes":
        return 0.6
    return 0.3


def score_feature(feature, action, all_features, prefer_shelter: bool = False) -> float:
    if prefer_shelter:
        w = {"perm": 0.25, "vis": 0.20, "turn": 0.20, "uniq": 0.10, "acc": 0.25}
    else:
        w = {"perm": 0.30, "vis": 0.25, "turn": 0.20, "uniq": 0.15, "acc": 0.10}

    score = (
        w["perm"] * _permanence(feature.tags)
        + w["vis"] * _visibility(feature.tags)
        + w["turn"] * _turn_relevance(feature, action)
        + w["uniq"] * _uniqueness(feature, all_features)
        + w["acc"] * _accessibility(feature.tags)
    )
    return round(min(1.0, score), 2)


def best_landmark(features, action, prefer_shelter: bool = False):
    if not features:
        return None
    scored = [(f, score_feature(f, action, features, prefer_shelter)) for f in features]
    scored.sort(key=lambda pair: (pair[1], -pair[0].dist_m), reverse=True)
    return scored[0]   # (feature, score)
