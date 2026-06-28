import json
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
def _build_prompt(steps_payload, language: str, prefer_shelter: bool) -> str:
    rules = (
        "You are the navigation engine for an app guiding ELDERLY people on foot in Singapore. "
        "For EACH step you get an action and a list of real nearby landmark candidates (each with an index). "
        "Choose the BEST landmark for an elderly walker: prefer permanent, highly visible, easy-to-describe "
        "places (MRT exits, bus stops, ATMs, post boxes, named buildings) over vague ones. "
        + ("Strongly prefer sheltered/covered options. " if prefer_shelter else "")
        + "Set chosen_index to the index of your pick from that step's candidates, or -1 if none are useful. "
        + f"Write a short, warm, simple instruction in this language: {language}. "
        + "instruction_text = one friendly sentence; instruction_audio = an even shorter spoken version. "
        + "shelter_score and confidence are each 0-1. Only pick from the given candidates — never invent a place."
    )
    payload_json = json.dumps(steps_payload, ensure_ascii=False)
    return f"{rules}\n\nSTEPS:\n{payload_json}"


def decide_route(steps_payload, language: str, prefer_shelter: bool) -> list[StepDecision] | None:
    if not config.has_gemini() or genai is None:
        return None
    try:
        client = genai.Client(api_key=config.GEMINI_API_KEY)
        resp = client.models.generate_content(
            model=config.GEMINI_MODEL,
            contents=_build_prompt(steps_payload, language, prefer_shelter),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RouteDecision,
            ),
        )
        decision = resp.parsed
    except Exception:
        return None          # any failure (rate limit, network, bad JSON) -> fallback
    if decision is None:
        return None
    return decision.steps
