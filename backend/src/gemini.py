import json
import sys
import time
from pydantic import BaseModel
from backend.src import config

# Import the SDK defensively, so the app still boots if it's missing.
try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None


# --- What Gemini must return. IMPORTANT: no default values on these fields. ---
class StepDecision(BaseModel):
    step: int
    chosen_index: int        # index into that step's candidate list, or -1 if none fit
    instruction_text: str
    instruction_audio: str
    shelter_score: float     # 0-1, how covered/sheltered this spot is
    confidence: float        # 0-1


class RouteDecision(BaseModel):
    steps: list[StepDecision]


#Prompt Engineering
def _build_prompt(steps_payload, language: str, prefer_shelter: bool, origin: str, destination: str) -> str:
    rules = (
        "You are the navigation engine for an app guiding ELDERLY people on foot in Singapore. "
        f"The walk goes from '{origin}' to '{destination}'. "
        "For EACH step you get an action and a list of real nearby landmark candidates (each with an index). "
        "Choose the BEST landmark for an elderly walker: prefer permanent, highly visible, easy-to-describe "
        "places (MRT exits, bus stops, ATMs, post boxes, named buildings) over vague ones. "
        + ("Strongly prefer sheltered/covered options. " if prefer_shelter else "")
        + "Set chosen_index to the index of your pick from that step's candidates, or -1 if none are useful. "
        + f"Write a short, warm, simple instruction in this language: {language}. "
        + f"On the final 'arrive' step, tell the person they have arrived at {destination}. "
        + "instruction_text = one friendly sentence; instruction_audio = an even shorter spoken version. "
        + "shelter_score and confidence are each 0-1. Only pick from the given candidates — never invent a place."
    )
    payload_json = json.dumps(steps_payload, ensure_ascii=False)
    return f"{rules}\n\nSTEPS:\n{payload_json}"


def decide_route(steps_payload, language: str, prefer_shelter: bool, origin: str = "", destination: str = "") -> list[StepDecision] | None:
    if not config.has_gemini() or genai is None:
        return None
    client = genai.Client(api_key=config.GEMINI_API_KEY)
    prompt = _build_prompt(steps_payload, language, prefer_shelter, origin, destination)
    cfg = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=RouteDecision,
    )
    for attempt in range(3):
        try:
            resp = client.models.generate_content(model=config.GEMINI_MODEL, contents=prompt, config=cfg)
            decision = resp.parsed
            return decision.steps if decision is not None else None
        except Exception as e:
            msg = str(e)
            transient = any(code in msg for code in ("503", "429", "UNAVAILABLE", "RESOURCE_EXHAUSTED"))
            if transient and attempt < 2:
                time.sleep(1.5 * (attempt + 1))   # back off, then retry the transient spike
                continue
            print(f"[gemini] decide_route failed, using fallback: {e}", file=sys.stderr)
            return None
    return None
