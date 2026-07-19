import torch
import numpy as np

from models.cnn14 import CNN14
from services.preprocessing import extract_mel

# -------------------------------
# Configuration
# -------------------------------

NUM_CLASSES = 18

MODEL_PATH = "models/best_animal_cnn.pt"

CLASS_NAMES = [
    "bear",
    "bird",
    "cat",
    "cow",
    "crow",
    "dog",
    "dolphin",
    "donkey",
    "elephant",
    "frog",
    "hen",
    "horse",
    "insects",
    "lion",
    "monkey",
    "pig",
    "rooster",
    "sheep"
]

# -------------------------------
# Load model once
# -------------------------------

device = torch.device("cpu")

model = CNN14(num_classes=NUM_CLASSES)

model.load_state_dict(
    torch.load(
        MODEL_PATH,
        map_location=device
    )
)

model.to(device)
model.eval()

# -------------------------------
# Prediction
# -------------------------------

def predict(audio_path):

    mel = extract_mel(audio_path)

    mel = torch.tensor(
        mel,
        dtype=torch.float32
    )

    # Add channel dimension
    mel = mel.unsqueeze(0)

    # Add batch dimension
    mel = mel.unsqueeze(0)

    mel = mel.to(device)

    with torch.no_grad():

        output = model(mel)

        probabilities = torch.softmax(output, dim=1)

        confidence, prediction = torch.max(
            probabilities,
            dim=1
        )

    return {
        "prediction": CLASS_NAMES[prediction.item()],
        "confidence": round(confidence.item() * 100, 2)
    }