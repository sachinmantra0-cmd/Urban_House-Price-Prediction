import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.utils.config import settings
from backend.app.utils.logger import logger
from backend.app.database.connection import SessionLocal
from backend.app.database.repository import seed_database_if_empty
from backend.app.ml.predict import prediction_engine
from backend.app.ml.explain import shap_service

# Routers
from backend.app.api.routes import health, properties, prediction, favourites, comparisons, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing HouseEstiMate backend...")
    # Seed database if needed
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()
    
    # Preload ML model and SHAP service
    if not prediction_engine.is_loaded:
        prediction_engine._load()
    if not shap_service.is_initialized:
        shap_service._load()
    logger.info("HouseEstiMate backend startup complete.")
    yield
    logger.info("Shutting down HouseEstiMate backend.")

app = FastAPI(
    title="HouseEstiMate API",
    description="Full-Stack Indian House Price Prediction & Real Estate Discovery Platform with Explainable AI (SHAP)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please verify model and database setup."}
    )

# Static file mounts for local fallback SVGs and EDA plots
static_img_dir = settings.STATIC_IMAGES_DIR
if static_img_dir.exists():
    app.mount("/api/static/property_image", StaticFiles(directory=str(static_img_dir)), name="property_images")

plots_dir = settings.PLOTS_DIR
if plots_dir.exists():
    app.mount("/api/static/plots", StaticFiles(directory=str(plots_dir)), name="plots")

# Include Routers
app.include_router(health.router)
app.include_router(properties.router)
app.include_router(prediction.router)
app.include_router(favourites.router)
app.include_router(comparisons.router)
app.include_router(analytics.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
