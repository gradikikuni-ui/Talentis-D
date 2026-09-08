from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Identifiants invalides ou expirés",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


def require_worker(user: models.User = Depends(get_current_user)) -> models.User:
    if not user.worker_profile:
        raise HTTPException(status_code=403, detail="Profil travailleur requis")
    return user


def require_employer(user: models.User = Depends(get_current_user)) -> models.User:
    if not user.employer_profile:
        raise HTTPException(status_code=403, detail="Profil employeur requis")
    return user


def require_validated_employer(user: models.User = Depends(get_current_user)) -> models.User:
    """Comme require_employer, mais bloque tant que l'admin n'a pas validé le compte."""
    if not user.employer_profile:
        raise HTTPException(status_code=403, detail="Profil employeur requis")
    if not user.employer_profile.is_validated:
        raise HTTPException(
            status_code=403,
            detail="Votre compte employeur est en attente de validation par un administrateur.",
        )
    return user


def require_admin(user: models.User = Depends(get_current_user)) -> models.User:
    if user.active_role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    return user