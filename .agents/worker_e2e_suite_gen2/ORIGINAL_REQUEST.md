## 2026-08-04T20:33:25Z
<USER_REQUEST>
You are worker_e2e_suite_gen2, the E2E Testing Worker (generation 2 replacement) for Oxford 3000 CEFR Lexicon Application.
Your working directory for metadata/progress is: c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\worker_e2e_suite_gen2\
The project root directory is: c:\Users\HP\Downloads\English\oxford-3000-platform\

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your objective:
Build the complete 4-tier E2E opaque-box test suite for the Oxford 3000 CEFR Lexicon Application in `test/`, run the tests, verify 100% pass rate, publish `c:\Users\HP\Downloads\English\oxford-3000-platform\TEST_READY.md`, and report completion.

Read for guidance:
- `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\orchestrator\PROJECT.md`
- `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\orchestrator\TEST_INFRA.md`
- `c:\Users\HP\Downloads\English\oxford-3000-platform\ORIGINAL_REQUEST.md`

Requirements for the Test Suite:
1. `test/tier1.test.js`: Feature Coverage happy paths (>= 5 tests per feature for F1, F2, F3, F4, F5 -> Total >= 25 tests)
   - F1: Lexicon data specs (A1-B2, Arabic, IPA, example), pagination math, A-Z filter, CEFR filter, LTR CSS isolation specs.
   - F2: `audioService` Web Speech API params, Google TTS stream URL format, `speechEvaluation` accuracy scoring math, word breakdown mapping, token parsing.
   - F3: `geminiService` schema validation, sentence generator length/anchor constraints, storyteller line format, tutor roleplay grammar feedback format, API key header formatting.
   - F4: Flashcards 3D flip/mastery/favorite state logic, Quiz 4-choice math & scoring, Analytics CEFR breakdown percentage calculations.
   - F5: `package.json` build/test script definitions, `vite.config.js` base path config, `.github/workflows/deploy.yml` CI specs, HTML static entry structure, static asset dist structure.

2. `test/tier2.test.js`: Boundary & Corner Cases (>= 5 tests per feature for F1, F2, F3, F4, F5 -> Total >= 25 tests)
   - F1: Empty search query result, invalid CEFR parameter query, page 1 and max page boundary limits, extreme length search term, LTR override enforcement.
   - F2: Empty/whitespace text audio playback, 0% similarity garbled speech evaluation, 100% exact match evaluation, missing Web Speech API fallback, empty word breakdown array.
   - F3: Missing/empty Gemini API key fallback, maximum length prompt limits, empty word list story generation prompt, special characters in AI prompt, malformed AI JSON fallback.
   - F4: Analytics with 0 total mastered words, analytics with 100% mastered words, quiz retry score reset state, flashcard empty favorite list filtering, rapid state flip concurrency.
   - F5: Base path trailing slash normalization, build output dist path verification, environment variable default fallbacks, asset script/link path integrity, index.html viewport & title tag compliance.

3. `test/tier3.test.js`: Cross-Feature Pairwise Combinations (Total >= 10 tests)
   - F1+F2, F1+F3, F2+F3, F3+F4, F1+F4, F2+F4, F3+F5, F1+F5, F2+F5, F4+F5.

4. `test/tier4.test.js`: Real-World Application Workload Scenarios (Total >= 5 tests)
   - Scenario 1: Full Lexicon Browse & AI Sentence Practice Workflow.
   - Scenario 2: Interactive Storytelling with Pronunciation Evaluation Workflow.
   - Scenario 3: AI Roleplay Tutor Session with Real-time Grammar Feedback Workflow.
   - Scenario 4: Vocabulary Mastery Loop (Flashcards -> Quiz -> Analytics Dashboard Workflow).
   - Scenario 5: Dynamic Lexicon Expansion via Gemini Fetcher & Progress Sync.

5. `test/e2e-runner.js`: Master test runner script.
   - Executes all tier tests programmatically.
   - Measures timing and pass/fail counts.
   - Displays clear console test reports.
   - Exits with status 0 if all tests pass.

6. `package.json`:
   - Create or update `package.json` at project root with `"scripts": { "test": "node test/e2e-runner.js" }`.

7. Run `node test/e2e-runner.js` via `run_command` and verify output.

8. Publish `c:\Users\HP\Downloads\English\oxford-3000-platform\TEST_READY.md`:
   - Full test inventory table, run command (`npm test` / `node test/e2e-runner.js`), tier counts breakdown (Tier 1: 25+, Tier 2: 25+, Tier 3: 10+, Tier 4: 5+, Total: 65+), pass/fail status.

9. Write `handoff.md` in `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\worker_e2e_suite_gen2\handoff.md` and message sub-orchestrator.
</USER_REQUEST>
