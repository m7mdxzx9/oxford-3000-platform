## 2026-08-04T20:43:54Z
You are Explorer 2 for Milestone 2 of the Oxford 3000 CEFR Lexicon Application.
Your working directory is: c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m2_2\

Please read:
- c:\Users\HP\Downloads\English\oxford-3000-platform\ORIGINAL_REQUEST.md
- c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\orchestrator\PROJECT.md

Investigate requirements and design `src/components/LexiconGrid.jsx`.
Component Features:
1. Catalog Grid layout with virtual pagination (16-20 items/page, page controls, items count summary).
2. A-Z letter filter bar (ALL, A, B, C... Z).
3. CEFR level filter buttons (ALL, A1, A2, B1, B2) with colored badges.
4. Interactive search input with instant word/translation filtering.
5. Interactive Lexicon Cards:
   - Word, POS, CEFR badge, IPA phonetic, Arabic translation, example sentence.
   - Strict LTR CSS isolation (`.ltr-isolate`) on all English text tokens to prevent RTL layout scrambling.
   - Audio TTS play button (integrates with `audioService.js`).
   - Favorite star toggle and Mastered check toggle (integrates with `useApp()`).
   - Word selection checkbox for AI Storyteller (select up to 5 words max).

Write your technical design report and proposed component code to `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m2_2\handoff.md` and send a message back to parent.
