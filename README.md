# Whodat — Audio Intelligence Platform

A full-stack audio classifier that identifies whether a sound is an **animal**, a **machine/industrial sound**, or a **human voice** (with gender), and then predicts the specific class within that domain — e.g. "cow," "jackhammer," or "male."

Built around three independently fine-tuned CNN14 (PANNs) models, combined with a meta-classifier that routes each clip to the right domain before making a final prediction.

## How it works

```
                ┌───────────────┐
                │   Audio file   │
                └───────┬───────┘
                        │
                        ▼
              ┌───────────────────┐
              │  YAMNet embedding   │
              │      (frozen)      │
              └─────────┬──────────┘
                        ▼
              ┌───────────────────┐
              │    Router head     │
              │  (trained, router_v2) │
              └─────────┬──────────┘
                        ▼
              domain: animal / machine / human
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
 ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
 │ Animal CNN14│ │Machine CNN14│ │ Gender CNN14│
 └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
        └───────────────┼───────────────┘
                        ▼
          Predicted domain + class + confidence
```

Each of the three CNN14 specialist models was fine-tuned separately from the same pretrained AudioSet backbone (`Cnn14_16k.pth`) on its own dataset:

| Domain  | Classes |
|---|---|
| **Animal** | bear, bird, cat, cow, crow, dog, dolphin, donkey, elephant, frog, hen, horse, insects, lion, monkey, pig, rooster, sheep |
| **Machine** | air_conditioner, car_horn, drilling, engine_idling, fan, jackhammer, pump, siren, slider, toycar, toyconveyor, valve |
| **Human** | male, female |

### Domain routing: a trained router, not a confidence comparison

Early versions of this project tried routing by comparing confidence (then energy scores) directly across the three independently trained specialist models — this doesn't work well, because each specialist was only ever trained to be confident within its own class set and has no real concept of "this isn't my domain."

The current router instead is an actual trained model (`router_v2`, trained in the Kaggle notebooks): audio is passed through a frozen YAMNet embedding extractor, and a small trained router head maps that embedding to one of the three domains (animal / machine / human). The winning domain's specialist CNN14 model then produces the final class + confidence. This is a proper learned domain boundary instead of a post-hoc heuristic, and is why routing accuracy improved significantly over the energy-score approach.

## Project structure

```
.
├── backend/
│   ├── app.py              # Flask API — loads router + 3 specialists, exposes /api/classify
│   ├── router/              # YAMNet-embedding router head (router_v2)
│   ├── requirements.txt
│   └── models/
│       ├── animal/         # best_animal_cnn.pt, animal_le.pkl
│       ├── machine/        # machine_cnn14_best.pt, machine_le.pkl
│       └── human/          # gender_cnn14_best.pt, gender_le.pkl
├── notebooks/
│   └── meta_classifier.ipynb  # Training/experimentation notebook (incl. router_v2 training)
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── components/
    │       ├── Header.jsx
    │       ├── Turntable.jsx    # Animated turntable, spins while processing
    │       ├── Upload.jsx       # Uploads audio, calls the backend API
    │       └── Results.jsx      # Displays domain, prediction, confidence
    └── package.json
```

## Getting started

### 1. Get the model files

Each domain's fine-tuned checkpoint + label encoder needs to be downloaded from Kaggle and placed into the matching `backend/models/<domain>/` folder:

```
backend/models/animal/best_animal_cnn.pt
backend/models/animal/animal_le.pkl
backend/models/machine/machine_cnn14_best.pt
backend/models/machine/machine_le.pkl
backend/models/human/gender_cnn14_best.pt
backend/models/human/gender_le.pkl
```

### 2. Run the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Starts the API at `http://localhost:5000`. Works fine on CPU-only machines — no GPU required (falls back automatically if CUDA isn't available).

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. Upload a `.wav`/`.mp3` file and it's sent to the backend for classification.

## API

**`POST /api/classify`** — multipart form upload, field name `file`

Response:
```json
{
  "domain": "animal",
  "predicted": "cow",
  "confidence": 0.91,
  "top3": [
    { "label": "cow", "confidence": 0.91 },
    { "label": "donkey", "confidence": 0.05 },
    { "label": "sheep", "confidence": 0.02 }
  ],
  "router_probs": { "animal": 0.88, "machine": 0.07, "human": 0.05 },
  "unknown": false
}
```

## Tech stack

- **Models:** PyTorch, CNN14 (PANNs architecture), fine-tuned from AudioSet pretrained weights
- **Audio processing:** librosa (log-mel spectrograms)
- **Backend:** Flask, Flask-CORS
- **Frontend:** React (Vite)

## Known limitations / next steps

- All three specialist CNN14 models are assumed to share the same architecture and preprocessing (44100Hz, 256 mel bins, 5s duration) as the original animal/machine scaffold. If the human/gender model uses different preprocessing, its section of the pipeline needs its own config.
- The router (`router_v2`) is trained on the same three datasets the specialists were trained on — its accuracy on audio meaningfully different from that distribution (background noise, overlapping sounds, non-English speech, etc.) hasn't been separately validated.
- No hard "unknown/none of the above" class currently — very out-of-domain sounds (e.g. music) will still be forced into one of the three domains, just with a lower router probability.
