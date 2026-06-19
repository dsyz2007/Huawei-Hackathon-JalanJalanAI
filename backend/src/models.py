from enum import Enum
from typing import Literal
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    #Base model: Python fields are snake case, JSON is camel case
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class Action(str, Enum):
    turn_left = "turn_left"
    turn_right = "turn_right"
    go_straight = "go_straight"
    cross_road = "cross_road"
    exit_mrt = "exit_mrt"
    arrive = "arrive"


Language = Literal["english", "singlish", "cantonese", "teochew", "hokkien", "chinese", "malay", "tamil", "hindi"]
#9 Languages: English, Singlish, Cantonese, Teochew, Hokkien, Chinese, Malay, Tamil, Hindi


class Checkpoint(CamelModel):
    id: str
    action: Action
    lat: float
    lng: float
    distance: float | None = None
    bearing: float | None = None


class Landmark(CamelModel):
    name: str
    description: str
    image_url: str | None = None
    salience_score: float | None = None


class Instruction(CamelModel):
    text: str
    audio_text: str
    language: Language


class RouteStep(CamelModel):
    step: int
    checkpoint: Checkpoint
    landmark: Landmark | None = None
    instruction: Instruction | None = None


class RouteResponse(CamelModel):
    route_id: str
    distance: str
    duration: str
    steps: list[RouteStep]


class RouteRequest(CamelModel):
    origin: str
    destination: str
    language: Language
    prefer_shelter: bool


class CheckpointsRequest(CamelModel):
    route_id: str


class StoryRequest(CamelModel):
    route_id: str
    language: str


class DemoRouteRequest(CamelModel):
    id: Literal["A", "B", "C"]
    language: Language


