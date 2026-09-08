import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class RoleEnum(str, enum.Enum):
    worker = "worker"
    employer = "employer"
    admin = "admin"


class ContractTypeEnum(str, enum.Enum):
    mission_courte = "mission_courte"   # petit contrat / job très court
    temps_partiel = "temps_partiel"
    temps_plein = "temps_plein"
    freelance = "freelance"
    stage = "stage"


class AvailabilityEnum(str, enum.Enum):
    immediate = "immediate"
    une_semaine = "une_semaine"
    un_mois = "un_mois"
    a_definir = "a_definir"


class JobStatusEnum(str, enum.Enum):
    active = "active"
    pourvue = "pourvue"
    fermee = "fermee"


class ApplicationStatusEnum(str, enum.Enum):
    en_attente = "en_attente"
    acceptee = "acceptee"
    refusee = "refusee"


class EmployerRequestStatusEnum(str, enum.Enum):
    nouveau = "nouveau"
    traite = "traite"


class User(Base):
    """
    Compte d'authentification unique. Un compte peut posséder un profil
    Travailleur et/ou un profil Employeur, et bascule de l'un à l'autre
    via `active_role` sans dupliquer les identifiants de connexion.
    """
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    active_role = Column(Enum(RoleEnum), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    worker_profile = relationship(
        "WorkerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    employer_profile = relationship(
        "EmployerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class WorkerProfile(Base):
    """Table dédiée aux travailleurs (distincte du profil employeur)."""
    __tablename__ = "worker_profiles"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)

    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    title = Column(String, nullable=True)          # ex: "Développeuse Frontend"
    bio = Column(Text, nullable=True)
    skills = Column(String, nullable=True)          # liste séparée par des virgules
    location = Column(String, nullable=True)
    availability = Column(Enum(AvailabilityEnum), default=AvailabilityEnum.a_definir)
    desired_contract_types = Column(String, nullable=True)  # csv de ContractTypeEnum
    cv_url = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="worker_profile")
    applications = relationship("Application", back_populates="worker", cascade="all, delete-orphan")


class EmployerProfile(Base):
    """Table dédiée aux entreprises / recruteurs (distincte du profil travailleur)."""
    __tablename__ = "employer_profiles"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)

    company_name = Column(String, nullable=False)
    contact_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    sector = Column(String, nullable=True)
    company_size = Column(String, nullable=True)
    website = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    siret = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Validation manuelle par un administrateur avant de pouvoir publier des offres.
    # Sera automatisée plus tard (ex: vérification SIRET), mais le champ reste identique.
    is_validated = Column(Boolean, default=False, nullable=False)
    validated_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="employer_profile")
    job_offers = relationship("JobOffer", back_populates="employer", cascade="all, delete-orphan")


class JobOffer(Base):
    __tablename__ = "job_offers"

    id = Column(String, primary_key=True, default=gen_uuid)

    # Lien vers un vrai compte employeur — conservé pour le système d'auto-publication
    # employeur (actuellement mis en réserve), mais optionnel : une offre peut aussi
    # être publiée directement par un administrateur sans compte employeur associé.
    employer_id = Column(String, ForeignKey("employer_profiles.id"), nullable=True)

    # Admin qui a publié l'offre (nouveau flux principal).
    posted_by_admin_id = Column(String, ForeignKey("users.id"), nullable=True)

    # Demande de contact employeur à l'origine de cette offre, le cas échéant.
    employer_request_id = Column(String, ForeignKey("employer_requests.id"), nullable=True)

    # Informations entreprise dénormalisées : toujours renseignées, que l'offre
    # vienne d'un compte employeur (copiées automatiquement) ou d'une saisie
    # manuelle par un administrateur. Ça simplifie l'affichage côté front,
    # qui n'a plus besoin de savoir d'où vient l'offre.
    company_name = Column(String, nullable=False)
    company_contact_name = Column(String, nullable=True)
    company_sector = Column(String, nullable=True)
    company_website = Column(String, nullable=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    contract_type = Column(Enum(ContractTypeEnum), nullable=False)
    location = Column(String, nullable=False)
    remote = Column(Boolean, default=False)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    skills_required = Column(String, nullable=True)  # csv
    duration = Column(String, nullable=True)          # ex: "3 jours", "2 semaines" pour missions courtes
    status = Column(Enum(JobStatusEnum), default=JobStatusEnum.active)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    employer = relationship("EmployerProfile", back_populates="job_offers")
    employer_request = relationship("EmployerRequest", back_populates="job_offers")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    questions = relationship(
        "JobQuestion", back_populates="job", cascade="all, delete-orphan",
        order_by="JobQuestion.order_index",
    )


class EmployerRequest(Base):
    """
    Demande de contact soumise publiquement (sans compte) par un employeur
    qui souhaite publier une offre. Un administrateur la traite ensuite en
    créant lui-même l'offre correspondante.
    """
    __tablename__ = "employer_requests"

    id = Column(String, primary_key=True, default=gen_uuid)

    company_name = Column(String, nullable=False)
    contact_name = Column(String, nullable=True)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    sector = Column(String, nullable=True)
    website = Column(String, nullable=True)
    message = Column(Text, nullable=False)  # description du besoin / de l'offre souhaitée

    status = Column(Enum(EmployerRequestStatusEnum), default=EmployerRequestStatusEnum.nouveau)
    created_at = Column(DateTime, default=datetime.utcnow)

    job_offers = relationship("JobOffer", back_populates="employer_request")


class JobQuestion(Base):
    """Question de présélection définie par l'employeur pour une offre donnée."""
    __tablename__ = "job_questions"

    id = Column(String, primary_key=True, default=gen_uuid)
    job_id = Column(String, ForeignKey("job_offers.id"), nullable=False)

    question_text = Column(String, nullable=False)
    is_required = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)

    job = relationship("JobOffer", back_populates="questions")
    answers = relationship("ApplicationAnswer", back_populates="question", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, default=gen_uuid)
    job_id = Column(String, ForeignKey("job_offers.id"), nullable=False)
    worker_id = Column(String, ForeignKey("worker_profiles.id"), nullable=False)

    cover_letter = Column(Text, nullable=True)          # mot de motivation libre (existant)
    cv_url = Column(String, nullable=True)               # fichier CV uploadé pour CETTE candidature
    cover_letter_file_url = Column(String, nullable=True)  # fichier lettre de motivation uploadé
    status = Column(Enum(ApplicationStatusEnum), default=ApplicationStatusEnum.en_attente)
    created_at = Column(DateTime, default=datetime.utcnow)

    job = relationship("JobOffer", back_populates="applications")
    worker = relationship("WorkerProfile", back_populates="applications")
    answers = relationship(
        "ApplicationAnswer", back_populates="application", cascade="all, delete-orphan"
    )


class ApplicationAnswer(Base):
    """Réponse du travailleur à une question de présélection de l'employeur."""
    __tablename__ = "application_answers"

    id = Column(String, primary_key=True, default=gen_uuid)
    application_id = Column(String, ForeignKey("applications.id"), nullable=False)
    question_id = Column(String, ForeignKey("job_questions.id"), nullable=False)

    answer_text = Column(Text, nullable=False)

    application = relationship("Application", back_populates="answers")
    question = relationship("JobQuestion", back_populates="answers")