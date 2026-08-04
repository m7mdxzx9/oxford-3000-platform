## 2026-08-04T23:43:54Z

You are Explorer 1 for Milestone 2 of the Oxford 3000 CEFR Lexicon Application.
Your working directory is: c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m2_1\

Please read:
- c:\Users\HP\Downloads\English\oxford-3000-platform\ORIGINAL_REQUEST.md
- c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\orchestrator\PROJECT.md

Investigate requirements and design the complete Oxford 3000 Lexicon Dataset module (`src/data/oxford3000.js` or `oxford3000Data.js`).
Design specifications:
1. Cover comprehensive A1, A2, B1, and B2 vocabulary entries.
2. Every item schema must have: `{ id, word, pos, cefr, arabic, example, ipa }`.
   - `id`: unique string/number
   - `word`: English word token
   - `pos`: part of speech ('noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | etc.)
   - `cefr`: 'A1' | 'A2' | 'B1' | 'B2'
   - `arabic`: accurate Arabic translation
   - `example`: natural example sentence using the word
   - `ipa`: IPA phonetic transcription (e.g. `/əˈbændən/`)
3. Provide dataset export structure, helper search/filter functions, and sample dataset array containing a rich representative set of entries across all CEFR levels.

Write your technical design report and dataset code specification to `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m2_1\handoff.md` and send a message back to parent.
