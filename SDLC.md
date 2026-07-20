# Software Development Life Cycle — Whodat: Audio Intelligence Platform

This document walks through this project's development using standard SDLC phases, with the specific artifacts produced at each phase.

---

## 1. Planning & Requirements

**Project charter / problem statement:** build a system that classifies short audio clips into one of three domains — **animal sounds**, **machine/industrial sounds**, or **human voice (gender)** — and predicts the specific class within the selected domain (e.g. "cow," "jackhammer," "male").

**Business/product requirements:**
- Reuse existing labeled datasets per domain (already available on Kaggle) rather than building one unified dataset from scratch.
- Provide a simple web interface where a user uploads an audio clip and selects which domain to classify it against.
- Keep each domain's model independently trainable/replaceable without affecting the others.

**Acceptance criteria:**
- User can upload a `.wav`/`.mp3`/similar audio file through the frontend.
- User can select a domain (Animals / Machines / Humans) via the model dropdown.
- Backend returns a predicted class + confidence score for the selected domain within a reasonable response time on CPU.
- Each domain's specialist model performs well on its own held-out test clips.

**Constraint identified early:** full raw training data for all three domains is scattered across multiple separate Kaggle datasets, which made building a single unified end-to-end classifier (with automatic domain detection) significantly more expensive to set up than training three specialists and handling domain selection at the application layer instead.

---

## 2. System Design

**Architecture:** three independently fine-tuned CNN14 (PANNs) models — one per domain — sharing the same pretrained AudioSet backbone (`Cnn14_16k.pth`). The **user explicitly selects the domain** via the frontend; the backend loads all three models at startup and dispatches the request to whichever one was selected.

```
Frontend (React)
   |
   |  user selects domain: animal / machine / human
   |  user uploads audio file
   v
POST /predict/{model_name}
   |
   v
FastAPI backend
   |
   +- services/preprocessing.py   -> extract log-mel spectrogram
   +- services/model_registry.py  -> maps domain name to weights + class list
   +- services/inference.py       -> loads models, runs inference
   +- models/cnn14.py             -> CNN14 architecture
   |
   v
{ prediction: class label, confidence: 0-100 }
```

**Module specification:**
| Module | Responsibility |
|---|---|
| `models/cnn14.py` | CNN14 network definition (shared architecture across all 3 domains) |
| `services/preprocessing.py` | Audio loading + log-mel spectrogram extraction |
| `services/model_registry.py` | Static config mapping domain name → checkpoint path + class labels |
| `services/inference.py` | Loads all models at startup, runs prediction for a given domain |
| `app.py` | FastAPI app, exposes `GET /` and `POST /predict/{model_name}` |
| `frontend/src/components/Header.jsx` | Domain selector dropdown (Animals/Machines/Humans) |
| `frontend/src/components/Upload.jsx` | File upload UI |
| `frontend/src/components/Turntable.jsx` | Processing animation |
| `frontend/src/components/Screen.jsx` | Displays prediction result |

**API design:**
- `GET /` → lists available models
- `POST /predict/{model_name}` → multipart file upload, `model_name` is one of `animal` / `machine` / `human`; returns `{ prediction, confidence }`

**No database is used** — models and class labels are defined statically in `model_registry.py`; there's no persistent storage of uploads or prediction history in the current design.

**UI wireframe (as built):** header with logo + domain dropdown → turntable graphic (spins while processing) → results screen (shows prediction + confidence) → upload button fixed at the bottom.

---

## 3. Implementation & Coding

- Fine-tuned three CNN14 specialist models separately in Kaggle notebooks, from the shared pretrained AudioSet backbone.
- Built shared mel-spectrogram feature extraction (`services/preprocessing.py`).
- Built the FastAPI backend (`app.py` + `services/`), replacing an earlier Flask prototype used during initial development.
- Built the React (Vite) frontend: domain selector, upload flow, turntable animation, results screen.
- Version control: tracked via Git/GitHub (`idwmu/audio-intelligence-platform`), with model checkpoints excluded via `.gitignore` and hosted separately on Google Drive due to GitHub's file size limits.
- API documentation: see the "API" section in `README.md` for endpoint contracts.

**Code review notes:** backend and frontend were split as separate workstreams between teammates; the integration point is the `POST /predict/{model_name}` contract, kept intentionally simple (one file, one domain name, one JSON response) to minimize coordination overhead between the two sides.

---

## 4. Testing & QA

**Test plan:**
- Per-model validation: each specialist model tested independently on held-out clips from its own domain to confirm baseline accuracy before integration.
- Preprocessing test (`backend/test_preprocessing.py`): verifies `extract_mel()` produces a correctly shaped spectrogram from a sample audio file.
- Manual end-to-end testing: uploading real clips through the frontend for each of the three domains and confirming the returned prediction/confidence looks correct.

**Test cases (manual, current):**
| Domain | Sample input | Expected | Status |
|---|---|---|---|
| Animal | cow sound clip | "cow" predicted with reasonable confidence | Works well individually |
| Machine | conveyor/machine sound clip | correct machine class | Works well individually |
| Human | voice clip | correct gender | Works well individually |

**Known gaps / defect log:**
- `test_preprocessing.py` is a manual smoke-test script (prints shape, no assertions) rather than an automated test with a pass/fail signal — upgrading to `pytest` with real assertions is a planned improvement.
- No automated test suite currently runs on push (no CI pipeline yet).
- Domain selection is manual (user picks via dropdown) — there is no automated test of "correct domain routing" because there is currently no automatic routing to test (see Future Work).

---

## 5. Deployment & Maintenance

**Current deployment (runbook):**
```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py                 # or: uvicorn app:app --reload
# serves on http://127.0.0.1:8000

# Frontend
cd frontend
npm install
npm run dev
# serves on http://127.0.0.1:5173
```

**Model distribution:** trained checkpoints are too large for GitHub and are distributed via a shared Google Drive link (see README) rather than committed to the repo directly.

**User manual (how to use):** open the frontend, select a domain from the dropdown in the header (Animals / Machines / Humans), upload an audio file, wait for the turntable animation to finish, and read the predicted class + confidence on the results screen.

**Release notes:** see Git commit history / GitHub releases for version-by-version changes (currently informal, no tagged releases yet).

**Maintenance plan:** each domain's model can be retrained and its checkpoint swapped independently via `model_registry.py` without touching the other two domains or the frontend, as long as the class list and input shape stay the same.

---

## 6. Future Work

- **Automatic domain routing:** currently the user manually selects the domain via a dropdown. An earlier design explored automatic detection (comparing model confidence/energy scores, then a YAMNet-embedding-based trained router) but this was not carried into the current deployed backend. Adding it back is planned future work, so a user could upload any clip without knowing its domain in advance.
- **Automated test suite / CI:** convert `test_preprocessing.py` into real `pytest` assertions and add a CI workflow to run on every push.
- **Expand class coverage** within each domain using additional labeled data, with augmentation (pitch/time shifting, SpecAugment) to improve robustness.
- **Confusion matrix evaluation** per domain to identify which specific classes are most often mistaken for each other.
