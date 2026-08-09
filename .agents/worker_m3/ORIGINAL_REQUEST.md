## 2026-08-04T20:57:38Z
You are the Worker subagent for Milestone 3 (Dual Audio TTS, Speech Recognition Engine, Word Tokens & Score Visualizer) of the Oxford 3000 CEFR Lexicon Application.

Your working directory is: c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\worker_m3\
Project root directory: c:\Users\HP\Downloads\English\oxford-3000-platform\

Please read the design specifications created by the 3 Explorers:
- c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m3_1\analysis.md
- c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m3_2\analysis.md
- c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m3_3\analysis.md

Implement the following:

1. `src/services/audioService.js`:
   - Dual Audio TTS: Primary Web Speech API (`window.speechSynthesis`, `SpeechSynthesisUtterance`) with speed control (0.6x slow / 0.9x normal), voice selection matching, fallback to Google Translate TTS API stream (`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`) via HTML5 Audio element.
   - Preemption handling in `stopAudio()`, Promise resolution when playback ends or errors, state tracking `isPlaying`.
   - Required Exports: `playAudio(text, lang = 'en-US', speed = 0.9)`, `stopAudio()`, `isAudioPlaying()`, `buildGoogleTtsUrl(text, lang = 'en-US')`, and default export object.

2. `src/services/speechEvaluation.js`:
   - Speech Recognition API wrapper using `webkitSpeechRecognition` / `SpeechRecognition`.
   - Required Exports: `startListening(onResult, onError)`, `stopListening()`, `evaluateSpeech(expectedText, spokenText)`, `tokenizeText(text)`, `isSpeechRecognitionSupported()`, and default export object.
   - `evaluateSpeech` returns `{ score: number, wordBreakdown: Array<{ word: string, match: boolean }> }` with accurate string similarity scoring, punctuation normalization (preserving internal apostrophes like "don't"), frequency count matching for duplicate target words, and hardware/permission error code handling.

3. UI Components:
   - `src/components/SentenceTokenViewer.jsx`:
     Splits sentences into interactive clickable word tokens with strict LTR CSS isolation (`direction: ltr; unicode-bidi: isolate`).
     Props: `sentence`, `targetWords`, `evaluationResult`, `activeWordIndex`, `onWordClick`, `onWordPractice`, `className`.
     Renders interactive clickable word pills, punctuation separation, target word highlighting (cyan), match/mismatch evaluation status highlighting (emerald green ✓ / rose red ✗), and active playing pulse. (You may also create helper sub-components like `WordToken.jsx` or `SentenceTokens.jsx` if helpful, but `SentenceTokenViewer.jsx` must be exported and usable).
   - `src/components/SpeechScoreVisualizer.jsx`:
     Visualizes accuracy score (0-100%) with score meter badge, status label (Green for >=90%, Teal for 70-89%, Amber/Rose for <70%), Green ✓ (match) and Red ✗ (mismatch) badges, recognized spoken transcript display, mispronounced words practice list, and retry trigger (`onRetry`). (You may also create helper `ScoreBadge.jsx` if helpful).

4. Component Integration:
   - Update `src/components/LexiconGrid.jsx` example sentences to use `SentenceTokenViewer` and provide audio/speech evaluation controls and speed options (0.6x / 0.9x).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

5. Verification:
   - Run `node test/e2e-runner.js` (or `npm test`) using `run_command` in `c:\Users\HP\Downloads\English\oxford-3000-platform\`.
   - Run `npm run build` using `run_command` in `c:\Users\HP\Downloads\English\oxford-3000-platform\`.
   - Ensure ALL tests pass 100% and build completes without errors.

6. Reports:
   - Write implementation report to `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\worker_m3\report.md`
   - Write handoff report to `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\worker_m3\handoff.md`

When done, send a message back with the test results, build results, and summary of changes.
