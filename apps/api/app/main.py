from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .db.database import init_db
from .routes import slugs, pages, templates


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown


app = FastAPI(
    title="Valentine's Page Generator API",
    description="Create beautiful Valentine's pages with custom slugs",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://special.obvix.io",
        "https://dbff56b7902f.ngrok-free.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
