import uuid
import os
from pathlib import Path
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"

SCREENSHOT_DIR = UPLOAD_DIR / "screenshots"
AUDIO_DIR = UPLOAD_DIR / "audio"

SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

MAX_IMAGE_SIZE = 5 * 1024 * 1024
MAX_AUDIO_SIZE = 10 * 1024 * 1024
CHUNK_SIZE = 64 * 1024

ALLOWED_IMAGE_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
}

ALLOWED_AUDIO_TYPES = {
    "audio/webm": ".webm",
    "audio/mp4": ".mp4",
    "audio/ogg": ".ogg",
}


class StorageService:

    @staticmethod
    async def save_file(file: UploadFile, folder: str) -> str:
        if folder == "screenshots":
            allowed = ALLOWED_IMAGE_TYPES
            max_size = MAX_IMAGE_SIZE
        else:
            allowed = ALLOWED_AUDIO_TYPES
            max_size = MAX_AUDIO_SIZE

        # Never trust filename extension; verify and normalize MIME type
        raw_content_type = file.content_type or ""
        mime_type = raw_content_type.split(";")[0].strip().lower()

        if mime_type not in allowed:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {raw_content_type}"
            )

        # Generate safe extension strictly from verified MIME type
        ext = allowed[mime_type]
        filename = f"{uuid.uuid4().hex}{ext}"

        target_dir = SCREENSHOT_DIR if folder == "screenshots" else AUDIO_DIR
        file_path = target_dir / filename

        size = 0

        # Stream file in chunks, never loading the entire file into memory
        with open(file_path, "wb") as f:
            while chunk := await file.read(CHUNK_SIZE):
                size += len(chunk)

                if size > max_size:
                    f.close()
                    file_path.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=413,
                        detail="File size exceeds allowed limit"
                    )

                f.write(chunk)

        # Ensure uploaded files are not executable
        try:
            os.chmod(file_path, 0o644)
        except OSError:
            pass

        return f"/uploads/{folder}/{filename}"