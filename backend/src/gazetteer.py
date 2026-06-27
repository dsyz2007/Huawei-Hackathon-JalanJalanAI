# A small built-in table of common Singapore places -> (lat, lng)
# Used to geocode when we don't have a OneMap key yet

PLACES = {
    "bedok mrt": (1.3236, 103.9300),
    "bedok interchange": (1.3250, 103.9315),
    "tampines mrt": (1.3527, 103.9451),
    "tampines mall": (1.3533, 103.9458),
    "ang mo kio mrt": (1.3699, 103.8492),
    "amk hub": (1.3705, 103.8498)
}


def normalize(name: str) -> str:
    return name.strip().lower()


def lookup(name: str):
    return PLACES.get(normalize(name))

