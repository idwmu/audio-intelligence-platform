# Whodat — Audio Intelligence Platform

A full-stack audio classifier that identifies the specific class of a sound within a chosen domain — **animal**, **machine/industrial**, or **human voice (gender)** — e.g. "cow," "jackhammer," or "male."

Built around three independently fine-tuned CNN14 (PANNs) models. The user selects which domain to classify against via a dropdown in the UI, and the backend runs inference using that domain's specialist model.

## How it works

```
Frontend (React)
   |
   |  user selects domain: animal / machine / human
   |  user uploads audio file
   v
POST /predict/{model_name}
   |
   v
FastAPI backend  ->  loads log-mel spectrogram  ->  runs selected domain's CNN14 model
   |
   v
{ prediction: class label, confidence: 0-100 }
```

Each of the three CNN14 specialist models was fine-tuned separately from the same pretrained AudioSet backbone (`Cnn14_16k.pth`) on its own dataset:

| Domain  | Classes |
|---|---|
| **Animal** | bear, bird, cat, cow, crow, dog, dolphin, donkey, elephant, frog, hen, horse, insects, lion, monkey, pig, rooster, sheep |
| **Machine** | air_conditioner, car_horn, drilling, engine_idling, fan, jackhammer, pump, siren, slider, toycar, toyconveyor, valve |
| **Human** | male, female |

> **Note:** domain selection is currently manual (dropdown in the header), not automatic. An earlier prototype explored automatic domain detection (comparing model confidence, then energy scores, then a trained YAMNet-embedding router) but that isn't part of the current deployed backend. See `SDLC.md` → Future Work for details.

## Project structure

```
.
├── backend/
│   ├── app.py                       # FastAPI app, exposes GET / and POST /predict/{model_name}
│   ├── models/
│   │   └── cnn14.py                 # CNN14 architecture
│   ├── services/
│   │   ├── inference.py             # Loads all 3 models at startup, runs prediction
│   │   ├── model_registry.py        # Maps domain name -> checkpoint path + class list
│   │   └── preprocessing.py         # Log-mel spectrogram extraction
│   └── test_preprocessing.py        # Manual smoke test for preprocessing
└── frontend/
    └── src/
        ├── App.jsx
        └── components/
            ├── Header.jsx           # Logo + domain selector dropdown
            ├── Turntable.jsx        # Animated turntable, spins while processing
            ├── Upload.jsx           # Uploads audio, calls the backend API
            └── Screen.jsx           # Displays prediction + confidence
```

## Getting started

### 1. Get the model files

The trained model checkpoints are too large for GitHub, so they're hosted on Google Drive instead:

**[Download models from Google Drive](https://drive.google.com/drive/folders/1qpSbt0LRVphpCuOEE0PhMWsEdx9o4ED6?usp=sharing)**

Download the folder and place the files into `backend/models/` so the structure matches what `services/model_registry.py` expects:

```
backend/models/best_animal_cnn.pt
backend/models/machine_cnn14_best.pt
backend/models/gender_cnn14_best.pt
```

**Alternative — download via script:**
```bash
pip install gdown
gdown --folder https://drive.google.com/drive/folders/YOUR_FOLDER_ID -O backend/models
```
(Replace `YOUR_FOLDER_ID` with the ID from your Drive folder's share link — the part after `/folders/`.)

### 2. Run the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py                 # or: uvicorn app:app --reload
```

Starts the API at `http://127.0.0.1:8000`. Works fine on CPU-only machines — no GPU required.

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://127.0.0.1:5173`. Select a domain from the dropdown, upload a `.wav`/`.mp3` file, and it's sent to the backend for classification.

## API

**`GET /`** — lists available models
```json
{ "message": "Whodat Audio Classification API", "available_models": ["animal", "machine", "human"] }
```

**`POST /predict/{model_name}`** — multipart form upload, field name `file`. `model_name` is one of `animal`, `machine`, `human`.

Response:
```json
{
  "prediction": "cow",
  "confidence": 91.3
}
```

## Tech stack

- **Models:** PyTorch, CNN14 (PANNs architecture), fine-tuned from AudioSet pretrained weights
- **Audio processing:** librosa (log-mel spectrograms)
- **Backend:** FastAPI
- **Frontend:** React (Vite)

## Known limitations / next steps

- Domain selection is manual — the user must know in advance whether their clip is an animal, machine, or human sound. See `SDLC.md` for the planned automatic-routing approach.
- `test_preprocessing.py` is a manual print-and-check script rather than an automated `pytest` suite with real pass/fail assertions.
- No CI pipeline currently runs tests automatically on push.
- No hard "unknown/none of the above" handling — audio that doesn't fit any class in the selected domain will still be forced into one of that domain's classes.

See `SDLC.md` for the full development process writeup.
