"""
Crée un compte administrateur en ligne de commande.

Usage :
    python create_admin.py admin@talentis-d.com un_mot_de_passe_solide

Un admin n'a ni profil travailleur ni profil employeur : il se connecte via
/auth/login normalement, et son active_role="admin" lui donne accès aux
routes /admin/*.
"""
import sys

from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models import models

Base.metadata.create_all(bind=engine)


def main():
    if len(sys.argv) != 3:
        print("Usage : python create_admin.py <email> <mot_de_passe>")
        sys.exit(1)

    email, password = sys.argv[1], sys.argv[2]
    if len(password) < 6:
        print("Le mot de passe doit contenir au moins 6 caractères.")
        sys.exit(1)

    db = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.email == email).first()
        if existing:
            print(f"Un compte existe déjà avec l'email {email}.")
            sys.exit(1)

        admin = models.User(
            email=email,
            hashed_password=hash_password(password),
            active_role=models.RoleEnum.admin,
        )
        db.add(admin)
        db.commit()
        print(f"Compte administrateur créé avec succès : {email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()