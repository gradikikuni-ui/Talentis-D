from fastapi import APIRouter, Depends, UploadFile, File

from app.core.deps import get_current_user
from app.core.uploads import save_upload
from app.models import models
from app.schemas import schemas

router = APIRouter(prefix="/uploads", tags=["Fichiers (CV / lettres de motivation)"])


@router.post("/file", response_model=schemas.UploadOut, status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    user: models.User = Depends(get_current_user),
):
    """
    Upload générique (PDF/DOC/DOCX, 5 Mo max) utilisé aussi bien pour un CV
    que pour une lettre de motivation. Retourne l'URL relative du fichier.
    """
    url = await save_upload(file)
    return schemas.UploadOut(url=url, filename=file.filename)