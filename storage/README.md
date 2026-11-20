# SonicVault storage
- `audio/` — 6,413 encoded sounds (AAC/m4a), named by id.
- `manifest.json` — full metadata (names EN/AR, category, features, waveform peaks, license, source). The app auto-seeds PostgreSQL from it.
- `download-videos-pipeline.mjs` — downloads all 468 videos of motionvideohq/awesome-opus-5-5-motion-design and extracts their audio (ffmpeg).
- `ingest-pipeline.mjs` — analyses (FFT features), slices (silence detection), names, classifies and encodes every sound from the videos + cloned repos
  (novincode/atomcut-library, ashrafatam96/sound-sfx, Barty-Bart/motion-graphics).
