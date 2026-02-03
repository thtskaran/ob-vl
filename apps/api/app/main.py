from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .db.database import init_db
from .routes import slugs, pages, templates
from .services.redis_client import redis_client
from .config import ALLOWED_ORIGINS


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    await redis_client.connect()
    yield
    # Shutdown
    await redis_client.close()


app = FastAPI(
    title="Valentine's Page Generator API",
    description="Create beautiful Valentine's pages with custom slugs",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware - dynamically configured via environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "X-Edit-Token"],
)

# Include routers
app.include_router(slugs.router, prefix="/api/slugs", tags=["slugs"])
app.include_router(pages.router, prefix="/api/pages", tags=["pages"])
app.include_router(templates.router, prefix="/api/templates", tags=["templates"])


@app.get("/")
async def root():
    return {"message": "Valentine's Page Generator API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
