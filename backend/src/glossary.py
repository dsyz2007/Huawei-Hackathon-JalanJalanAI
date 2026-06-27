from backend.src.models import Action

# Per-language sentence templates for each action.
# Each value is (display_text, audio_text). Slots available: {origin}, {destination}.
GLOSSARY = {
    "english": {
        Action.exit_mrt:    ("Exit the station and head outside.", "Exit the station."),
        Action.turn_left:   ("Turn left and keep walking.", "Turn left."),
        Action.turn_right:  ("Turn right and keep walking.", "Turn right."),
        Action.go_straight: ("Walk straight ahead.", "Walk straight."),
        Action.cross_road:  ("Cross the road carefully.", "Cross the road."),
        Action.arrive:      ("You have arrived at {destination}!", "You have arrived!"),
    },
    "singlish": {
        Action.exit_mrt:    ("Go out the station first.", "Go out the station."),
        Action.turn_left:   ("Turn left, then walk walk.", "Turn left lah."),
        Action.turn_right:  ("Turn right, then walk walk.", "Turn right lah."),
        Action.go_straight: ("Just walk straight can already.", "Walk straight."),
        Action.cross_road:  ("Cross the road, careful ah.", "Cross the road."),
        Action.arrive:      ("Reached liao! {destination}!", "Reached liao!"),
    },
    "chinese": {
        Action.exit_mrt:    ("走出地铁站。", "走出地铁站。"),
        Action.turn_left:   ("向左转，继续走。", "向左转。"),
        Action.turn_right:  ("向右转，继续走。", "向右转。"),
        Action.go_straight: ("一直往前走。", "往前走。"),
        Action.cross_road:  ("小心过马路。", "过马路。"),
        Action.arrive:      ("您已到达{destination}！", "您已到达！"),
    },
    "malay": {
        Action.exit_mrt:    ("Keluar dari stesen.", "Keluar dari stesen."),
        Action.turn_left:   ("Belok kiri dan terus berjalan.", "Belok kiri."),
        Action.turn_right:  ("Belok kanan dan terus berjalan.", "Belok kanan."),
        Action.go_straight: ("Jalan terus ke hadapan.", "Jalan terus."),
        Action.cross_road:  ("Lintas jalan dengan berhati-hati.", "Lintas jalan."),
        Action.arrive:      ("Anda telah tiba di {destination}!", "Anda telah tiba!"),
    },
}


# A short clause appended when we have a landmark to point at.
LANDMARK_SUFFIX = {
    "english": " Look for the {landmark}.",
    "singlish": " See the {landmark} ah.",
    "chinese": " 找{landmark}。",
    "malay": " Cari {landmark}.",
}


DEFAULT_LANGUAGE = "english"


def phrase(action: Action, language: str, origin: str = "", destination: str = "", landmark: str | None = None) -> tuple[str, str]:
    table = GLOSSARY.get(language, GLOSSARY[DEFAULT_LANGUAGE])
    text_tpl, audio_tpl = table[action]
    text = text_tpl.format(origin=origin, destination=destination)
    audio = audio_tpl.format(origin=origin, destination=destination)

    if landmark:
        suffix = LANDMARK_SUFFIX.get(language, LANDMARK_SUFFIX[DEFAULT_LANGUAGE])
        clause = suffix.format(landmark=landmark)
        text += clause
        audio += clause

    return text, audio

