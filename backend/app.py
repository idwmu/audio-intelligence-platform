from fastapi import FastAPI, UploadFile
from services.inference import predict

import os

app = FastAPI()


@app.post("/predict")
async def classify(file: UploadFile):

    os.makedirs("uploads", exist_ok=True)

    path = os.path.join("uploads", file.filename)

    with open(path, "wb") as f:
        f.write(await file.read())

    result = predict(path)

    return result