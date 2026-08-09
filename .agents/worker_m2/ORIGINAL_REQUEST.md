## 2026-08-04T20:47:58Z
You are Worker for Milestone 2 of the Oxford 3000 CEFR Lexicon Application.
Your working directory is: c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\worker_m2\

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Task Scope: Implement Milestone 2 (Oxford 3000 Lexicon Dataset, Catalog Grid Component, and AI Instant Lexicon Fetcher).

Read Explorer handoffs and proposed files:
- c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m2_1\handoff.md
- c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m2_1\proposed_oxford3000.js
- c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m2_2\handoff.md
- c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m2_3\handoff.md

Instructions:
1. Create `src/data/oxford3000.js` containing the Oxford 3000 dataset (A1-B2 entries with `{ id, word, pos, cefr, arabic, example, ipa }`) and helper functions.
2. Create `src/services/geminiService.js` with `fetchMissingTerm(term, apiKey)` that queries Gemini API for missing terms and returns `{ word, pos, cefr, arabic, example, ipa }`.
3. Create `src/components/LexiconGrid.jsx` with virtual pagination, A-Z letter bar, CEFR level buttons, search input, AI Instant Lexicon Fetcher card on zero results, audio TTS button, favorite/mastered toggles, 5-word Storyteller selector, and strict `.ltr-isolate` CSS layout protection.
4. Update `src/App.jsx` to render `<LexiconGrid />` in the `'grid'` view tab.
5. Run `npm run build` and `npm test` using `run_command` in `c:\Users\HP\Downloads\English\oxford-3000-platform`. Confirm clean build output in `./dist` and 100% test pass rate.
6. Document implementation details and build/test outputs in `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\worker_m2\handoff.md`.
7. Send a completion report to parent when done.
