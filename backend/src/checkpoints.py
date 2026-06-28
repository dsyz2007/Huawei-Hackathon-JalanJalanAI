import math
from backend.src.models import Checkpoint, Action
from backend.src.onemap import RouteResult, _haversine_m


def round_to_5(metres: float) -> int:
    m = round(metres)
    if m <= 0:
        return 0
    return max(5, round(m / 5) * 5)   # nearest 5, but never a tiny non-zero like 2m


def _bearing(a: tuple[float, float], b: tuple[float, float]) -> float:
    """Compass direction of travel from point a to point b. 0=N, 90=E, 180=S, 270=W."""
    lat1, lng1 = math.radians(a[0]), math.radians(a[1])
    lat2, lng2 = math.radians(b[0]), math.radians(b[1])
    d_lng = lng2 - lng1
    x = math.sin(d_lng) * math.cos(lat2)
    y = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(d_lng)
    return (math.degrees(math.atan2(x, y)) + 360) % 360


def _turn_delta(bearing_in: float, bearing_out: float) -> float:
    """How sharply you turn at a vertex. Negative = left, positive = right, range -180..180."""
    return ((bearing_out - bearing_in + 540) % 360) - 180


def _classify(delta: float) -> Action:
    if abs(delta) < 30:
        return Action.go_straight
    if delta < 0:
        return Action.turn_left
    return Action.turn_right


def _cumulative_distances(points: list[tuple[float, float]]) -> list[float]:
    """Running total distance (metres) from the start to each point."""
    dists = [0.0]
    for i in range(1, len(points)):
        dists.append(dists[-1] + _haversine_m(points[i - 1], points[i]))
    return dists


def looks_like_mrt(name: str) -> bool:
    name = name.lower()
    return any(word in name for word in ("mrt", "station", "interchange"))


# Main Function for Checkpoints
def extract_checkpoints(
    route: RouteResult,
    origin_is_mrt: bool,
    max_cp: int = 7,
    min_cp: int = 3,
) -> list[Checkpoint]:
    points = route.points
    if len(points) < 2:
        return []

    cumdist = _cumulative_distances(points)

    # direction of each segment (point i -> point i+1)
    bearings = [_bearing(points[i], points[i + 1]) for i in range(len(points) - 1)]

    # find real turns at the interior vertices
    candidates = []  # each is (point_index, action, sharpness)
    for v in range(1, len(points) - 1):
        delta = _turn_delta(bearings[v - 1], bearings[v])
        if abs(delta) >= 30:
            candidates.append((v, _classify(delta), abs(delta)))

    # keep only the sharpest turns, leaving room for the start + arrive checkpoints
    candidates.sort(key=lambda c: c[2], reverse=True)
    candidates = candidates[: max(0, max_cp - 2)]
    candidates.sort(key=lambda c: c[0])  # put them back in route order

    # assemble: start, the kept turns, then arrive
    raw = [(0, Action.exit_mrt if origin_is_mrt else Action.go_straight)]
    raw += [(v, action) for (v, action, _) in candidates]
    raw.append((len(points) - 1, Action.arrive))

    # if it's too short (e.g. a straight route), pad with a go_straight in the middle
    if len(raw) < min_cp:
        raw.insert(1, (len(points) // 2, Action.go_straight))

    # turn into Checkpoint objects
    checkpoints = []
    for n, (idx, action) in enumerate(raw, start=1):
        lat, lng = points[idx]
        checkpoints.append(
            Checkpoint(
                id=f"S{n}",
                action=action,
                lat=lat,
                lng=lng,
                distance=round_to_5(cumdist[idx]),
                bearing=round(bearings[min(idx, len(bearings) - 1)]),
            )
        )
    return checkpoints
