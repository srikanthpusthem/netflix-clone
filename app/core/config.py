from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_TITLE: str = "Netflix Clone API"
    APP_VERSION: str = "1.0.0"

    # Database
    DATABASE_URL: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Storage
    STORAGE_BASE_DIR: Path = Path("./media")
    STORAGE_BASE_URL: str = "http://localhost:8000/media"

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # Business rules
    MAX_PROFILES_PER_USER: int = 5


settings = Settings()  # type: ignore[call-arg]
