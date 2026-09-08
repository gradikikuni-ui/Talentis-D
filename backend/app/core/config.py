"""
Configuration centrale de l'application Talentis D.
Toutes les variables sensibles peuvent être surchargées via des variables
d'environnement (voir .env.example à la racine du dossier backend).
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Talentis D API"
    ENV: str = "development"

    # Base de données (SQLite par défaut pour un démarrage immédiat,
    # remplacer par une URL PostgreSQL en production, ex:
    # postgresql://user:password@host:5432/talentis_d)
    DATABASE_URL: str = "sqlite:///./talentis_d.db"

    # Sécurité JWT
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_super_secret_key_talentis_d"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 jours

    # CORS - origines autorisées pour le front React
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # Notification email lors d'une nouvelle demande de contact employeur.
    # Avec Gmail : SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, SMTP_USERNAME=votre
    # adresse Gmail, SMTP_PASSWORD=un "mot de passe d'application" Google
    # (pas votre mot de passe normal — voir README pour la procédure).
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "Talentis D <no-reply@talentis-d.com>"
    NOTIFY_EMAIL: str = "gradikikuni@gmail.com"

    class Config:
        env_file = ".env"


settings = Settings()