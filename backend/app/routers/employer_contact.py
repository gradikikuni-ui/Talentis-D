from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.email import send_email
from app.core.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(tags=["Contact employeur (public)"])


@router.post(
    "/employer-requests",
    response_model=schemas.EmployerRequestOut,
    status_code=201
)
def submit_employer_request(
    payload: schemas.EmployerRequestIn,
    db: Session = Depends(get_db)
):
    """
    Formulaire public (aucune connexion requise) permettant à un employeur
    de soumettre une demande de publication d'offre. Un administrateur la
    traite ensuite manuellement depuis /admin/employer-requests.
    """

    request = models.EmployerRequest(**payload.model_dump())

    db.add(request)
    db.commit()
    db.refresh(request)

    # Envoi de la notification par email
    send_email(
        subject="Nouvelle demande employeur — Talentis D",
        body=(
            "Une nouvelle demande de publication d'offre a été soumise.\n\n"
            f"Entreprise : {request.company_name}\n"
            f"Nom du contact : {request.contact_name or 'Non renseigné'}\n"
            f"Email : {request.email}\n"
            f"Téléphone : {request.phone or 'Non renseigné'}\n"
            f"Secteur : {request.sector or 'Non renseigné'}\n"
            f"Site web : {request.website or 'Non renseigné'}\n\n"
            f"Message :\n{request.message}\n"
        )
    )

    return request