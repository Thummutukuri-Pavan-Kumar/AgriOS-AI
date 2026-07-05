from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.api.v1 import auth, copilot, farm, crops, disease, irrigation, yield_forecast, profit, market, schemes, alerts, translate
from app.models import user, farm as farm_model

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AgriOS AI",
    description="Autonomous Farm Intelligence Platform",
    version="1.0.0"
)

# CORS - Allow all origins for now (fix for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://agri-os-ai-snowy.vercel.app",  # Your Vercel URL
        "https://agrios-ai.vercel.app",        # Alternative Vercel URL
        "http://localhost:5173",               # Local development
        "http://localhost:5174",               # Local development alternative
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(copilot.router, prefix="/api/v1")
app.include_router(farm.router, prefix="/api/v1")
app.include_router(crops.router, prefix="/api/v1")
app.include_router(disease.router, prefix="/api/v1")
app.include_router(irrigation.router, prefix="/api/v1")
app.include_router(yield_forecast.router, prefix="/api/v1")
app.include_router(profit.router, prefix="/api/v1")
app.include_router(market.router, prefix="/api/v1")
app.include_router(schemes.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")
app.include_router(translate.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "AgriOS AI Backend is running 🌾"}

@app.get("/health")
def health():
    return {"status": "healthy"}