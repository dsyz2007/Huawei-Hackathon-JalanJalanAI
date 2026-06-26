from .database import engine, SessionLocal, Base
from . import db_models
from .demo_data import _DEMO_ROUTES


def create_tables():
    Base.metadata.create_all(bind=engine)


def seed_demo_routes():
    db = SessionLocal()
    try:
        for demo_id, data in _DEMO_ROUTES.items():
            if db.get(db_models.DemoRoute, demo_id):
                continue

            db.merge(db_models.Route(
                route_id=data["route_id"],
                distance=data["distance"],
                duration=data["duration"],
            ))

            for i, row in enumerate(data["steps"], start=1):
                cp_id, action, lat, lng, distance, lm_name, lm_desc, text, audio = row

                db.merge(db_models.DBCheckpoint(
                    id=cp_id,
                    route_id=data["route_id"],
                    step_number=i,
                    action=action.value,
                    lat=lat,
                    lng=lng,
                    distance=distance,
                ))

                exists = db.query(db_models.DBLandmark).filter_by(checkpoint_id=cp_id).first()
                if not exists:
                    db.add(db_models.DBLandmark(
                        checkpoint_id=cp_id,
                        name=lm_name,
                        description=lm_desc,
                    ))

            db.merge(db_models.DemoRoute(id=demo_id, route_id=data["route_id"]))

        db.commit()
    finally:
        db.close()


def init():
    create_tables()
    seed_demo_routes()
