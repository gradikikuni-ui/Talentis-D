from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_employer, get_current_user
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/jobs", tags=["Offres d'emploi"])


@router.get("", response_model=list[schemas.JobOfferOut])
def list_jobs(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None, description="Recherche plein texte (titre, description, compétences)"),
    location: Optional[str] = None,
    contract_type: Optional[models.ContractTypeEnum] = None,
    remote: Optional[bool] = None,
    limit: int = 50,
    offset: int = 0,
):
    query = db.query(models.JobOffer).filter(models.JobOffer.status == models.JobStatusEnum.active)

    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                models.JobOffer.title.ilike(like),
                models.JobOffer.description.ilike(like),
                models.JobOffer.skills_required.ilike(like),
            )
        )
    if location:
        query = query.filter(models.JobOffer.location.ilike(f"%{location}%"))
    if contract_type:
        query = query.filter(models.JobOffer.contract_type == contract_type)
    if remote is not None:
        query = query.filter(models.JobOffer.remote == remote)

    query = query.order_by(models.JobOffer.created_at.desc())
    return query.offset(offset).limit(limit).all()


@router.get("/mine", response_model=list[schemas.JobOfferOut])
def list_my_jobs(db: Session = Depends(get_db), user: models.User = Depends(require_employer)):
    return (
        db.query(models.JobOffer)
        .filter(models.JobOffer.employer_id == user.employer_profile.id)
        .order_by(models.JobOffer.created_at.desc())
        .all()
    )


@router.get("/{job_id}", response_model=schemas.JobOfferOut)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(models.JobOffer).filter(models.JobOffer.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Offre introuvable")
    return job


@router.post("", response_model=schemas.JobOfferOut, status_code=201)
def create_job(
    payload: schemas.JobOfferCreateIn,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_employer),
):
    job = models.JobOffer(employer_id=user.employer_profile.id, **payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.put("/{job_id}", response_model=schemas.JobOfferOut)
def update_job(
    job_id: str,
    payload: schemas.JobOfferUpdateIn,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_employer),
):
    job = db.query(models.JobOffer).filter(models.JobOffer.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Offre introuvable")
    if job.employer_id != user.employer_profile.id:
        raise HTTPException(status_code=403, detail="Cette offre ne vous appartient pas")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(job, field, value)
    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}", status_code=204)
def delete_job(
    job_id: str,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_employer),
):
    job = db.query(models.JobOffer).filter(models.JobOffer.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Offre introuvable")
    if job.employer_id != user.employer_profile.id:
        raise HTTPException(status_code=403, detail="Cette offre ne vous appartient pas")
    db.delete(job)
    db.commit()
    return None