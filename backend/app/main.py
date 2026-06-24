# # from fastapi import FastAPI
# # from fastapi.middleware.cors import CORSMiddleware
# # from app.core.database import Base, engine
# # from app.api.v1 import auth 
# # from app.api.v1 import copilot , farm 
# # from app.models import user, farm  # ensures models are registered

# # # Create all tables
# # Base.metadata.create_all(bind=engine)

# # app = FastAPI(
# #     title="AgriOS AI",
# #     description="Autonomous Farm Intelligence Platform",
# #     version="1.0.0"
# # )

# # # CORS
# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["http://localhost:5173"],
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # # Routers
# # app.include_router(auth.router, prefix="/api/v1")
# # app.include_router(copilot.router, prefix="/api/v1")
# # app.include_router(farm.router, prefix="/api/v1")

# # @app.get("/")
# # def root():
# #     return {"message": "AgriOS AI Backend is running 🌾"}

# # @app.get("/health")
# # def health():
# #     return {"status": "healthy"}

# # from fastapi import FastAPI
# # from fastapi.middleware.cors import CORSMiddleware
# # from app.core.database import Base, engine
# # from app.api.v1 import auth, copilot, farm  # ← farm is from api.v1, not models
# # from app.models import user, farm as farm_model  # ← rename to avoid conflict

# # # Create all tables
# # Base.metadata.create_all(bind=engine)

# # app = FastAPI(
# #     title="AgriOS AI",
# #     description="Autonomous Farm Intelligence Platform",
# #     version="1.0.0"
# # )

# # # CORS
# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["http://localhost:5173"],
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # # Routers
# # app.include_router(auth.router, prefix="/api/v1")
# # app.include_router(copilot.router, prefix="/api/v1")
# # app.include_router(farm.router, prefix="/api/v1")  # ← This is the router from api.v1.farm

# # @app.get("/")
# # def root():
# #     return {"message": "AgriOS AI Backend is running 🌾"}

# # @app.get("/health")
# # def health():
# #     return {"status": "healthy"}

# from backend.app.api.v1 import yield
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from app.core.database import Base, engine
# from app.api.v1 import auth, copilot, farm , crops , disease , irrigation
# from app.api.v1 import yield as yield_api
# from app.models import user, farm as farm_model

# # Create all tables
# Base.metadata.create_all(bind=engine)

# app = FastAPI(
#     title="AgriOS AI",
#     description="Autonomous Farm Intelligence Platform",
#     version="1.0.0"
# )

# # CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Routers
# app.include_router(auth.router, prefix="/api/v1")
# app.include_router(copilot.router, prefix="/api/v1")
# app.include_router(farm.router, prefix="/api/v1")
# app.include_router(crops.router, prefix="/api/v1")
# app.include_router(disease.router, prefix="/api/v1")
# app.include_router(irrigation.router, prefix="/api/v1")
# app.include_router(yield_api.router, prefix="/api/v1")

# @app.get("/")
# def root():
#     return {"message": "AgriOS AI Backend is running 🌾"}

# @app.get("/health")
# def health():
#     return {"status": "healthy"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.api.v1 import auth, copilot, farm, crops, disease, irrigation , profit , market , schemes,alerts , translate
from app.api.v1 import yield_forecast
from app.models import user, farm as farm_model

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AgriOS AI",
    description="Autonomous Farm Intelligence Platform",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
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