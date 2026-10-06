# Parcelhus Finder

A research project by Morten Sylvest Nøhr about the Danish *parcelhus*, the detached single-family house that became the everyday home of postwar Denmark.

Live site: https://parcelhusfinderv6v3.web.app

## What it does

- **Create a parcelhus**: describe a house ("yellow brick, large windows, flat roof…") and an AI model generates a photo of it. The generator uses FLUX with a custom LoRA trained on images of Danish parcelhuse. The *How much parcelhus?* slider sets how strongly the LoRA style is applied.
- **Gallery**: every generated image is saved with its prompt and shown in a shared gallery, newest first.
- **Explore a neighbourhood**: opens Google Street View in a random Danish parcelhus neighbourhood (one of nine towns between Slagelse and Spjald).
- **Podcast**: an 8-minute podcast on the history of the parcelhus, made with Google NotebookLM.
- **Info page**: background on the parcelhus and the source material.

## How it works

```
React app (Firebase Hosting)
  ├─ POST /api/generate-image ─► Cloud Function "api" ─► fal.ai flux-lora + Parcelhus LoRA
  │                                   └─ saves image to Firebase Storage, returns its URL
  ├─ GET  /api/get-audio-file ─► Cloud Function "api" ─► streams the podcast from Storage
  └─ reads/writes the gallery ─► Firebase Realtime Database
```

| Part | Where |
|---|---|
| Frontend (React, Create React App) | `src/` |
| Backend (one Express app as a 1st-gen Cloud Function, Node 22) | `functions/index.js` |
| Generated images | Firebase Storage, `generated_images/` |
| Podcast | Firebase Storage, `audio/Parcelhus_history.wav` (local copy in `audio/`) |
| Gallery entries (prompt, image URL, timestamp) | Realtime Database, `gallery/` |
| LoRA training config | `LORA/` |

Firebase project: `parcelhusfinderv6v3` (needs the Blaze plan for Cloud Functions and Storage).

### The Parcelhus LoRA

Trained with `fal-ai/flux-lora-fast-training` in September 2024. The trigger word is `&SHUFL`, and the backend adds it to every prompt. The weights (`pytorch_lora_weights.safetensors`, 164 MB) are loaded from fal.ai's storage. A backup copy goes in `LORA/`, which git ignores because the file is too large for GitHub.

## Development

Requirements: Node 22, the Firebase CLI (`npm i -g firebase-tools`), and access to the Firebase project.

```bash
npm install
cd functions && npm install && cd ..
```

Create a `.env` in the project root with the Firebase web config (from the Firebase console → Project settings → Your apps):

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_DATABASE_URL=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

The fal.ai API key is only used by the backend and is stored as a Firebase secret, never in the frontend:

```bash
firebase functions:secrets:set FAL_KEY
```

Run the frontend locally (it calls the deployed backend):

```bash
npm start
```

## Deploy

```bash
npm run build
firebase deploy --only functions:api,hosting
```

## Maintenance

`functions/scripts/fix-gallery-urls.js` repairs gallery image links that stopped working. It was used once in 2026 to replace old signed URLs; new images use permanent Firebase download URLs. Run it without arguments for a dry run, and with `--apply` to make the changes.

## Credits

- Concept and design: Morten Sylvest Nøhr: [stofogluft.dk](https://stofogluft.dk/)
- Image generation: [FLUX](https://fal.ai) via fal.ai
- Podcast: Google NotebookLM, based on material from Baggrund.com, Bolius.dk and Arbejdermuseet
