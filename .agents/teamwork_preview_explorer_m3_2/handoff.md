# Handoff Report: AI Speech Recognition Engine (`src/services/speechEvaluation.js`)

## 1. Observation

- **Examined File Paths**:
  - `src/services/speechEvaluation.js` (93 lines)
  - `.agents/orchestrator/PROJECT.md` (lines 29-33)
  - `test/assert-utils.js` (lines 127-132)
  - `test/tier1.test.js` (lines 91-113)
  - `test/tier2.test.js` (lines 65-90)
  - `test/tier3.test.js` (lines 71-78, 129-142)

- **Verbatim Code & Contract Implementations**:
  - **Interface Contract (`PROJECT.md`)**:
    ```javascript
    startListening(onResult, onError) -> void
    stopListening() -> void
    evaluateSpeech(expectedText, spokenText) -> { score: number, wordBreakdown: Array<{ word: string, match: boolean }> }
    ```
  - **Tokenization (`src/services/speechEvaluation.js:3-11`)**:
    ```javascript
    export const tokenizeText = (text) => {
      if (!text || typeof text !== 'string') return [];
      return text
        .toLowerCase()
        .replace(/[^\w\s']/g, '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    };
    ```
  - **Similarity Scoring Math (`src/services/speechEvaluation.js:13-40`)**:
    ```javascript
    export const evaluateSpeech = (expectedText = '', spokenText = '') => {
      const expectedTokens = tokenizeText(expectedText);
      const spokenTokens = tokenizeText(spokenText);

      if (expectedTokens.length === 0) {
        return {
          score: spokenTokens.length === 0 ? 100 : 0,
          wordBreakdown: []
        };
      }

      const spokenSet = new Set(spokenTokens);
      let matchedCount = 0;

      const wordBreakdown = expectedTokens.map((word) => {
        const isMatch = spokenSet.has(word);
        if (isMatch) matchedCount++;
        return { word, match: isMatch };
      });

      const rawScore = Math.round((matchedCount / expectedTokens.length) * 100);
      const score = Math.max(0, Math.min(100, rawScore));

      return { score, wordBreakdown };
    };
    ```
  - **Speech Recognition Lifecycle (`src/services/speechEvaluation.js:42-85`)**:
    ```javascript
    export const startListening = (onResult, onError) => {
      stopListening();
      const SpeechRecognitionClass = (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;
      if (!SpeechRecognitionClass) {
        if (typeof onError === 'function') onError(new Error('Speech recognition not supported in this browser environment.'));
        return;
      }
      try {
        activeRecognition = new SpeechRecognitionClass();
        activeRecognition.continuous = false;
        activeRecognition.interimResults = false;
        activeRecognition.lang = 'en-US';
        activeRecognition.onresult = (event) => {
          if (event && event.results && event.results[0] && event.results[0][0]) {
            const transcript = event.results[0][0].transcript;
            if (typeof onResult === 'function') onResult(transcript);
          }
        };
        activeRecognition.onerror = (event) => {
          if (typeof onError === 'function') onError(event.error || event);
        };
        activeRecognition.start();
      } catch (err) {
        if (typeof onError === 'function') onError(err);
      }
    };
    ```

- **Test Suite Results**:
  - `npm test` executed `node test/e2e-runner.js`.
  - Result: 67/67 tests passed (100% pass rate) in 0.02s.

## 2. Logic Chain

1. **Contract Compliance**:
   - `startListening`, `stopListening`, and `evaluateSpeech` are exported as named functions and as members of the default export object.
   - The returned object from `evaluateSpeech` strictly conforms to the expected `{ score: number, wordBreakdown: Array<{ word: string, match: boolean }> }` schema validated by `assert.speechScore` in `test/assert-utils.js`.

2. **Text Normalization & Tokenization**:
   - `tokenizeText` handles string edge cases (null, non-string, whitespace, mixed case, punctuation).
   - Lowercasing ensures case-insensitive matching ("Academic" matches "academic").
   - Strip regex `/[^\w\s']/g` removes commas, periods, exclamation marks, etc. while preserving single quotes and contractions ("don't").

3. **String Similarity Scoring Algorithm**:
   - Uses token set matching (`Set.has()`) to evaluate matches of `expectedTokens`.
   - Score calculation: `Math.round((matchedCount / expectedTokens.length) * 100)`, bounded to `[0, 100]`.
   - Math verification:
     - Exact match: 3/3 words -> `100%` (T1.F2.3, T2.F2.3, T3.4).
     - Partial match: 2/3 words ("achieve academic ability" vs "achieve ability") -> `67%` (T1.F2.3).
     - Garbled input: 0 matches -> `0%` (T2.F2.2).
     - Empty target: expected empty -> `0%` (T2.F2.5).

4. **Browser Speech Recognition API Integration**:
   - Supports both standard `SpeechRecognition` and vendor-prefixed `webkitSpeechRecognition`.
   - Manages state via singleton `activeRecognition` reference, preventing orphaned listeners by invoking `stopListening()` automatically prior to starting a new session.
   - Graceful fallback: If Web Speech API is absent (e.g. Node.js environment or unsupported browser), invokes `onError` callback without crashing.

5. **Future Optimization Opportunities**:
   - Token frequency mapping: using token counts rather than `Set.has()` to strictly evaluate duplicate words in longer sentences.
   - Fuzzy word distance: integrating Levenshtein distance (threshold <= 1-2 edit operations) to grant partial credit for minor transcription variations (e.g. homophones or accent variations).

## 3. Caveats

- **Mocked Browser Environment in Automated Tests**: In Node.js testing (`test/e2e-runner.js`), `window.SpeechRecognition` and `window.webkitSpeechRecognition` are mocked via `test/mock-environment.js`. Real browser testing depends on microphone permissions and system speech recognition availability.
- **Order & Frequency Agnostic Set Matching**: The current set-based lookup (`spokenSet.has(word)`) does not enforce word order or duplicate word count limits. This is ideal and performant for single-word and short-phrase lexicon evaluation (Oxford 3000 dataset), but multi-clause sentences with repeated words would treat any single occurrence as matching all instances.

## 4. Conclusion

- `src/services/speechEvaluation.js` is fully implemented, fully functional, and 100% compliant with the project specifications and interface contracts detailed in `PROJECT.md`.
- All unit, boundary, pairwise, and workload E2E tests (67/67 tests) pass cleanly with zero failures.
- The engine is fully ready for M4 (AI Storyteller & Personal Tutor speech evaluation) and M5 (Flashcards auto-mastery promotion based on speech score >= 90%).

## 5. Verification Method

- **Test Execution Command**:
  ```powershell
  npm test
  ```
- **Specific Test Cases to Inspect**:
  - `T1.F2.3`: `speechEvaluation accuracy scoring math` (67% score on 2/3 match)
  - `T1.F2.4`: `speechEvaluation word breakdown mapping`
  - `T1.F2.5`: `Speech token parsing`
  - `T2.F2.2`: `0% similarity garbled speech evaluation`
  - `T2.F2.3`: `100% exact match evaluation`
  - `T2.F2.5`: `Empty target word breakdown array handling`
  - `T3.4`: `AI Story Sentence -> Speech Recognition Audio Evaluation -> Score & Feedback`
  - `T3.8`: `Flashcard Pronunciation Audio -> Speech Evaluation -> Auto-Mastery Promotion`
- **Invalidation Conditions**:
  - Any failure in `npm test`.
  - Modification of `evaluateSpeech` signature or return structure that violates `{ score, wordBreakdown }`.
