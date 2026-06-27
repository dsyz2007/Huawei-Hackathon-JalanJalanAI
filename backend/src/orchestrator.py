import uuid
from backend.src import onemap, checkpoints, glossary
from backend.src.models import RouteResponse, RouteStep, Instruction


def _format_distance(metres: float) -> str:
    metres = round(metres)
    if metres >= 1000:
        return f"{metres / 1000:.1f}km"
    return f"{metres}m"


def _format_duration(seconds: float) -> str:
    minutes = max(1, round(seconds / 60))
    return f"{minutes} min" if minutes == 1 else f"{minutes} mins"


def build_route(origin: str, destination: str, language: str, prefer_shelter: bool) -> RouteResponse | None:
    start = onemap.geocode(origin)
    end = onemap.geocode(destination)
    if start is None or end is None:
        return None

    route_result = onemap.route(start, end, prefer_shelter)
    cps = checkpoints.extract_checkpoints(route_result, checkpoints.looks_like_mrt(origin))

    steps = []
    for i, cp in enumerate(cps, start=1):
        text, audio = glossary.phrase(cp.action, language, origin=origin, destination=destination)
        steps.append(
            RouteStep(
                step=i,
                checkpoint=cp,
                instruction=Instruction(text=text, audio_text=audio, language=language),
            )
        )

    return RouteResponse(
        route_id="rt-" + uuid.uuid4().hex[:8],
        distance=_format_distance(route_result.total_distance_m),
        duration=_format_duration(route_result.total_time_s),
        steps=steps,
    )
