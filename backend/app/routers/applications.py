from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_worker, require_employer
from app.models import models
from app.schemas import schemas

router = APIRouter(tags=["Candidatures"])


@router.post("/jobs/{job_id}/apply", response_model=schemas.ApplicationOut, status_code=201)
def apply_to_job(
    job_id: str,
    payload: schemas.ApplicationCreateIn,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_worker),
):
    job = db.query(models.JobOffer).filter(models.JobOffer.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Offre introuvable")
    if job.status != models.JobStatusEnum.active:
        raise HTTPException(status_code=400, detail="Cette offre n'accepte plus de candidatures")

    existing = (
        db.query(models.Application)
        .filter(
            models.Application.job_id == job_id,
            models.Application.worker_id == user.worker_profile.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà postulé à cette offre")

    # Vérifie que toutes les questions obligatoires de l'offre ont une réponse.
    answered_ids = {a.question_id for a in payload.answers}
    for question in job.questions:
        if question.is_required and question.id not in answered_ids:
            raise HTTPException(
                status_code=422,
                detail=f"Merci de répondre à la question obligatoire : « {question.question_text} »",
            )

    application = models.Application(
        job_id=job_id,
        worker_id=user.worker_profile.id,
        cover_letter=payload.cover_letter,
        cv_url=payload.cv_url,
        cover_letter_file_url=payload.cover_letter_file_url,
    )
    db.add(application)
    db.flush()

    valid_question_ids = {q.id for q in job.questions}
    for answer in payload.answers:
        if answer.question_id not in valid_question_ids:
            continue  # ignore une réponse à une question qui n'appartient pas à cette offre
        db.add(
            models.ApplicationAnswer(
                application_id=application.id,
                question_id=answer.question_id,
                answer_text=answer.answer_text,
            )
        )

    db.commit()
    db.refresh(application)
    return application


@router.get("/applications/mine", response_model=list[schemas.ApplicationOut])
def my_applications(db: Session = Depends(get_db), user: models.User = Depends(require_worker)):
    return (
        db.query(models.Application)
        .filter(models.Application.worker_id == user.worker_profile.id)
        .order_by(models.Application.created_at.desc())
        .all()
    )


@router.get("/jobs/{job_id}/applications", response_model=list[schemas.ApplicationOut])
def job_applications(
    job_id: str, db: Session = Depends(get_db), user: models.User = Depends(require_employer)
):
    job = db.query(models.JobOffer).filter(models.JobOffer.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Offre introuvable")
    if job.employer_id != user.employer_profile.id:
        raise HTTPException(status_code=403, detail="Cette offre ne vous appartient pas")
    return (
        db.query(models.Application)
        .filter(models.Application.job_id == job_id)
        .order_by(models.Application.created_at.desc())
        .all()
    )


@router.put("/applications/{application_id}/status", response_model=schemas.ApplicationOut)
def update_application_status(
    application_id: str,
    payload: schemas.ApplicationStatusUpdateIn,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_employer),
):
    application = (
        db.query(models.Application).filter(models.Application.id == application_id).first()
    )
    if not application:
        raise HTTPException(status_code=404, detail="Candidature introuvable")
    if application.job.employer_id != user.employer_profile.id:
        raise HTTPException(status_code=403, detail="Cette candidature ne vous concerne pas")
    application.status = payload.status
    db.commit()
    db.refresh(application)
    return application