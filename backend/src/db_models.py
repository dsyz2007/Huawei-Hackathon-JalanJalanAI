from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey, func
from .database import Base


class Route(Base):
    __tablename__ = "routes"
    route_id = Column(String, primary_key=True)
    origin = Column(String, nullable=True)
    destination = Column(String, nullable=True)
    language = Column(String, nullable=True)
    distance = Column(String)
    duration = Column(String)
    created_at = Column(DateTime, server_default=func.now())


class DBCheckpoint(Base):
    __tablename__ = "checkpoints"
    id = Column(String, primary_key=True)
    route_id = Column(String, ForeignKey("routes.route_id"))
    step_number = Column(Integer)
    action = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    distance = Column(Float, nullable=True)
    bearing = Column(Float, nullable=True)


class DBLandmark(Base):
    __tablename__ = "landmarks"
    id = Column(Integer, primary_key=True, autoincrement=True)
    checkpoint_id = Column(String, ForeignKey("checkpoints.id"))
    name = Column(String)
    description = Column(String)
    image_url = Column(String, nullable=True)
    salience_score = Column(Float, nullable=True)


class AICache(Base):
    __tablename__ = "ai_cache"
    id = Column(Integer, primary_key=True, autoincrement=True)
    cache_key = Column(String, unique=True, nullable=False)
    response_text = Column(Text, nullable=False)
    language = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class DemoRoute(Base):
    __tablename__ = "demo_routes"
    id = Column(String, primary_key=True)   # "A", "B", "C"
    route_id = Column(String, ForeignKey("routes.route_id"))
