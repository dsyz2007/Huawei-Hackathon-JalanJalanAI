import os
from pathlib import Path
from dotenv import load_dotenv


# Load backend/.env (if it exists) into environment variables
_ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(_ENV_PATH)


ONEMAP_EMAIL = os.getenv("ONEMAP_EMAIL")
ONEMAP_PASSWORD = os.getenv("ONEMAP_PASSWORD")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
GOOGLE_MAPS_KEY = os.getenv("GOOGLE_MAPS_KEY")
MAPILLARY_TOKEN = os.getenv("MAPILLARY_TOKEN")


def has_onemap() -> bool:
    return bool(ONEMAP_EMAIL and ONEMAP_PASSWORD)

def has_gemini() -> bool:
    return bool(GEMINI_API_KEY)

def has_maps() -> bool:
    return bool(GOOGLE_MAPS_KEY)

def has_mapillary() -> bool:
    return bool(MAPILLARY_TOKEN)

