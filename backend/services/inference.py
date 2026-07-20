import torch

from models.cnn14 import CNN14
from services.preprocessing import extract_mel
from services.model_registry import MODELS

device = torch.device("cpu")

# Stores loaded models
loaded_models = {}


def load_models():
    """
    Load every model into memory when the server starts.
    """

    global loaded_models

    for model_name, config in MODELS.items():

        model = CNN14(num_classes=len(config["classes"]))

        model.load_state_dict(
            torch.load(
                config["weights"],
                map_location=device
            )
        )

        model.to(device)
        model.eval()

        loaded_models[model_name] = model

    print("Models loaded:", list(loaded_models.keys()))


def predict(model_name, audio_path):
    """
    Predict the class of an audio file using the selected model.
    """

    if model_name not in loaded_models:
        raise ValueError(f"Unknown model: {model_name}")

    model = loaded_models[model_name]
    class_names = MODELS[model_name]["classes"]

    # Preprocess audio
    mel = extract_mel(audio_path)

    mel = torch.tensor(
        mel,
        dtype=torch.float32
    )

    # (256,431) -> (1,1,256,431)
    mel = mel.unsqueeze(0).unsqueeze(0)

    mel = mel.to(device)

    with torch.no_grad():

        output = model(mel)

        probs = torch.softmax(output, dim=1)

        confidence, prediction = torch.max(probs, dim=1)

    return {
        "prediction": class_names[prediction.item()],
        "confidence": round(confidence.item() * 100, 2)
    }