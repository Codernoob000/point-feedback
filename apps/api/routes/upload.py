import os
import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter(
    prefix="/api/v1/upload",
    tags=["Upload"]
)

UPLOAD_DIR = "uploads/screenshots"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        ext = file.filename.split(".")[-1]

        filename = f"{uuid.uuid4()}.{ext}"

        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as buffer:
            buffer.write(await file.read())

        return {
            "success": True,
            "url": f"/uploads/screenshots/{filename}"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )