# Scope: E2E Testing Track — Oxford 3000 CEFR Lexicon Application

## Architecture & Test Philosophy
- Opaque-box, requirement-driven E2E test suite.
- Validates export interfaces, contract specs, module behavior, DOM structures, state flows, error handling, edge cases, and Vite build output (`./dist`).
- Modular test structure in `test/`:
  - `test/e2e-runner.js`: Central test runner executing all tier test suites with summary reports and exit codes.
  - `test/tier1.test.js`: Tier 1 Feature Coverage (>= 25 tests)
  - `test/tier2.test.js`: Tier 2 Boundary & Edge Cases (>= 25 tests)
  - `test/tier3.test.js`: Tier 3 Pairwise Cross-Feature Combinations (>= 10 tests)
  - `test/tier4.test.js`: Tier 4 Real-World Application Workload Scenarios (>= 5 tests)

## Milestones & Status
| # | Name | Scope | Target | Status |
|---|------|-------|--------|--------|
| 1 | M-E2E-1 | Test Suite Infra & Tier 1 (Feature Coverage) | 25+ tests | DONE |
| 2 | M-E2E-2 | Tier 2 (Boundary & Corner Cases) | 25+ tests | DONE |
| 3 | M-E2E-3 | Tier 3 (Cross-Feature Combinations) | 10+ tests | DONE |
| 4 | M-E2E-4 | Tier 4 (Real-World Scenarios) | 5+ tests | DONE |
| 5 | M-E2E-5 | Runner Verification & TEST_READY.md Publication | TEST_READY.md | DONE |

## Detailed Feature Test Inventory Plan

### Feature 1: Oxford 3000 Lexicon & Catalog Grid (F1)
- Tier 1: Lexicon data structure validity (A1-B2, Arabic, IPA, example), grid pagination size (16-20), letter filtering, CEFR level filtering, LTR isolation CSS style compliance.
- Tier 2: Empty filter results, missing term fallback, invalid CEFR queries, upper/lowercase filter tolerance, pagination boundary limits (page 1 to last page).

### Feature 2: Dual Audio TTS & AI Speech Evaluation (F2)
- Tier 1: `audioService` Web Speech API play, speed parameter (0.6x/0.9x), fallback stream URL generator, `speechEvaluation` accuracy score calculation, word match breakdown structure.
- Tier 2: Empty/whitespace text audio play, silent/garbled speech score calculation (0%), perfect pronunciation score (100%), non-English speech input handling, missing Web Speech API browser fallback.

### Feature 3: Gemini AI Features (F3)
- Tier 1: `fetchMissingTerm` schema validation, `generateSentence` length (Short/Med/Long) and position anchor, `generateStory` line-by-line output format, `getTutorResponse` roleplay scenario response & grammar feedback interface.
- Tier 2: Missing API key handling, max length prompt generation, empty word list story prompt, special character inputs, malformed API response fallback.

### Feature 4: SRS Flashcards, Quiz & Analytics (F4)
- Tier 1: Flashcard 3D flip state toggle, mastery state toggle, favorite toggle, Quiz 4-choice question generator & score tracking, Analytics CEFR percentage breakdown calculations.
- Tier 2: Zero mastered words state analytics, 100% mastered state analytics, quiz retry with 0 score, flashcards empty list filtering, rapid flip state toggle concurrency.

### Feature 5: Build Output & GitHub Deployment (F5)
- Tier 1: `package.json` setup & scripts, `vite.config.js` base path verification, `.github/workflows/deploy.yml` CI syntax & push trigger, static build bundle entry check (`dist/index.html`).
- Tier 2: Base path trailing slash normalization, missing build directory verification, environment variable injection edge cases, asset script tag link validation in HTML.

### Tier 3: Cross-Feature Pairwise Combinations
- F1 + F2: Filtered lexicon item audio playback & speech evaluation.
- F1 + F3: Dynamically fetched missing term appended to Lexicon Grid & Gemini Sentence Generator.
- F2 + F3: AI Generated Story line-by-line audio play & speech recognition score breakdown.
- F3 + F4: AI Personal Tutor session vocabulary added to Flashcards & Analytics.
- F1 + F4: Catalog grid mastered term status synced with Quiz Game pool and Analytics dashboard.
- F2 + F4: Flashcard audio pronunciation button trigger and score tracking.
- F3 + F5: Gemini API key environment injection in build workflow.
- F1 + F5: Lexicon data bundle optimization in Vite static build assets.
- F2 + F5: Web Speech API & TTS audio asset bundling in deployment package.
- F4 + F5: LocalStorage analytics persistence across build deployment reloads.

### Tier 4: Real-World Learning Scenarios
- Scenario 1: Full Lexicon Browse & AI Sentence Practice Workflow.
- Scenario 2: Interactive Storytelling with Pronunciation Evaluation Workflow.
- Scenario 3: AI Roleplay Tutor Session with Real-time Grammar Feedback Workflow.
- Scenario 4: Vocabulary Mastery Loop (Flashcards -> Quiz -> Analytics Dashboard Workflow).
- Scenario 5: Dynamic Lexicon Expansion via Gemini Instant Fetcher & Analytics Tracking.
