<div align="center">
  <h1>RE-Store</h1>
  <p><strong>Breathe new life into old photos — colorize, sharpen, and restore damaged images with AI, all from your phone.</strong></p>

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license)
  [![Expo](https://img.shields.io/badge/Expo-~54.0-000020?logo=expo)](https://expo.dev)
  [![React Native](https://img.shields.io/badge/React%20Native-0.81-61dafb?logo=react)](https://reactnative.dev)
  [![Python](https://img.shields.io/badge/Python-3.10+-3776ab?logo=python)](https://python.org)
  [![FastAPI](https://img.shields.io/badge/FastAPI-backend-009688?logo=fastapi)](https://fastapi.tiangolo.com)
</div>

---

<!-- TODO: Add a before/after screenshot or GIF demo here -->
<!-- Tip: A side-by-side comparison of a faded photo and its restored version makes a great hero image -->

## Why RE-Store?

Faded, damaged, or black-and-white photos of people you love shouldn't stay that way. RE-Store combines three specialized AI models into a single mobile workflow: draw a mask over damaged areas, tap a button, and watch your photo come back to life — colorized, sharpened, and reconstructed. Every result is saved to your personal cloud gallery so your restored memories are always at hand.

## ✨ Features

- **AI-powered colorization** — Converts grayscale images to natural color using the DDColor deep learning model
- **Face restoration & sharpening** — Enhances portrait detail via GFPGAN and Real-ESRGAN upscaling
- **Inpainting for damaged areas** — Draw a mask over scratches or missing regions; Stable Diffusion reconstructs them seamlessly
- **Cloud storage via Cloudinary** — Each restoration is automatically uploaded and organized into your gallery
- **Mask drawing tool** — Freehand SVG drawing directly on the photo to target only the areas that need repair
- **Grouped photo gallery** — Browse your restoration history organized into sessions, with thumbnail previews

## Prerequisites

### Backend
- Python 3.10+
- A CUDA-capable GPU is strongly recommended (Stable Diffusion inpainting runs on CPU, but is very slow)
- [Cloudinary](https://cloudinary.com) account (free tier works) for image storage
- Model weights (download separately and place in `backend/weights/`):
  - `RealESRGAN_x4plus.pth`
  - `GFPGANv1.4.pth`
  - `ddcolor.pth`

### Frontend
- [Node.js](https://nodejs.org/) v18 or higher
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- Expo Go app on your iOS or Android device, or a local emulator

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Photo-Restoration.git
cd Photo-Restoration
```

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/Scripts/activate      # Windows
# source venv/bin/activate         # macOS / Linux

# Install dependencies
pip install fastapi uvicorn python-dotenv pillow opencv-python torch torchvision \
            basicsr gfpgan realesrgan diffusers cloudinary
```

Create a `.env` file in the `backend/` directory:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Place your model weights in `backend/weights/`:
```
backend/
  weights/
    RealESRGAN_x4plus.pth
    GFPGANv1.4.pth
    ddcolor.pth
```

### 3. Frontend setup

```bash
cd frontend/RE-Store
npm install
```

## Quick Start

**Start the backend:**

```bash
cd backend
source venv/Scripts/activate
uvicorn main:app --reload --port 3000 --host 0.0.0.0
```

**Expose the backend to your phone** (if not on the same network):

```bash
# Using ngrok
ngrok http 3000
```

Update the `API_URL` constant in `frontend/RE-Store/app/conversion.tsx` with your ngrok or local URL.

**Start the frontend:**

```bash
cd frontend/RE-Store
npx expo start
```

Scan the QR code with Expo Go on your phone (or press `a` for Android emulator / `i` for iOS simulator).

## Usage

1. **Launch the app** — you'll land on the home screen with two options: **Storage** and **Conversion**
2. **Tap Conversion** — pick an image from your photo library
3. **Draw a mask** — use your finger to paint over damaged, faded, or missing areas of the photo
4. **Tap Run** — the app sends the image and mask to the backend, which runs the full AI pipeline:
   - Sharpening (GFPGAN + Real-ESRGAN)
   - Colorization (DDColor)
   - Inpainting on masked regions (Stable Diffusion)
5. **View results** — you're automatically taken to the viewer screen where intermediate and final results appear as they upload to Cloudinary
6. **Browse Storage** — tap Storage on the home screen to see all previous restoration sessions in a grid gallery

## Project Structure

```
Photo-Restoration/
├── backend/
│   ├── main.py              # FastAPI app — all AI model endpoints
│   ├── weights/             # Model weight files (download separately)
│   └── .env                 # Cloudinary credentials (create this)
│
└── frontend/RE-Store/
    ├── app/
    │   ├── index.tsx        # Home screen
    │   ├── conversion.tsx   # Image picker + mask drawing + API call
    │   ├── storage.tsx      # Photo gallery grid
    │   └── viewer.tsx       # Result viewer
    ├── assets/
    │   └── photos/groups.json   # Local photo group metadata
    └── package.json
```

## Design System

The app uses a consistent dark-purple aesthetic throughout:

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#8B3FC8` | Buttons, accents |
| Accent | `#C77DFF` | Highlights, borders |
| Background | `#0D0D0D` | Screen backgrounds |
| Surface | `#1C1C1C` | Cards, containers |
| Text | `#F0F0F0` | Primary text |

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git clone https://github.com/your-username/Photo-Restoration.git
cd Photo-Restoration/backend
pip install -r requirements.txt  # (create this from your working env)
```

## License

[MIT](LICENSE)
