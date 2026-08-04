# Project: Oxford 3000 CEFR Lexicon Application

## Architecture
- React 18 + Vite + Tailwind CSS (Dark Glassmorphic UI theme `#060d21`)
- Component-driven modular architecture:
  - Lexicon Catalog Grid (`LexiconGrid.jsx`) with virtual pagination, A-Z filter, CEFR filter, LTR CSS isolation (`direction: ltr; unicode-bidi: isolate`)
  - Dual Audio TTS (`audioService.js`) with Web Speech API primary and Google Translate TTS API stream fallback
  - AI Speech Evaluation (`speechEvaluation.js`) with `webkitSpeechRecognition` and string similarity scoring (0-100%)
  - Gemini AI Features (`geminiService.js`, `SentenceGenerator.jsx`, `Storyteller.jsx`, `PersonalTutor.jsx`)
  - Interactive Learning Tools: 3D SRS Flashcards (`Flashcards.jsx`), Quiz Game (`QuizGame.jsx`), Progress Analytics (`Analytics.jsx`)
  - CI/CD Deployment: Vite config base path, GitHub Actions workflow `.github/workflows/deploy.yml`, Git init, commit, `gh repo create oxford-3000-platform --public`

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Project Foundation & Layout Setup | Vite+React+Tailwind dark glassmorphic UI setup, main navigation, global state, layout | none | DONE |
| 2 | M2: Lexicon Dataset & Catalog Grid | Full Oxford 3000 dataset (A1-B2), LexiconGrid, virtual pagination, filters, LTR isolation CSS | M1 | DONE |
| 3 | M3: Dual Audio & AI Speech Engine | audioService (SpeechSynthesis + Google TTS stream fallback), speechEvaluation (webkitSpeechRecognition + score), tokens | M1 | IN_PROGRESS |
| 4 | M4: Gemini AI Services & Modules | geminiService (Gemini API + Instant Lexicon Fetcher), SentenceGenerator, Storyteller, PersonalTutor | M1, M2, M3 | PLANNED |
| 5 | M5: Flashcards, Quiz Game & Analytics | 3D SRS Flashcards, Quiz Game, Analytics Dashboard with CEFR breakdown | M1, M2 | PLANNED |
| 6 | M6: E2E Integration, Git & Deploy | Final app integration, npm run build verification in ./dist, deploy.yml workflow, git init, commit, gh repo push | M1-M5 | PLANNED |

## Interface Contracts

### `src/services/audioService.js`
- `playAudio(text, lang = 'en-US', speed = 0.9)` -> Promise<void>
- `stopAudio()` -> void

### `src/services/speechEvaluation.js`
- `startListening(onResult, onError)` -> void
- `stopListening()` -> void
- `evaluateSpeech(expectedText, spokenText)` -> { score: number, wordBreakdown: Array<{ word: string, match: boolean }> }

### `src/services/geminiService.js`
- `fetchMissingTerm(term, apiKey)` -> Promise<{ word, pos, cefr, arabic, example, ipa } | null>
- `generateSentence(word, length, position, style, apiKey)` -> Promise<string>
- `generateStory(words, genre, cefrLevel, apiKey)` -> Promise<Array<{ text: string, arabic: string }>>
- `getTutorResponse(roleplayScenario, userMessage, history, apiKey)` -> Promise<{ reply: string, grammarFeedback: string | null, arabic: string }>

## Code Layout
```
oxford-3000-platform/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── LexiconGrid.jsx
│   │   ├── SentenceGenerator.jsx
│   │   ├── Storyteller.jsx
│   │   ├── PersonalTutor.jsx
│   │   ├── Flashcards.jsx
│   │   ├── QuizGame.jsx
│   │   ├── Analytics.jsx
│   │   └── Navbar.jsx
│   ├── data/
│   │   └── oxford3000.js
│   ├── services/
│   │   ├── audioService.js
│   │   ├── speechEvaluation.js
│   │   └── geminiService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```
