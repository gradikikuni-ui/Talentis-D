from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.models import (
    RoleEnum,
    ContractTypeEnum,
    AvailabilityEnum,
    JobStatusEnum,
    ApplicationStatusEnum,
    EmployerRequestStatusEnum,
)


# ---------- AUTH ----------

class WorkerRegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str
    phone: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[str] = None
    availability: Optional[AvailabilityEnum] = AvailabilityEnum.a_definir


class EmployerRegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    company_name: str
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    sector: Optional[str] = None
    company_size: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    active_role: RoleEnum
    has_worker_profile: bool
    has_employer_profile: bool


# ---------- PROFILES ----------

class WorkerProfileOut(BaseModel):
    id: str
    full_name: str
    phone: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    location: Optional[str] = None
    availability: AvailabilityEnum
    desired_contract_types: Optional[str] = None
    cv_url: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class WorkerProfileUpdateIn(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    location: Optional[str] = None
    availability: Optional[AvailabilityEnum] = None
    desired_contract_types: Optional[str] = None
    cv_url: Optional[str] = None


class EmployerProfileOut(BaseModel):
    id: str
    company_name: str
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    sector: Optional[str] = None
    company_size: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    is_validated: bool

    class Config:
        from_attributes = True


class EmployerProfileUpdateIn(BaseModel):
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    sector: Optional[str] = None
    company_size: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None


class MeOut(BaseModel):
    id: str
    email: EmailStr
    active_role: RoleEnum
    worker_profile: Optional[WorkerProfileOut] = None
    employer_profile: Optional[EmployerProfileOut] = None


# ---------- QUESTIONS DE PRÉSÉLECTION ----------

class JobQuestionIn(BaseModel):
    """Question envoyée par l'employeur à la création/modification d'une offre."""
    question_text: str
    is_required: bool = True


class JobQuestionOut(BaseModel):
    id: str
    question_text: str
    is_required: bool
    order_index: int

    class Config:
        from_attributes = True


# ---------- JOB OFFERS ----------

class JobOfferCreateIn(BaseModel):
    """
    Utilisé par le flux employeur en réserve (auto-publication). Les infos
    entreprise ne sont pas incluses ici : elles sont copiées automatiquement
    depuis le profil employeur du compte connecté.
    """
    title: str
    description: str
    contract_type: ContractTypeEnum
    location: str
    remote: bool = False
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    skills_required: Optional[str] = None
    duration: Optional[str] = None
    questions: Optional[list[JobQuestionIn]] = None


class JobOfferUpdateIn(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    contract_type: Optional[ContractTypeEnum] = None
    location: Optional[str] = None
    remote: Optional[bool] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    skills_required: Optional[str] = None
    duration: Optional[str] = None
    status: Optional[JobStatusEnum] = None
    questions: Optional[list[JobQuestionIn]] = None


class AdminJobCreateIn(BaseModel):
    """Création d'offre par un administrateur — flux principal actuel."""
    title: str
    description: str
    contract_type: ContractTypeEnum
    location: str
    remote: bool = False
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    skills_required: Optional[str] = None
    duration: Optional[str] = None
    questions: Optional[list[JobQuestionIn]] = None

    company_name: str
    company_contact_name: Optional[str] = None
    company_sector: Optional[str] = None
    company_website: Optional[str] = None
    employer_request_id: Optional[str] = None  # lie l'offre à la demande de contact d'origine


class AdminJobUpdateIn(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    contract_type: Optional[ContractTypeEnum] = None
    location: Optional[str] = None
    remote: Optional[bool] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    skills_required: Optional[str] = None
    duration: Optional[str] = None
    status: Optional[JobStatusEnum] = None
    questions: Optional[list[JobQuestionIn]] = None

    company_name: Optional[str] = None
    company_contact_name: Optional[str] = None
    company_sector: Optional[str] = None
    company_website: Optional[str] = None


class JobOfferOut(BaseModel):
    id: str
    title: str
    description: str
    contract_type: ContractTypeEnum
    location: str
    remote: bool
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    skills_required: Optional[str] = None
    duration: Optional[str] = None
    status: JobStatusEnum
    created_at: datetime
    company_name: str
    company_contact_name: Optional[str] = None
    company_sector: Optional[str] = None
    company_website: Optional[str] = None
    questions: list[JobQuestionOut] = []

    class Config:
        from_attributes = True


# ---------- UPLOADS (CV / lettre de motivation) ----------

class UploadOut(BaseModel):
    url: str
    filename: str


# ---------- APPLICATIONS ----------

class ApplicationAnswerIn(BaseModel):
    question_id: str
    answer_text: str


class ApplicationCreateIn(BaseModel):
    cover_letter: Optional[str] = None          # mot de motivation libre (existant)
    cv_url: Optional[str] = None                 # URL renvoyée par /uploads/file
    cover_letter_file_url: Optional[str] = None  # URL du fichier lettre de motivation
    answers: list[ApplicationAnswerIn] = []


class ApplicationAnswerOut(BaseModel):
    id: str
    question_id: str
    answer_text: str

    class Config:
        from_attributes = True


class WorkerMiniOut(BaseModel):
    id: str
    full_name: str
    title: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[str] = None
    avatar_url: Optional[str] = None
    cv_url: Optional[str] = None

    class Config:
        from_attributes = True


class JobMiniOut(BaseModel):
    id: str
    title: str
    contract_type: ContractTypeEnum
    location: str

    class Config:
        from_attributes = True


class ApplicationOut(BaseModel):
    id: str
    status: ApplicationStatusEnum
    cover_letter: Optional[str] = None
    cv_url: Optional[str] = None
    cover_letter_file_url: Optional[str] = None
    created_at: datetime
    job: JobMiniOut
    worker: WorkerMiniOut
    answers: list[ApplicationAnswerOut] = []

    class Config:
        from_attributes = True


class ApplicationStatusUpdateIn(BaseModel):
    status: ApplicationStatusEnum


# ---------- DEMANDES DE CONTACT EMPLOYEUR (formulaire public) ----------

class EmployerRequestIn(BaseModel):
    """Formulaire public rempli par un employeur, sans compte requis."""
    company_name: str
    contact_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    sector: Optional[str] = None
    website: Optional[str] = None
    message: str = Field(min_length=10, description="Décrivez le poste ou le besoin de recrutement")


class EmployerRequestOut(BaseModel):
    id: str
    company_name: str
    contact_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    sector: Optional[str] = None
    website: Optional[str] = None
    message: str
    status: EmployerRequestStatusEnum
    created_at: datetime

    class Config:
        from_attributes = True


class EmployerRequestStatusUpdateIn(BaseModel):
    status: EmployerRequestStatusEnum


# ---------- ADMINISTRATION ----------

class AdminEmployerOut(BaseModel):
    """Vue admin d'un employeur, avec son email (absent de EmployerProfileOut public)."""
    id: str
    company_name: str
    contact_name: Optional[str] = None
    sector: Optional[str] = None
    website: Optional[str] = None
    is_validated: bool
    created_at: datetime
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True