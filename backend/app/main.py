import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import Base, engine
from app.core.uploads import UPLOAD_DIR
from app.models import models  # noqa: F401 (assure la création des tables)
from app.routers import auth, profiles, jobs, applications, uploads, admin, employer_contact

Base.metadata.create_all(bind=engine)
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    description="API de la plateforme Talentis D — mettre en relation "
    "travailleurs et employeurs pour tout type de contrat, "
    "de la mission très courte au CDI.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sert les CV / lettres de motivation uploadés sous /uploads/<fichier>
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(uploads.router)
app.include_router(admin.router)
app.include_router(employer_contact.router)


@app.get("/", tags=["Santé"])
def root():
    return {"status": "ok", "app": settings.APP_NAME}