# Original User Request

## 2026-08-04T20:25:30Z

Build a production-ready, interactive, modular multi-file React web application (Vite + React + Tailwind CSS) for mastering the complete Oxford 3000 CEFR Lexicon (A1 to B2) using Gemini AI, Speech Recognition, Dual Audio TTS Engines, Interactive Storytelling, Persona-based AI Tutoring, and Visual Memory Illustrations, with automated deployment to GitHub Pages via GitHub Actions.

Working directory: `c:\Users\HP\Downloads\English\oxford-3000-platform`
Integrity mode: development

## Requirements

### R1. Oxford 3000 Complete Lexicon & Catalog Grid
- Complete Oxford 3000 lexicon dataset (A1-B2) with word, part of speech, CEFR level, Arabic translation, example sentence, and IPA phonetic transcription.
- Interactive catalog grid (`LexiconGrid.jsx`) with virtual pagination (16-20 items/page), A–Z letter filter, and CEFR level filter buttons (ALL, A1, A2, B1, B2).
- AI Instant Lexicon Fetcher: dynamically query Gemini API for missing terms to get CEFR level, translation, phonetic, and example, appending live to state.
- LTR isolation CSS rules (`direction: ltr; unicode-bidi: isolate`) on all English tokens to prevent RTL Arabic layout corruption.

### R2. Dual-Engine Audio & AI Speech Evaluation
- Dual Audio TTS Engine (`audioService.js`): Primary native `window.speechSynthesis` (en-US, 0.6x/0.9x speed) with automatic fallback to online Google Translate TTS API stream.
- AI Speech Recognition Engine (`speechEvaluation.js`): microphone recording via `webkitSpeechRecognition`, string similarity accuracy scoring (0%-100%) with actionable feedback.
- Interactive sentence word tokens: split AI sentences into clickable tokens for independent pronunciation/evaluation.
- Line-by-line speech evaluation for stories and full sentence visual score breakdown (Green ✓ / Red ✗).

### R3. Gemini AI Features (Sentence Builder, Storyteller, Tutor)
- Interactive AI Sentence Generator with length control (Short, Medium, Long), position anchor (Beginning, Middle, End), style/genre selection, and one-click regeneration.
- Interactive AI Storyteller (`Storyteller.jsx`) using 1-5 selected words, customizable genre/level, displaying line-by-line audio, speech scoring, and Arabic translations.
- AI Personal English Tutor (`PersonalTutor.jsx`) with roleplay scenarios (Job Interview, Airport, Coffee Shop, etc.), real-time grammar feedback, Arabic translation toggles, and voice I/O.

### R4. Flashcards, Quiz Game & Analytics Dashboard
- 3D Flip Flashcards (`Flashcards.jsx`) with SRS mechanics, "Mark as Mastered", and "Favorite" toggles.
- Interactive Quiz Game (`QuizGame.jsx`) with multiple choice questions, scoring, and audio pronunciation.
- Progress Analytics Dashboard (`Analytics.jsx`) tracking total words, mastered words, favorites, and CEFR level mastery.

### R5. Repository Setup & Automated GitHub Pages Deployment
- Modular multi-file project layout with Vite + React 18 + Tailwind CSS (Dark Glassmorphic UI theme `#060d21`).
- Configure `vite.config.js` base path for GitHub Pages.
- GitHub Actions workflow `.github/workflows/deploy.yml` for automated build & deployment on push to `main`.
- Automated Git init, dependency installation, commit, and GitHub CLI repo creation (`gh repo create oxford-3000-platform --public`).

## Acceptance Criteria

### Core Functionality & UI
- [ ] Application compiles cleanly with Vite + React + Tailwind CSS without build or runtime errors.
- [ ] Oxford 3000 lexicon dataset (A1-B2) is accessible and filterable by A-Z letters and CEFR level.
- [ ] English text tokens strictly isolate layout with LTR rules without breaking Arabic translations.
- [ ] TTS audio plays correctly using native Web Speech API or fallback stream.
- [ ] Speech recognition evaluates user spoken audio and returns percentage score with word breakdown.

### AI Features
- [ ] Gemini AI sentence generator respects length, position anchor, and genre constraints.
- [ ] Storyteller generates line-by-line interactive stories with translations and evaluation.
- [ ] Personal Tutor provides real-time roleplay responses and grammar feedback.

### Deployment & Build
- [ ] `npm run build` succeeds and produces static assets in `./dist`.
- [ ] `.github/workflows/deploy.yml` is present and correctly configured.
- [ ] Local git commit is created and pushed to GitHub repo.
