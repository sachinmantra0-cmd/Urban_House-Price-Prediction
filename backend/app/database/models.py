from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime
from backend.app.database.connection import Base

class PropertyModel(Base):
    __tablename__ = "properties"

    property_id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    city = Column(String(100), index=True, nullable=False)
    locality = Column(String(200), index=True, nullable=False)
    property_type = Column(String(50), index=True, nullable=False)
    bhk = Column(Integer, index=True, nullable=False)
    bathrooms = Column(Integer, nullable=False)
    area_sqft = Column(Float, index=True, nullable=False)
    balcony = Column(Integer, default=0)
    floor_number = Column(Integer, nullable=True)
    total_floors = Column(Integer, nullable=True)
    furnishing_status = Column(String(50), default="Unfurnished")
    listed_price_inr = Column(Float, nullable=False)
    listed_price_lakhs = Column(Float, nullable=False)
    price_per_sqft = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    primary_image = Column(String(500), nullable=True)
    images_json = Column(Text, nullable=True)  # JSON array of image objects
    amenities_json = Column(Text, nullable=True)  # JSON array of amenities strings
    image_provenance = Column(String(255), default="Illustrative Demo Property Image (Permitted Sample)")
    is_demo_property = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class FavouriteModel(Base):
    __tablename__ = "favourites"

    id = Column(Integer, primary_key=True, autoincrement=True)
    property_id = Column(String(50), index=True, nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ComparisonModel(Base):
    __tablename__ = "comparisons"

    id = Column(Integer, primary_key=True, autoincrement=True)
    property_id = Column(String(50), index=True, nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class PredictionHistoryModel(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    property_id = Column(String(50), nullable=True)
    city = Column(String(100), nullable=False)
    locality = Column(String(200), nullable=True)
    property_type = Column(String(50), nullable=False)
    bhk = Column(Integer, nullable=False)
    bathrooms = Column(Integer, nullable=False)
    area_sqft = Column(Float, nullable=False)
    balcony = Column(Integer, default=0)
    predicted_price_lakhs = Column(Float, nullable=False)
    predicted_price_inr = Column(Float, nullable=False)
    formatted_price = Column(String(50), nullable=False)
    model_name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
