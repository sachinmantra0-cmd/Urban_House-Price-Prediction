import json
import random
from pathlib import Path
from typing import List, Dict, Any, Optional
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc

from backend.app.database.connection import engine, Base, SessionLocal
from backend.app.database.models import PropertyModel, FavouriteModel, ComparisonModel, PredictionHistoryModel
from backend.app.utils.logger import logger
from backend.app.utils.config import settings

# High quality curated residential architecture photography (Unsplash public license permitted)
# Paired with offline fallback local SVGs
CURATED_GALLERIES = {
    "Apartment": [
        {"category": "Exterior", "caption": "Modern High-Rise Apartment Facade", "url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/exterior/sample_1.svg"},
        {"category": "Living Room", "caption": "Sunlit Open-Plan Living Room", "url": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/living_room/sample_1.svg"},
        {"category": "Bedroom", "caption": "Spacious Master Bedroom with Wood Finish", "url": "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/bedroom/sample_1.svg"},
        {"category": "Kitchen", "caption": "Contemporary Modular Kitchen", "url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/kitchen/sample_1.svg"},
        {"category": "Bathroom", "caption": "Modern Ensuite Bathroom", "url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/bathroom/sample_1.svg"},
        {"category": "Balcony", "caption": "Scenic Balcony with Skyline View", "url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/balcony/sample_1.svg"},
        {"category": "Floor Plan", "caption": "Architectural 2D Layout Plan", "url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/floor_plan/sample_1.svg"}
    ],
    "Independent House": [
        {"category": "Exterior", "caption": "Gated Independent Villa & Private Courtyard", "url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/exterior/sample_2.svg"},
        {"category": "Living Room", "caption": "Double-Height Ceiling Family Lounge", "url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/living_room/sample_2.svg"},
        {"category": "Bedroom", "caption": "Luxury Master Suite with Balcony Access", "url": "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/bedroom/sample_2.svg"},
        {"category": "Kitchen", "caption": "Chef's Island Kitchen & Dining Nook", "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/kitchen/sample_2.svg"},
        {"category": "Bathroom", "caption": "Designer Bathroom with Glass Partition", "url": "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/bathroom/sample_2.svg"},
        {"category": "Balcony", "caption": "Verandah & Terrace Garden", "url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/balcony/sample_2.svg"},
        {"category": "Floor Plan", "caption": "Multi-Level Architectural Plan", "url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/floor_plan/sample_2.svg"}
    ],
    "Villa": [
        {"category": "Exterior", "caption": "Luxury Residential Villa Architecture", "url": "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/exterior/sample_3.svg"},
        {"category": "Living Room", "caption": "Palatial Living Hall with Marble Flooring", "url": "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/living_room/sample_3.svg"},
        {"category": "Bedroom", "caption": "Penthouse Style Bedroom with Wardrobe", "url": "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/bedroom/sample_3.svg"},
        {"category": "Kitchen", "caption": "Premium Italian Modular Kitchen", "url": "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/kitchen/sample_3.svg"},
        {"category": "Bathroom", "caption": "Spa Bathroom with Rain Shower", "url": "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/bathroom/sample_3.svg"},
        {"category": "Balcony", "caption": "Panoramic Rooftop Deck & Patio", "url": "https://images.unsplash.com/photo-1533779283484-8da4c77d73c0?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/balcony/sample_3.svg"},
        {"category": "Floor Plan", "caption": "Villa Blueprint & Site Elevation", "url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "fallback": "/api/static/property_image/floor_plan/sample_3.svg"}
    ]
}

SAMPLE_AMENITIES_POOL = [
    "24/7 Security", "Car Parking", "Power Backup", "Elevator", "Gymnasium",
    "Clubhouse", "Children's Play Area", "Rainwater Harvesting", "Swimming Pool",
    "Intercom Facility", "Vastu Compliant", "Jogging Track"
]

def init_db():
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified.")

def seed_database_if_empty(db: Session):
    """
    Populates SQLite database with genuine Kaggle properties.
    """
    init_db()
    count = db.query(PropertyModel).count()
    if count > 0:
        logger.info(f"Database already populated with {count} properties.")
        return

    csv_path = settings.PROCESSED_DATA_PATH
    if not csv_path.exists():
        logger.warning(f"Processed dataset not found at {csv_path}. Skipping database seed.")
        return

    logger.info("Seeding database from processed Kaggle dataset...")
    df = pd.read_csv(csv_path)

    properties_to_insert = []
    for idx, row in df.iterrows():
        p_type = str(row["property_type"])
        gallery = CURATED_GALLERIES.get(p_type, CURATED_GALLERIES["Apartment"])
        primary_img = gallery[0]["url"]

        # Derive realistic amenities based on BHK & property type
        random.seed(idx)
        amenity_count = min(len(SAMPLE_AMENITIES_POOL), 4 + int(row["bhk"]))
        amenities = random.sample(SAMPLE_AMENITIES_POOL, k=amenity_count)
        if row["balcony"] > 0 and "Scenic Balcony" not in amenities:
            amenities.append("Balcony / Private Sitout")

        prop = PropertyModel(
            property_id=str(row["property_id"]),
            title=str(row["title"]),
            city=str(row["city"]),
            locality=str(row["locality"]),
            property_type=p_type,
            bhk=int(row["bhk"]),
            bathrooms=int(row["bathrooms"]),
            area_sqft=float(row["area_sqft"]),
            balcony=int(row["balcony"]),
            floor_number=int(random.randint(1, 15)) if p_type == "Apartment" else 1,
            total_floors=int(random.randint(4, 25)) if p_type == "Apartment" else random.randint(1, 3),
            furnishing_status="Semi-Furnished" if idx % 3 == 0 else ("Furnished" if idx % 5 == 0 else "Unfurnished"),
            listed_price_inr=float(row["price_inr"]),
            listed_price_lakhs=float(row["price_lakhs"]),
            price_per_sqft=float(row.get("price_per_sqft", row["price_inr"] / row["area_sqft"])),
            description=str(row.get("description", "")),
            primary_image=primary_img,
            images_json=json.dumps(gallery),
            amenities_json=json.dumps(amenities),
            image_provenance="Curated Illustrative Demo Residential Photography (Permitted Demo Asset)",
            is_demo_property=True
        )
        properties_to_insert.append(prop)

        # Batch insert every 2000
        if len(properties_to_insert) >= 2000:
            db.bulk_save_objects(properties_to_insert)
            db.commit()
            properties_to_insert = []

    if properties_to_insert:
        db.bulk_save_objects(properties_to_insert)
        db.commit()

    total_inserted = db.query(PropertyModel).count()
    logger.info(f"Successfully seeded database with {total_inserted} properties!")

# Repository operations
class PropertyRepository:
    @staticmethod
    def get_properties(
        db: Session,
        city: Optional[str] = None,
        locality: Optional[str] = None,
        property_type: Optional[str] = None,
        bhk: Optional[int] = None,
        min_price_lakhs: Optional[float] = None,
        max_price_lakhs: Optional[float] = None,
        min_area: Optional[float] = None,
        max_area: Optional[float] = None,
        sort_by: str = "relevance",
        page: int = 1,
        page_size: int = 12
    ) -> Dict[str, Any]:
        query = db.query(PropertyModel)

        if city and city.lower() != "all":
            query = query.filter(func.lower(PropertyModel.city) == city.lower())
        if locality and locality.strip():
            query = query.filter(PropertyModel.locality.ilike(f"%{locality.strip()}%"))
        if property_type and property_type.lower() != "all":
            query = query.filter(func.lower(PropertyModel.property_type) == property_type.lower())
        if bhk and bhk > 0:
            query = query.filter(PropertyModel.bhk == bhk)
        if min_price_lakhs is not None:
            query = query.filter(PropertyModel.listed_price_lakhs >= min_price_lakhs)
        if max_price_lakhs is not None:
            query = query.filter(PropertyModel.listed_price_lakhs <= max_price_lakhs)
        if min_area is not None:
            query = query.filter(PropertyModel.area_sqft >= min_area)
        if max_area is not None:
            query = query.filter(PropertyModel.area_sqft <= max_area)

        # Sorting
        if sort_by == "price_asc":
            query = query.order_by(asc(PropertyModel.listed_price_lakhs))
        elif sort_by == "price_desc":
            query = query.order_by(desc(PropertyModel.listed_price_lakhs))
        elif sort_by == "area_asc":
            query = query.order_by(asc(PropertyModel.area_sqft))
        elif sort_by == "area_desc":
            query = query.order_by(desc(PropertyModel.area_sqft))
        elif sort_by == "bhk_desc":
            query = query.order_by(desc(PropertyModel.bhk))
        else:
            query = query.order_by(desc(PropertyModel.created_at), asc(PropertyModel.property_id))

        total_count = query.count()
        offset = (max(1, page) - 1) * page_size
        items = query.offset(offset).limit(page_size).all()

        return {
            "total": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": (total_count + page_size - 1) // page_size,
            "items": [PropertyRepository._serialize(p) for p in items]
        }

    @staticmethod
    def get_by_id(db: Session, property_id: str) -> Optional[Dict[str, Any]]:
        prop = db.query(PropertyModel).filter(PropertyModel.property_id == property_id).first()
        return PropertyRepository._serialize(prop) if prop else None

    @staticmethod
    def get_cities(db: Session) -> List[Dict[str, Any]]:
        results = db.query(
            PropertyModel.city,
            func.count(PropertyModel.property_id).label("count"),
            func.avg(PropertyModel.listed_price_lakhs).label("avg_price")
        ).group_by(PropertyModel.city).order_by(desc("count")).all()
        return [{"city": r[0], "count": r[1], "avg_price_lakhs": round(float(r[2]), 2)} for r in results]

    @staticmethod
    def get_localities(db: Session, city: Optional[str] = None) -> List[str]:
        query = db.query(PropertyModel.locality).distinct()
        if city and city.lower() != "all":
            query = query.filter(func.lower(PropertyModel.city) == city.lower())
        results = query.limit(100).all()
        return [r[0] for r in results if r[0]]

    @staticmethod
    def get_similar_properties(db: Session, property_id: str, limit: int = 4) -> List[Dict[str, Any]]:
        target = db.query(PropertyModel).filter(PropertyModel.property_id == property_id).first()
        if not target:
            return []

        # Find similar properties in same city with close BHK and area (+/- 30%)
        min_area = target.area_sqft * 0.7
        max_area = target.area_sqft * 1.3

        query = db.query(PropertyModel).filter(
            PropertyModel.property_id != property_id,
            PropertyModel.city == target.city,
            PropertyModel.bhk.between(max(1, target.bhk - 1), target.bhk + 1),
            PropertyModel.area_sqft.between(min_area, max_area)
        ).order_by(func.abs(PropertyModel.area_sqft - target.area_sqft)).limit(limit)

        results = query.all()
        if len(results) < limit:
            # Fallback to broader match in same city
            broader = db.query(PropertyModel).filter(
                PropertyModel.property_id != property_id,
                PropertyModel.city == target.city
            ).limit(limit).all()
            return [PropertyRepository._serialize(p) for p in broader]

        return [PropertyRepository._serialize(p) for p in results]

    @staticmethod
    def _serialize(prop: PropertyModel) -> Dict[str, Any]:
        if not prop:
            return {}
        images = []
        try:
            if prop.images_json:
                images = json.loads(prop.images_json)
        except Exception:
            images = []

        amenities = []
        try:
            if prop.amenities_json:
                amenities = json.loads(prop.amenities_json)
        except Exception:
            amenities = []

        return {
            "property_id": prop.property_id,
            "title": prop.title,
            "city": prop.city,
            "locality": prop.locality,
            "property_type": prop.property_type,
            "bhk": prop.bhk,
            "bathrooms": prop.bathrooms,
            "area_sqft": prop.area_sqft,
            "balcony": prop.balcony,
            "floor_number": prop.floor_number,
            "total_floors": prop.total_floors,
            "furnishing_status": prop.furnishing_status,
            "listed_price_inr": prop.listed_price_inr,
            "listed_price_lakhs": prop.listed_price_lakhs,
            "price_per_sqft": prop.price_per_sqft,
            "description": prop.description,
            "primary_image": prop.primary_image,
            "images": images,
            "amenities": amenities,
            "image_provenance": prop.image_provenance,
            "is_demo_property": prop.is_demo_property
        }

# Favourites & Comparison & History Repositories
class UserPreferencesRepository:
    @staticmethod
    def add_favourite(db: Session, property_id: str) -> bool:
        existing = db.query(FavouriteModel).filter(FavouriteModel.property_id == property_id).first()
        if not existing:
            fav = FavouriteModel(property_id=property_id)
            db.add(fav)
            db.commit()
            return True
        return False

    @staticmethod
    def remove_favourite(db: Session, property_id: str) -> bool:
        fav = db.query(FavouriteModel).filter(FavouriteModel.property_id == property_id).first()
        if fav:
            db.delete(fav)
            db.commit()
            return True
        return False

    @staticmethod
    def get_favourites(db: Session) -> List[Dict[str, Any]]:
        fav_ids = [f.property_id for f in db.query(FavouriteModel).all()]
        if not fav_ids:
            return []
        props = db.query(PropertyModel).filter(PropertyModel.property_id.in_(fav_ids)).all()
        return [PropertyRepository._serialize(p) for p in props]

    @staticmethod
    def add_comparison(db: Session, property_id: str) -> bool:
        existing = db.query(ComparisonModel).filter(ComparisonModel.property_id == property_id).first()
        if not existing:
            # Limit to 4 comparisons
            if db.query(ComparisonModel).count() >= 4:
                oldest = db.query(ComparisonModel).order_by(ComparisonModel.created_at.asc()).first()
                if oldest:
                    db.delete(oldest)
            comp = ComparisonModel(property_id=property_id)
            db.add(comp)
            db.commit()
            return True
        return False

    @staticmethod
    def remove_comparison(db: Session, property_id: str) -> bool:
        comp = db.query(ComparisonModel).filter(ComparisonModel.property_id == property_id).first()
        if comp:
            db.delete(comp)
            db.commit()
            return True
        return False

    @staticmethod
    def get_comparisons(db: Session) -> List[Dict[str, Any]]:
        comp_ids = [c.property_id for c in db.query(ComparisonModel).all()]
        if not comp_ids:
            return []
        props = db.query(PropertyModel).filter(PropertyModel.property_id.in_(comp_ids)).all()
        return [PropertyRepository._serialize(p) for p in props]

    @staticmethod
    def add_prediction_history(db: Session, data: Dict[str, Any]):
        hist = PredictionHistoryModel(
            property_id=data.get("property_id"),
            city=data["city"],
            locality=data.get("locality"),
            property_type=data["property_type"],
            bhk=int(data["bhk"]),
            bathrooms=int(data["bathrooms"]),
            area_sqft=float(data["area_sqft"]),
            balcony=int(data.get("balcony", 1)),
            predicted_price_lakhs=float(data["predicted_price_lakhs"]),
            predicted_price_inr=float(data["predicted_price_inr"]),
            formatted_price=str(data["formatted_price"]),
            model_name=str(data.get("model_name", "Gradient Boosting"))
        )
        db.add(hist)
        db.commit()

    @staticmethod
    def get_prediction_history(db: Session, limit: int = 20) -> List[Dict[str, Any]]:
        records = db.query(PredictionHistoryModel).order_by(desc(PredictionHistoryModel.created_at)).limit(limit).all()
        return [{
            "id": r.id,
            "property_id": r.property_id,
            "city": r.city,
            "locality": r.locality,
            "property_type": r.property_type,
            "bhk": r.bhk,
            "bathrooms": r.bathrooms,
            "area_sqft": r.area_sqft,
            "balcony": r.balcony,
            "predicted_price_lakhs": r.predicted_price_lakhs,
            "predicted_price_inr": r.predicted_price_inr,
            "formatted_price": r.formatted_price,
            "model_name": r.model_name,
            "created_at": r.created_at.isoformat() if r.created_at else None
        } for r in records]
