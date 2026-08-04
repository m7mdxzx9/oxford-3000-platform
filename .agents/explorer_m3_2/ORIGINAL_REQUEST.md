## 2026-08-04T20:50:42Z
You are Explorer 2 for Milestone 3 (AI Speech Recognition Engine) of the Oxford 3000 CEFR Lexicon Application.
Your working directory is: c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m3_2\

Please analyze the codebase at c:\Users\HP\Downloads\English\oxford-3000-platform\ and design the implementation for `src/services/speechEvaluation.js`:
- Speech Recognition API: `webkitSpeechRecognition` / `SpeechRecognition` browser API wrapper with browser support check and mic permission error handling.
- Exported API interface:
  - `startListening(onResult, onError)` -> void
  - `stopListening()` -> void
  - `evaluateSpeech(expectedText, spokenText)` -> { score: number, wordBreakdown: Array<{ word: string, match: boolean }> }
- Accuracy Scoring Algorithm: Normalizes punctuation/casing, splits into words, computes word-level accuracy percentage (0%-100%) and provides word breakdown array (`{ word: string, match: boolean }`).
- Handle edge cases: microphone missing, browser unsupported, empty speech, noisy input.

Write your technical design and investigation report to `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m3_2\analysis.md` and complete a handoff report at `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m3_2\handoff.md`.
Message the orchestrator when done.
