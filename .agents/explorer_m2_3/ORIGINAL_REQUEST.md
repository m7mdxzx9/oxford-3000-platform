## 2026-08-04T20:43:54Z
You are Explorer 3 for Milestone 2 of the Oxford 3000 CEFR Lexicon Application.
Your working directory is: c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m2_3\

Please read:
- c:\Users\HP\Downloads\English\oxford-3000-platform\ORIGINAL_REQUEST.md
- c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\orchestrator\PROJECT.md

Investigate requirements and design the AI Instant Lexicon Fetcher feature.
Design Specs:
1. `src/services/geminiService.js` function `fetchMissingTerm(term, apiKey)`:
   - Queries Gemini API endpoint when a user searches for an uncatalogued word.
   - Structured JSON response: `{ word, pos, cefr, arabic, example, ipa }`.
2. UI Integration in `LexiconGrid.jsx`:
   - When search query returns zero local dataset matches, show an "AI Instant Lexicon Fetcher" card/button: "Fetch '[term]' with Gemini AI".
   - Shows loading spinner during fetch, appends newly fetched term live to global `customWords` in `AppContext`, updates local storage, and toasts confirmation.

Write your technical design report and service/UI code specifications to `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m2_3\handoff.md` and send a message back to parent.
