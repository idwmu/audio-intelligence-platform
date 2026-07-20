from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from services.inference import predict

import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/predict")
async def classify(file: UploadFile):

    os.makedirs("uploads", exist_ok=True)

    path = os.path.join("uploads", file.filename)

    with open(path, "wb") as f:
        f.write(await file.read())

    return predict(path)