from backend.src.models import (
    RouteResponse,
    RouteStep,
    Checkpoint,
    Landmark,
    Instruction,
    Action
)


# Each demo route = metadata + a list of step rows.
# A step row is a tuple:
# (checkpoint_id, action, lat, lng, distance, landmark_name, landmark_desc, text, audio_text)
_DEMO_ROUTES = {
    "A": {
        "route_id": "demo-A",
        "distance": "650m",
        "duration": "8 mins",
        "steps": [
            ("A1", Action.exit_mrt,   1.3236, 103.9300,   0, "Bedok MRT Exit B", "Blue MRT sign above the exit",
             "Exit through Exit B. Look for the blue MRT sign above you.", "Exit through Exit B."),
            ("A2", Action.turn_left,  1.3240, 103.9305,  80, "POSB ATM", "Yellow ATM machine on the corner",
             "Walk to the yellow POSB ATM and turn left.", "Walk to the yellow ATM. Turn left."),
            ("A3", Action.cross_road, 1.3245, 103.9310, 200, "Red Bus Stop", "Red roof bus stop with a shelter",
             "Cross at the traffic light. The bus stop is on the other side.", "Cross at the traffic light."),
            ("A4", Action.arrive,     1.3250, 103.9315, 400, "Bedok Interchange", "Large covered bus interchange",
             "You have arrived at Bedok Interchange!", "You have arrived at Bedok Interchange!")
        ]
    },
    "B": {
        "route_id": "demo-B",
        "distance": "400m",
        "duration": "5 mins",
        "steps": [
            ("B1", Action.exit_mrt,    1.3527, 103.9451,   0, "Tampines MRT Exit A", "Green MRT sign above the exit",
             "Exit through Exit A. Look for the green MRT sign above you.", "Exit through Exit A."),
            ("B2", Action.go_straight, 1.3530, 103.9455, 100, "Tampines Post Office", "Red post box outside a building",
             "Walk straight. You will pass a red post box on your right.", "Walk straight past the red post box."),
            ("B3", Action.arrive,      1.3533, 103.9458, 250, "Tampines Mall", "Big glass doors with a mall sign",
             "You have arrived at Tampines Mall. Enter through the big glass doors.", "You have arrived at Tampines Mall!")
        ]
    },
    "C": {
        "route_id": "demo-C",
        "distance": "300m",
        "duration": "4 mins",
        "steps": [
            ("C1", Action.exit_mrt,   1.3699, 103.8492,   0, "Ang Mo Kio MRT Exit C", "Orange MRT sign above the exit",
             "Exit through Exit C. Look for the orange sign above you.", "Exit through Exit C."),
            ("C2", Action.turn_right, 1.3702, 103.8495,  80, "Kopitiam Coffee Shop", "Open-air coffee shop, yellow signboard",
             "Walk past the Kopitiam coffee shop and turn right.", "Pass the coffee shop and turn right."),
            ("C3", Action.arrive,     1.3705, 103.8498, 200, "AMK Hub", "Large shopping mall entrance",
             "You have arrived at AMK Hub!", "You have arrived at AMK Hub!")
        ]
    }    
}


def get_demo_route(demo_id: str, language: str) -> RouteResponse:
    data = _DEMO_ROUTES[demo_id]
    steps = []
    for i, row in enumerate(data["steps"], start=1):
        cp_id, action, lat, lng, distance, lm_name, lm_desc, text, audio = row
        steps.append(
            RouteStep(
                step = i,
                checkpoint = Checkpoint(id=cp_id, action=action, lat=lat, lng=lng, distance=distance),
                landmark = Landmark(name=lm_name, description=lm_desc),
                instruction = Instruction(text=text, audio_text=audio, language=language)
            )
        )
    return RouteResponse(
        route_id = data["route_id"],
        distance = data["distance"],
        duration = data["duration"],
        steps = steps
    )

