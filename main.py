from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from api.learning_router import router as learning_router

app = FastAPI(title="RemindMe API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(learning_router)
app.mount("/front", StaticFiles(directory="front"), name="front")


@app.get("/")
def serve_frontend() -> FileResponse:
    return FileResponse("front/index.html")
