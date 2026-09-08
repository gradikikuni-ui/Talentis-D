from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import require_admin
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/admin", tags=["Administration"])


def _to_admin_employer_out(employer: models.EmployerProfile) -> schemas.AdminEmployerOut:
    return schemas.AdminEmployerOut(
        id=employer.id,
        company_name=employer.company_name,
        contact_name=employer.contact_name,
        sector=employer.sector,
        website=employer.website,
        is_validated=employer.is_validated,
        created_at=employer.created_at,
        email=employer.user.email,
        is_active=employer.user.is_active,
    )


@router.get("/employers", response_model=list[schemas.AdminEmployerOut])
def list_employers(
    status: str = "pending",  # "pending" | "validated" | "all"
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """Liste des comptes employeurs, filtrable par statut de validation."""
    query = db.query(models.EmployerProfile).options(joinedload(models.EmployerProfile.user))
    if status == "pending":
        query = query.filter(models.EmployerProfile.is_validated.is_(False))
    elif status == "validated":
        query = query.filter(models.EmployerProfile.is_validated.is_(True))
    # "all" -> pas de filtre supplémentaire

    employers = query.order_by(models.EmployerProfile.created_at.desc()).all()
    return [_to_admin_employer_out(e) for e in employers]


@router.post("/employers/{employer_id}/validate", response_model=schemas.AdminEmployerOut)
def validate_employer(
    employer_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """
    Valide manuellement un compte employeur : il peut ensuite publier des
    offres. (À terme, cette étape sera automatisée — voir TODO dans le README.)
    """
    employer = (
        db.query(models.EmployerProfile)
        .options(joinedload(models.EmployerProfile.user))
        .filter(models.EmployerProfile.id == employer_id)
        .first()
    )
    if not employer:
        raise HTTPException(status_code=404, detail="Employeur introuvable")

    employer.is_validated = True
    employer.validated_at = datetime.utcnow()
    db.commit()
    db.refresh(employer)
    return _to_admin_employer_out(employer)


@router.post("/employers/{employer_id}/reject", response_model=schemas.AdminEmployerOut)
def reject_employer(
    employer_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """
    Rejette un compte employeur : désactive le compte (is_active=False) sans
    le supprimer, pour garder une trace. Un rejet peut être annulé en
    réactivant le compte manuellement en base si besoin.
    """
    employer = (
        db.query(models.EmployerProfile)
        .options(joinedload(models.EmployerProfile.user))
        .filter(models.EmployerProfile.id == employer_id)
        .first()
    )
    if not employer:
        raise HTTPException(status_code=404, detail="Employeur introuvable")

    employer.is_validated = False
    employer.user.is_active = False
    db.commit()
    db.refresh(employer)
    return _to_admin_employer_out(employer)


# ---------- DEMANDES DE CONTACT EMPLOYEUR ----------

@router.get("/employer-requests", response_model=list[schemas.EmployerRequestOut])
def list_employer_requests(
    status: str = "nouveau",  # "nouveau" | "traite" | "all"
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """Liste des demandes de contact soumises via le formulaire public."""
    query = db.query(models.EmployerRequest)
    if status != "all":
        query = query.filter(models.EmployerRequest.status == status)
    return query.order_by(models.EmployerRequest.created_at.desc()).all()


@router.put("/employer-requests/{request_id}/status", response_model=schemas.EmployerRequestOut)
def update_employer_request_status(
    request_id: str,
    payload: schemas.EmployerRequestStatusUpdateIn,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """Permet de marquer une demande comme traitée manuellement (ou de la rouvrir)."""
    request = db.query(models.EmployerRequest).filter(models.EmployerRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Demande introuvable")
    request.status = payload.status
    db.commit()
    db.refresh(request)
    return request


# ---------- GESTION DES OFFRES PAR UN ADMINISTRATEUR ----------

@router.get("/jobs", response_model=list[schemas.JobOfferOut])
def admin_list_jobs(db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    """Liste de toutes les offres, peu importe qui les a publiées."""
    return db.query(models.JobOffer).order_by(models.JobOffer.created_at.desc()).all()


@router.post("/jobs", response_model=schemas.JobOfferOut, status_code=201)
def admin_create_job(
    payload: schemas.AdminJobCreateIn,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    """
    Flux principal de publication : un administrateur crée l'offre à partir
    des informations fournies par l'employeur (généralement via une demande
    de contact). Si `employer_request_id` est fourni, la demande associée
    est automatiquement marquée comme traitée.
    """
    data = payload.model_dump()
    questions_data = data.pop("questions", None) or []
    employer_request_id = data.get("employer_request_id")

    if employer_request_id:
        request = (
            db.query(models.EmployerRequest)
            .filter(models.EmployerRequest.id == employer_request_id)
            .first()
        )
        if not request:
            raise HTTPException(status_code=404, detail="Demande de contact introuvable")

    job = models.JobOffer(posted_by_admin_id=admin.id, **data)
    db.add(job)
    db.flush()

    for index, q in enumerate(questions_data):
        db.add(models.JobQuestion(job_id=job.id, order_index=index, **q))

    if employer_request_id:
        db.query(models.EmployerRequest).filter(
            models.EmployerRequest.id == employer_request_id
        ).update({"status": models.EmployerRequestStatusEnum.traite})

    db.commit()
    db.refresh(job)
    return job


@router.put("/jobs/{job_id}", response_model=schemas.JobOfferOut)
def admin_update_job(
    job_id: str,
    payload: schemas.AdminJobUpdateIn,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    job = db.query(models.JobOffer).filter(models.JobOffer.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Offre introuvable")

    data = payload.model_dump(exclude_unset=True)
    questions_data = data.pop("questions", None)

    for field, value in data.items():
        setattr(job, field, value)

    if questions_data is not None:
        job.questions.clear()
        db.flush()
        for index, q in enumerate(questions_data):
            db.add(models.JobQuestion(job_id=job.id, order_index=index, **q))

    db.commit()
    db.refresh(job)
    return job


@router.delete("/jobs/{job_id}", status_code=204)
def admin_delete_job(
    job_id: str,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    job = db.query(models.JobOffer).filter(models.JobOffer.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Offre introuvable")
    db.delete(job)
    db.commit()
    return None