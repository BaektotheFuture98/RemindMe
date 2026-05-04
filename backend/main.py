from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.api.learning_router import router as learning_router

BASE_DIR = Path(__file__).resolve().parent
FRONT_DIR = BASE_DIR.parent / "front"

app = FastAPI(title="Witness Me API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(learning_router)
app.mount("/", StaticFiles(directory=str(FRONT_DIR), html=True), name="frontend")
