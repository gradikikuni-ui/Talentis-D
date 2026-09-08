from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_worker, require_employer
from app.models import models
from app.schemas import schemas

router = APIRouter(tags=["Profils"])


@router.get("/users/me", response_model=schemas.MeOut)
def get_me(user: models.User = Depends(get_current_user)):
    return schemas.MeOut(
        id=user.id,
        email=user.email,
        active_role=user.active_role,
        worker_profile=user.worker_profile,
        employer_profile=user.employer_profile,
    )


@router.put("/users/me/worker-profile", response_model=schemas.WorkerProfileOut)
def update_worker_profile(
    payload: schemas.WorkerProfileUpdateIn,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_worker),
):
    profile = user.worker_profile
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.put("/users/me/employer-profile", response_model=schemas.EmployerProfileOut)
def update_employer_profile(
    payload: schemas.EmployerProfileUpdateIn,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_employer),
):
    profile = user.employer_profile
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/workers/{worker_id}", response_model=schemas.WorkerProfileOut)
def get_worker_public(worker_id: str, db: Session = Depends(get_db)):
    profile = db.query(models.WorkerProfile).filter(models.WorkerProfile.id == worker_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil introuvable")
    return profile


@router.get("/employers/{employer_id}", response_model=schemas.EmployerProfileOut)
def get_employer_public(employer_id: str, db: Session = Depends(get_db)):
    profile = db.query(models.EmployerProfile).filter(models.EmployerProfile.id == employer_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profil introuvable")
    return profile