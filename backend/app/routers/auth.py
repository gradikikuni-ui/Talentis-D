from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import hash_password, verify_password, create_access_token
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/auth", tags=["Authentification"])


def _token_response(user: models.User) -> schemas.TokenOut:
    token = create_access_token({"sub": user.id})
    return schemas.TokenOut(
        access_token=token,
        active_role=user.active_role,
        has_worker_profile=user.worker_profile is not None,
        has_employer_profile=user.employer_profile is not None,
    )


@router.post("/register/worker", response_model=schemas.TokenOut, status_code=201)
def register_worker(payload: schemas.WorkerRegisterIn, db: Session = Depends(get_db)):
    """Inscription spécifique aux travailleurs (formulaire distinct)."""
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    user = models.User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        active_role=models.RoleEnum.worker,
    )
    db.add(user)
    db.flush()

    profile = models.WorkerProfile(
        user_id=user.id,
        full_name=payload.full_name,
        phone=payload.phone,
        title=payload.title,
        location=payload.location,
        skills=payload.skills,
        availability=payload.availability or models.AvailabilityEnum.a_definir,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    return _token_response(user)


@router.post("/register/employer", response_model=schemas.TokenOut, status_code=201)
def register_employer(payload: schemas.EmployerRegisterIn, db: Session = Depends(get_db)):
    """Inscription spécifique aux entreprises / recruteurs (formulaire distinct)."""
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    user = models.User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        active_role=models.RoleEnum.employer,
    )
    db.add(user)
    db.flush()

    profile = models.EmployerProfile(
        user_id=user.id,
        company_name=payload.company_name,
        contact_name=payload.contact_name,
        phone=payload.phone,
        sector=payload.sector,
        company_size=payload.company_size,
        website=payload.website,
        description=payload.description,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    return _token_response(user)


@router.post("/login", response_model=schemas.TokenOut)
def login(payload: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    return _token_response(user)


@router.post("/switch-role", response_model=schemas.TokenOut)
def switch_role(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """
    Bascule en un clic entre le mode Travailleur et le mode Employeur.
    Si le profil correspondant n'existe pas encore, une erreur 409 est
    renvoyée pour inviter le front à proposer la création rapide de ce profil.
    """
    target_role = (
        models.RoleEnum.employer
        if user.active_role == models.RoleEnum.worker
        else models.RoleEnum.worker
    )
    has_target_profile = (
        user.employer_profile is not None
        if target_role == models.RoleEnum.employer
        else user.worker_profile is not None
    )
    if not has_target_profile:
        raise HTTPException(
            status_code=409,
            detail=f"Aucun profil {target_role.value} associé à ce compte. Créez-le pour basculer.",
        )
    user.active_role = target_role
    db.commit()
    db.refresh(user)
    return _token_response(user)


@router.post("/add-worker-profile", response_model=schemas.TokenOut, status_code=201)
def add_worker_profile(payload: schemas.WorkerProfileUpdateIn, db: Session = Depends(get_db),
                        user: models.User = Depends(get_current_user)):
    """Ajoute un profil Travailleur à un compte déjà Employeur (et bascule dessus)."""
    if user.worker_profile:
        raise HTTPException(status_code=400, detail="Un profil travailleur existe déjà")
    if not payload.full_name:
        raise HTTPException(status_code=422, detail="Le nom complet est requis")
    profile = models.WorkerProfile(
        user_id=user.id,
        full_name=payload.full_name,
        phone=payload.phone,
        title=payload.title,
        bio=payload.bio,
        skills=payload.skills,
        location=payload.location,
        availability=payload.availability or models.AvailabilityEnum.a_definir,
    )
    db.add(profile)
    user.active_role = models.RoleEnum.worker
    db.commit()
    db.refresh(user)
    return _token_response(user)


@router.post("/add-employer-profile", response_model=schemas.TokenOut, status_code=201)
def add_employer_profile(payload: schemas.EmployerProfileUpdateIn, db: Session = Depends(get_db),
                          user: models.User = Depends(get_current_user)):
    """Ajoute un profil Employeur à un compte déjà Travailleur (et bascule dessus)."""
    if user.employer_profile:
        raise HTTPException(status_code=400, detail="Un profil employeur existe déjà")
    if not payload.company_name:
        raise HTTPException(status_code=422, detail="Le nom de l'entreprise est requis")
    profile = models.EmployerProfile(
        user_id=user.id,
        company_name=payload.company_name,
        contact_name=payload.contact_name,
        phone=payload.phone,
        sector=payload.sector,
        company_size=payload.company_size,
        website=payload.website,
        description=payload.description,
    )
    db.add(profile)
    user.active_role = models.RoleEnum.employer
    db.commit()
    db.refresh(user)
    return _token_response(user)