# Scope: E2E Testing Track

## Architecture
- Opaque-box, requirement-driven E2E test suite for Oxford 3000 CEFR Lexicon Application.
- Target entry points: `test/` directory runner (e.g. Vitest / Node test script `test/e2e-runner.js`), testing API contracts, HTML structure, audio streams, Gemini service wrappers, SRS flashcards, Quiz engine, analytics calculations, and Vite build output (`dist/index.html`).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Tier 1: Feature Coverage | >= 5 tests per feature (F1-F5, total >= 25) happy-path verification | none | DONE |
| 2 | Tier 2: Boundary & Corner Cases | >= 5 tests per feature (F1-F5, total >= 25) limit/error cases | Tier 1 | DONE |
| 3 | Tier 3: Cross-Feature Combinations | Pairwise feature interaction tests (total >= 10) | Tier 2 | DONE |
| 4 | Tier 4: Real-World Scenarios | 5 E2E learning workflows | Tier 3 | DONE |
| 5 | Test Suite Execution & Output | Run runner, verify 100% pass, generate TEST_READY.md | Tier 1-4 | DONE |

## Interface Contracts
- Node / Vitest runner executable via `npm test` or `node test/e2e-runner.js`
- Standard exit code 0 on all tests passing, non-zero on failure.
- Output report format in `TEST_READY.md`.
