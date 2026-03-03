from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.api.v1.routers import (
    auth,
    users,
    profiles,
    titles,
    watch_history,
    my_list,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # Shutdown (add cleanup here if needed)


def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.APP_TITLE,
        version=settings.APP_VERSION,
        docs_url="/docs" if settings.APP_DEBUG else None,
        redoc_url="/redoc" if settings.APP_DEBUG else None,
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Tighten in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Static file serving (local storage simulation).
    # Directory must exist before StaticFiles validates it at mount time.
    settings.STORAGE_BASE_DIR.mkdir(parents=True, exist_ok=True)
    app.mount("/media", StaticFiles(directory=str(settings.STORAGE_BASE_DIR)), name="media")

    # Exception handlers
    register_exception_handlers(app)

    # Routers
    api_prefix = "/api/v1"
    app.include_router(auth.router, prefix=api_prefix)
    app.include_router(users.router, prefix=api_prefix)
    app.include_router(profiles.router, prefix=api_prefix)
    app.include_router(titles.router, prefix=api_prefix)
    app.include_router(watch_history.router, prefix=api_prefix)
    app.include_router(my_list.router, prefix=api_prefix)

    return app


app = create_application()
