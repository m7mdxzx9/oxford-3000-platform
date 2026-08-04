## 2026-08-04T20:55:34Z
<USER_REQUEST>
You are Explorer 3 for Milestone 3 (Sentence Word Tokens & Speech UI Integration) of the Oxford 3000 CEFR Lexicon Application.
Your working directory is: c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m3_3\

Please conduct a thorough exploration of the codebase at `c:\Users\HP\Downloads\English\oxford-3000-platform\` and produce a comprehensive technical design and investigation report.

Specifically, analyze and design:
1. **Interactive Word Tokens Component (`SentenceTokens.jsx` / `WordToken.jsx`)**:
   - Sentence string tokenization logic: splitting sentences into interactive word tokens while handling punctuation gracefully.
   - Strict LTR layout protection styling: `direction: ltr; unicode-bidi: isolate` to prevent layout corruption in RTL/mixed contexts.
   - Interactive behaviors: clicking a word plays TTS/audio pronunciation or selects the word for target practice. State management and callbacks (`onWordClick`, `onWordPractice`).

2. **Score Visualizer Component (`SpeechScoreVisualizer.jsx` / `ScoreBadge.jsx`)**:
   - Component architecture for sentence speech evaluation visualization.
   - Displaying overall sentence score and word-by-word evaluation breakdown.
   - Green ✓ badge tags for matched/correct words and Red ✗ badge tags for mismatched/incorrect words.
   - Color coding, accessibility, badge layout, score percentages, and phonetic/mispronunciation details.

3. **UI Integration Patterns**:
   - Deep dive into `src/components/LexiconGrid.jsx`, `src/components/Storyteller.jsx`, and `src/components/PersonalTutor.jsx` (and any related hooks/services in `src/`).
   - Define exact reusable UI patterns, prop contracts, state integration, and component hierarchies to embed `SentenceTokens` and `SpeechScoreVisualizer` into all three views:
     - `LexiconGrid.jsx`: interactive example sentences for lexicon entries.
     - `Storyteller.jsx`: interactive story text sentences with pronunciation feedback.
     - `PersonalTutor.jsx`: guided sentence practice with real-time speech scoring visualizer.

Write your complete analysis and technical design to:
`c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m3_3\analysis.md`

Write your complete handoff report to:
`c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m3_3\handoff.md`

Ensure both files are written with full detail, code snippets, file paths, props interfaces, CSS styling rules, and integration instructions. Report back when finished.
</USER_REQUEST>
