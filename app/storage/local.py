import uuid
from pathlib import Path

import aiofiles
from fastapi import UploadFile

from app.core.config import settings


async def save_file(file: UploadFile, folder: str) -> str:
    """
    Persist an uploaded file to the local filesystem.

    Returns the public URL that can be stored in the DB and served
    via the /media static mount.
    """
    suffix = Path(file.filename or "upload").suffix or ".bin"
    filename = f"{uuid.uuid4().hex}{suffix}"

    dest_dir = settings.STORAGE_BASE_DIR / folder
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / filename

    async with aiofiles.open(dest_path, "wb") as out:
        while chunk := await file.read(1024 * 256):  # 256 KB chunks
            await out.write(chunk)

    return f"{settings.STORAGE_BASE_URL}/{folder}/{filename}"


async def delete_file(url: str) -> None:
    """
    Remove a previously saved file.
    Derives the filesystem path from the public URL.
    Silent no-op if the file is already gone.
    """
    base = settings.STORAGE_BASE_URL.rstrip("/")
    if not url.startswith(base):
        return  # not a locally managed file

    relative = url[len(base):].lstrip("/")
    path = settings.STORAGE_BASE_DIR / relative
    try:
        path.unlink()
    except FileNotFoundError:
        pass
