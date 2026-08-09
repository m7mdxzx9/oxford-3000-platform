# E2E Test Infra: Oxford 3000 CEFR Lexicon Application

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|---------------------|:------:|:------:|:------:|:------:|
| 1 | Oxford 3000 Lexicon & Grid | R1 | 5 | 5 | ✓ | ✓ |
| 2 | Dual-Engine Audio & Speech Eval | R2 | 5 | 5 | ✓ | ✓ |
| 3 | Gemini AI Generator/Story/Tutor | R3 | 5 | 5 | ✓ | ✓ |
| 4 | SRS Flashcards, Quiz & Analytics | R4 | 5 | 5 | ✓ | ✓ |
| 5 | Build & GitHub Deployment Workflow | R5 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- Test runner: Vitest / Playwright / Node test runner or synthetic test suite scripts
- Output signal: `TEST_READY.md` containing test inventory, run command, and Tier 1-4 coverage breakdown.
- Entry points: Vite build output (`./dist`), index.html, JS service module exports, component integration points.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full Lexicon Browse & AI Sentence Practice | F1, F2, F3 | Medium |
| 2 | Interactive Storytelling with Speech Pronunciation | F1, F2, F3 | High |
| 3 | Roleplay Tutoring with Real-time Grammar Feedback | F2, F3 | High |
| 4 | Vocabulary Mastery Loop (Flashcards -> Quiz -> Analytics) | F1, F4 | Medium |
| 5 | Instant Missing Term Fetching & Dynamic State Append | F1, F3, F4 | Medium |

## Coverage Thresholds
- Tier 1: >= 5 per feature (Total >= 25)
- Tier 2: >= 5 per feature (Total >= 25)
- Tier 3: Pairwise feature combinations (Total >= 10)
- Tier 4: Real-world scenarios (Total >= 5)
- **Target Total Minimum**: 65 test cases
