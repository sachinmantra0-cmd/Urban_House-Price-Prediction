import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseModel):
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")
    CORS_ORIGINS: list[str] = [
        origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000").split(",")
    ]
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/data/house_estimate.db")
    
    # Paths
    BASE_DIR: Path = BASE_DIR
    RAW_DATA_PATH: Path = BASE_DIR / "data" / "raw" / "Real Estate Data V21.csv"
    PROCESSED_DATA_PATH: Path = BASE_DIR / "data" / "processed" / "cleaned_houses.csv"
    MODEL_DIR: Path = BASE_DIR / "models"
    ARTIFACTS_DIR: Path = BASE_DIR / "artifacts"
    PLOTS_DIR: Path = BASE_DIR / "artifacts" / "plots"
    METRICS_DIR: Path = BASE_DIR / "artifacts" / "metrics"
    STATIC_IMAGES_DIR: Path = BASE_DIR.parent / "property_image"

settings = Settings()
