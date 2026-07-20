from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import os

from services.inference import load_models, predict
from services.model_registry import MODELS

app = FastAPI()

# Load all models once when the server starts
load_models()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def save_upload(file: UploadFile):
    """
    Save uploaded audio file and return its path.
    """
    os.makedirs("uploads", exist_ok=True)

    file_path = os.path.join("uploads", file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    return file_path


@app.get("/")
def root():
    return {
        "message": "Whodat Audio Classification API",
        "available_models": list(MODELS.keys())
    }


@app.post("/predict/{model_name}")
async def predict_audio(model_name: str, file: UploadFile):

    if model_name not in MODELS:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown model '{model_name}'"
        )

    file_path = await save_upload(file)

    result = predict(model_name, file_path)

    return result