# Handoff Report: Explorer 1 — E2E Test Specification & Architecture Analysis

## 1. Observation

Direct inspection of `c:\Users\HP\Downloads\English\oxford-3000-platform\` and workspace files yields the following exact observations:

### 1.1 Project Structure & File Locations
- **`package.json`** (`c:\Users\HP\Downloads\English\oxford-3000-platform\package.json`):
  - Type: `"type": "module"`
  - Core Dependencies: `react` (^18.2.0), `react-dom` (^18.2.0), `clsx` (^2.1.0), `lucide-react` (^0.344.0), `tailwind-merge` (^2.2.1).
  - DevDependencies: `@vitejs/plugin-react` (^4.2.1), `vite` (^5.1.6), `tailwindcss` (^3.4.1), `postcss` (^8.4.35), `autoprefixer` (^10.4.18).
  - Scripts: `"dev": "vite"`, `"build": "vite build"`, `"preview": "vite preview"`.
- **`vite.config.js`** (`c:\Users\HP\Downloads\English\oxford-3000-platform\vite.config.js`):
  - Configures `base: './'` for relative asset links.
  - Target output directory: `dist`.
  - Development server port: `3000`.
- **`index.html`** (`c:\Users\HP\Downloads\English\oxford-3000-platform\index.html`):
  - Document root: `<div id="root"></div>`.
  - Glassmorphic dark theme background: `<body class="bg-[#060d21] text-slate-100 min-h-screen ...">`.
  - Module entry point: `<script type="module" src="/src/main.jsx"></script>`.
- **`src/context/AppContext.jsx`** (`c:\Users\HP\Downloads\English\oxford-3000-platform\src\context\AppContext.jsx`):
  - State management for active tab (`grid`, `sentence`, `story`, `tutor`, `flashcards`, `quiz`, `analytics`).
  - LocalStorage keys: `oxford3000_favorites`, `oxford3000_mastered`, `oxford3000_gemini_api_key`, `oxford3000_custom_words`.
  - State helpers: `toggleFavorite`, `isFavorite`, `toggleMastered`, `isMastered`, `toggleSelectWord` (max limit 5), `clearSelectedWords`, `addCustomWord`, `setApiKey`, `addNotification`, `removeNotification`.
- **`src/components/Navbar.jsx`** (`c:\Users\HP\Downloads\English\oxford-3000-platform\src\components\Navbar.jsx`):
  - Navigation bar with tab switching, counters for `selectedWordsCount` (0-5), `favoritesCount`, `masteredCount`, and API Key modal trigger button.
- **`src/components/ApiKeyModal.jsx`** (`c:\Users\HP\Downloads\English\oxford-3000-platform\src\components\ApiKeyModal.jsx`):
  - Modal form for setting or clearing custom Gemini API key stored in LocalStorage.
- **`src/components/ToastNotifications.jsx`** (`c:\Users\HP\Downloads\English\oxford-3000-platform\src\components\ToastNotifications.jsx`):
  - Floating toast stack rendered in fixed bottom-right container (`fixed bottom-5 right-5 z-50`).

### 1.2 Planned Feature Modules & Contracts (`PROJECT.md` & `TEST_INFRA.md`)
- **Lexicon Dataset (`src/data/oxford3000.js`)**:
  - Exports array of Oxford 3000 lexicon entries matching schema: `{ word: string, pos: string, cefr: 'A1'|'A2'|'B1'|'B2', arabic: string, example: string, ipa: string }`.
- **Audio Service (`src/services/audioService.js`)**:
  - `playAudio(text, lang = 'en-US', speed = 0.9)` -> `Promise<void>` (Primary: `window.speechSynthesis`, Fallback: Google Translate TTS stream `https://translate.google.com/translate_tts`).
  - `stopAudio()` -> `void`.
- **Speech Evaluation Service (`src/services/speechEvaluation.js`)**:
  - `startListening(onResult, onError)` -> `void` (uses `window.webkitSpeechRecognition`).
  - `stopListening()` -> `void`.
  - `evaluateSpeech(expectedText, spokenText)` -> `{ score: number, wordBreakdown: Array<{ word: string, match: boolean }> }`.
- **Gemini AI Service (`src/services/geminiService.js`)**:
  - `fetchMissingTerm(term, apiKey)` -> `Promise<{ word, pos, cefr, arabic, example, ipa } | null>`.
  - `generateSentence(word, length, position, style, apiKey)` -> `Promise<string>`.
  - `generateStory(words, genre, cefrLevel, apiKey)` -> `Promise<Array<{ text: string, arabic: string }>>`.
  - `getTutorResponse(roleplayScenario, userMessage, history, apiKey)` -> `Promise<{ reply: string, grammarFeedback: string | null, arabic: string }>`.
- **UI Components (`src/components/`)**:
  - `LexiconGrid.jsx`: Virtual pagination, A-Z letter filter, CEFR filter, search box, LTR CSS isolation (`direction: ltr; unicode-bidi: isolate`).
  - `SentenceGenerator.jsx`: Length / position controls and AI sentence display.
  - `Storyteller.jsx`: Selected words (max 5) AI story generator with sentence-level TTS & pronunciation feedback.
  - `PersonalTutor.jsx`: Interactive roleplay chat interface with grammar correction cards.
  - `Flashcards.jsx`: 3D SRS flip card component with mastery toggle.
  - `QuizGame.jsx`: 4-option multiple choice practice quiz generator.
  - `Analytics.jsx`: Mastery breakdown metrics and CEFR level completion percentages.

---

## 2. Logic Chain

1. **Framework Analysis & Test Setup Options**:
   - **Option A: Pure Node.js Test Runner (`test/e2e-runner.js`)**:
     - *Pros*: Zero external dependencies, executes instantly in offline environments, produces clean JSON logs (`test-results.json`), returns exit code `0`/`1` for CI integration.
     - *Cons*: Requires custom DOM & browser API polyfills (`window`, `localStorage`, `SpeechSynthesis`, `webkitSpeechRecognition`, `fetch`).
   - **Option B: Vitest Runner (`vitest run`)**:
     - *Pros*: Built on Vite pipeline, native ES module support, rich assertion library (`expect`), seamless JS/JSX component testing with `happy-dom` or `jsdom`.
     - *Cons*: Requires installing `vitest` and `happy-dom` into `devDependencies`.
   - **Decision**: Hybrid dual-compatible architecture. The test suite is designed using standard `describe` / `it` blocks that can be executed directly via Node (`node test/e2e-runner.js`) with custom polyfills, as well as imported into Vitest seamlessly.

2. **Browser API Mocking Strategy**:
   - **Web Speech API (`speechSynthesis`)**: Mock `window.speechSynthesis` object with `speak`, `cancel`, `getVoices`, and `SpeechSynthesisUtterance`. In tests, `speak(utterance)` triggers `onstart()` asynchronously (via `setTimeout(..., 10)`) followed by `onend()`.
   - **Speech Recognition (`webkitSpeechRecognition`)**: Mock constructor class providing `start()`, `stop()`, `abort()`, `onstart`, `onresult`, `onend`, `onerror`. When `start()` is invoked, mock emits a synthetic event: `{ results: [[{ transcript: 'spoken text', confidence: 0.95 }]] }`.
   - **HTTP Fetch Interceptor (`window.fetch`)**: Intercept requests matching `generativelanguage.googleapis.com` to return valid JSON candidates for Gemini endpoints, and requests matching `translate.google.com/translate_tts` to return valid audio blob/arrayBuffer streams.
   - **LocalStorage Mock (`window.localStorage`)**: Polyfill in-memory Map backing `getItem`, `setItem`, `removeItem`, `clear`, and `length`.

3. **Test Partitioning & Coverage Thresholds**:
   - **Tier 1 (Feature Coverage / Happy Path)**: Must cover 5 core features with at least 5 happy-path tests per feature (Total >= 25 tests). Focuses on standard user flows, valid inputs, correct contract returns, standard UI state changes, and normal build outputs.
   - **Tier 2 (Boundary & Corner Cases)**: Must cover 5 core features with at least 5 boundary/corner tests per feature (Total >= 25 tests). Focuses on edge case inputs (empty strings, special chars, out-of-range pages, zero mastered words, 100% mastered state, missing API keys, network errors, malformed JSON, concurrent state toggles).

---

## 3. Caveats

- **DOM Emulation Scope**: Mock environments emulate DOM elements and attributes (`dir="ltr"`, class lists, event handlers) for logic and contract testing. Full visual pixel layout rendering or CSS painting requires headless browser integration (e.g. Playwright / Puppeteer).
- **Network Isolation**: All tests run strictly offline. Remote endpoints (`generativelanguage.googleapis.com`, `translate.google.com`) must be intercepted by local mock functions.
- **Async Synchronization**: Speech events and Gemini API promises resolve asynchronously. Tests must use `await` or promise delays to ensure assertions execute after state transitions complete.

---

## 4. Conclusion & Complete E2E Test Specification

Below is the complete 50-test design specification covering **Tier 1 (25 Happy-Path Tests)** and **Tier 2 (25 Boundary & Corner Cases)**.

---

### Tier 1: Feature Coverage (Happy-Path Tests — 25 Total)

#### Feature 1: Oxford 3000 Lexicon Dataset & Catalog Grid (F1)
- **F1-T1-01: Dataset Schema & Export Integrity**
  - **Module**: `src/data/oxford3000.js`
  - **Input**: Import default export `oxford3000`.
  - **Expected Output**: Array containing entries. Every item satisfies schema `{ word: string, pos: string, cefr: 'A1'|'A2'|'B1'|'B2', arabic: string, example: string, ipa: string }`.
  - **Assertion**: `assert.ok(oxford3000.length >= 100)`; `assert.lexiconEntry(item)`.
- **F1-T1-02: CEFR Level Filtering (A1, A2, B1, B2)**
  - **Module**: `src/data/oxford3000.js` / `src/components/LexiconGrid.jsx`
  - **Input**: Filter dataset where `entry.cefr === 'B1'`.
  - **Expected Output**: Non-empty array where 100% of items have `cefr === 'B1'`.
  - **Assertion**: `assert.ok(b1Items.every(w => w.cefr === 'B1'))`.
- **F1-T1-03: Alphabetical A-Z Letter Filter**
  - **Module**: `src/data/oxford3000.js` / `src/components/LexiconGrid.jsx`
  - **Input**: Filter dataset by initial character `'C'` (case-insensitive).
  - **Expected Output**: Returns items starting with `'c'` or `'C'`.
  - **Assertion**: `assert.ok(cItems.every(w => w.word.toLowerCase().startsWith('c')))`.
- **F1-T1-04: Lexicon Grid Virtual Pagination Calculation**
  - **Module**: `src/components/LexiconGrid.jsx`
  - **Input**: Total words = 100, page size = 20, active page = 1.
  - **Expected Output**: Slice indices `0` to `20`, total pages = `5`.
  - **Assertion**: `assert.strictEqual(visibleWords.length, 20)`; `assert.strictEqual(totalPages, 5)`.
- **F1-T1-05: LTR CSS Isolation Rules**
  - **Module**: `src/components/LexiconGrid.jsx` / `src/index.css`
  - **Input**: Inspect English word container styling and DOM attributes.
  - **Expected Output**: Elements displaying English text have `dir="ltr"` or CSS rule `direction: ltr; unicode-bidi: isolate;`.
  - **Assertion**: `assert.ltrIsolation(cssContent)`.

#### Feature 2: Dual Audio TTS & AI Speech Evaluation (F2)
- **F2-T1-01: Primary Audio Playback via Web Speech API**
  - **Module**: `src/services/audioService.js`
  - **Input**: `playAudio('apple', 'en-US', 0.9)`.
  - **Mock Strategy**: Mock `window.speechSynthesis.speak`.
  - **Expected Output**: Instantiates `SpeechSynthesisUtterance`, sets `rate = 0.9`, invokes `speechSynthesis.speak()`.
  - **Assertion**: `assert.ok(mockSynthesis.speaking)`.
- **F2-T1-02: Speech Synthesis Playback Speed Adjustment**
  - **Module**: `src/services/audioService.js`
  - **Input**: `playAudio('challenge', 'en-US', 0.6)` vs `playAudio('challenge', 'en-US', 0.9)`.
  - **Expected Output**: `utterance.rate` strictly equals `0.6` and `0.9` respectively.
  - **Assertion**: `assert.strictEqual(lastUtterance.rate, 0.6)`.
- **F2-T1-03: Secondary Audio Fallback Stream Request**
  - **Module**: `src/services/audioService.js`
  - **Input**: `playAudio('resilient')` when `window.speechSynthesis` is unavailable (`null`).
  - **Mock Strategy**: Intercept `fetch` for `translate.google.com/translate_tts?ie=UTF-8&q=resilient&tl=en`.
  - **Expected Output**: Triggers HTTP GET request to stream URL, returns audio buffer.
  - **Assertion**: `assert.ok(fetchCalledWithGoogleTTS)`.
- **F2-T1-04: Speech Recognition Initialization & Result Listener**
  - **Module**: `src/services/speechEvaluation.js`
  - **Input**: `startListening(onResult, onError)`.
  - **Mock Strategy**: Instantiate `MockSpeechRecognition`, fire `onresult` event with transcript `'resilient'`.
  - **Expected Output**: Callback `onResult` receives transcript object with `'resilient'`.
  - **Assertion**: `assert.strictEqual(resultTranscript, 'resilient')`.
- **F2-T1-05: Speech Pronunciation Similarity Evaluation (Exact Match)**
  - **Module**: `src/services/speechEvaluation.js`
  - **Input**: `evaluateSpeech('the quick brown fox', 'the quick brown fox')`.
  - **Expected Output**: `{ score: 100, wordBreakdown: [{ word: 'the', match: true }, ...] }`.
  - **Assertion**: `assert.strictEqual(res.score, 100)`; `assert.ok(res.wordBreakdown.every(w => w.match))`.

#### Feature 3: Gemini AI Services (F3)
- **F3-T1-01: Instant Missing Term Fetcher (`fetchMissingTerm`)**
  - **Module**: `src/services/geminiService.js`
  - **Input**: `fetchMissingTerm('elated', 'TEST_API_KEY')`.
  - **Mock Strategy**: Intercept `fetch` targeting `generativelanguage.googleapis.com`. Return valid JSON matching schema.
  - **Expected Output**: `{ word: 'elated', pos: 'adjective', cefr: 'B2', arabic: 'سعيد جدًا', example: 'She was elated by the news.', ipa: '/ɪˈleɪ.tɪd/' }`.
  - **Assertion**: `assert.lexiconEntry(res)`.
- **F3-T1-02: AI Sentence Generation (`generateSentence`)**
  - **Module**: `src/services/geminiService.js`
  - **Input**: `generateSentence('abandon', 'medium', 'middle', 'academic', 'TEST_KEY')`.
  - **Mock Strategy**: Return mock string `"The team had to abandon the experiment."`.
  - **Expected Output**: Returns sentence containing word `'abandon'`.
  - **Assertion**: `assert.includes(sentence.toLowerCase(), 'abandon')`.
- **F3-T1-03: AI Storytelling Generator (`generateStory`)**
  - **Module**: `src/services/geminiService.js`
  - **Input**: `generateStory(['achieve', 'benefit'], 'adventure', 'B1', 'TEST_KEY')`.
  - **Mock Strategy**: Return JSON array of lines `[{ text: '...', arabic: '...' }]`.
  - **Expected Output**: Returns array of story objects with `text` and `arabic` fields.
  - **Assertion**: `assert.ok(Array.isArray(story))`; `assert.ok(story[0].text && story[0].arabic)`.
- **F3-T1-04: AI Personal Tutor Chat & Grammar Feedback (`getTutorResponse`)**
  - **Module**: `src/services/geminiService.js`
  - **Input**: `getTutorResponse('Job Interview', 'I has five years experience', [], 'TEST_KEY')`.
  - **Mock Strategy**: Return `{ reply: 'Great experience!', grammarFeedback: 'Use "I have" instead of "I has".', arabic: '...' }`.
  - **Expected Output**: Response object containing non-null `grammarFeedback`.
  - **Assertion**: `assert.ok(res.grammarFeedback.includes('I have'))`.
- **F3-T1-05: API Key Modal Integration & LocalStorage Sync**
  - **Module**: `src/context/AppContext.jsx` / `src/components/ApiKeyModal.jsx`
  - **Input**: Invoke `setApiKey('AIzaSy_CUSTOM_KEY_123')`.
  - **Expected Output**: `localStorage.getItem('oxford3000_gemini_api_key')` equals `'AIzaSy_CUSTOM_KEY_123'`.
  - **Assertion**: `assert.strictEqual(localStorage.getItem('oxford3000_gemini_api_key'), 'AIzaSy_CUSTOM_KEY_123')`.

#### Feature 4: SRS Flashcards, Quiz Game & Analytics (F4)
- **F4-T1-01: Flashcard 3D Flip State Toggle**
  - **Module**: `src/components/Flashcards.jsx`
  - **Input**: Trigger card click event on active flashcard.
  - **Expected Output**: Toggles `isFlipped` state from `false` to `true`.
  - **Assertion**: `assert.strictEqual(cardState.isFlipped, true)`.
- **F4-T1-02: Word Mastery Toggle Sync**
  - **Module**: `src/context/AppContext.jsx`
  - **Input**: `toggleMastered('abandon')`.
  - **Expected Output**: Adds `'abandon'` to `mastered` state array; updates `masteredCount` to `1`.
  - **Assertion**: `assert.ok(mastered.includes('abandon'))`; `assert.strictEqual(masteredCount, 1)`.
- **F4-T1-03: Favorite Words Toggle & Limitless Collection**
  - **Module**: `src/context/AppContext.jsx`
  - **Input**: `toggleFavorite('ability')`.
  - **Expected Output**: Adds `'ability'` to `favorites` array; updates `favoritesCount`.
  - **Assertion**: `assert.ok(isFavorite('ability'))`.
- **F4-T1-04: Quiz 4-Option Multiple Choice Generator**
  - **Module**: `src/components/QuizGame.jsx`
  - **Input**: Generate quiz question for target word `'accurate'`.
  - **Expected Output**: Returns 4 distinct choices (1 correct Arabic translation, 3 distractors).
  - **Assertion**: `assert.strictEqual(question.options.length, 4)`; `assert.ok(question.options.includes(correctArabic))`.
- **F4-T1-05: Analytics CEFR Mastery Percentage Calculation**
  - **Module**: `src/components/Analytics.jsx`
  - **Input**: Total A1 words = 500, Mastered A1 words = 250.
  - **Expected Output**: A1 completion rate = `50.0%`.
  - **Assertion**: `assert.strictEqual(calculatePercentage(250, 500), 50)`.

#### Feature 5: Build Output, Configuration & Deployment CI/CD (F5)
- **F5-T1-01: `package.json` Configuration Verification**
  - **Module**: `package.json`
  - **Input**: Read JSON file contents.
  - **Expected Output**: `"type": "module"`, `"scripts.build": "vite build"`.
  - **Assertion**: `assert.strictEqual(pkg.type, 'module')`.
- **F5-T1-02: `vite.config.js` Base Path Normalization**
  - **Module**: `vite.config.js`
  - **Input**: Import config object.
  - **Expected Output**: `base` property is set to `'./'`.
  - **Assertion**: `assert.strictEqual(config.base, './')`.
- **F5-T1-03: `index.html` Root Div & Script Tag Entry**
  - **Module**: `index.html`
  - **Input**: Parse HTML document text.
  - **Expected Output**: Contains `<div id="root"></div>` and `<script type="module" src="/src/main.jsx">`.
  - **Assertion**: `assert.matches(htmlContent, /<div\s+id="root">\s*<\/div>/i)`.
- **F5-T1-04: GitHub Actions Workflow (`.github/workflows/deploy.yml`)**
  - **Module**: `.github/workflows/deploy.yml`
  - **Input**: Inspect YAML file.
  - **Expected Output**: Triggers on `push: branches: [ main ]`, includes `npm run build` step and `JamesIves/github-pages-deploy-action`.
  - **Assertion**: `assert.includes(yamlContent, 'npm run build')`.
- **F5-T1-05: Static Bundle Output Bundle Entry Inspection (`./dist`)**
  - **Module**: `./dist/index.html`
  - **Input**: Inspect compiled Vite build output in `./dist`.
  - **Expected Output**: `index.html` exists; asset references begin with `./assets/`.
  - **Assertion**: `assert.distArtifacts('./dist')`.

---

### Tier 2: Boundary & Corner Cases (Boundary Tests — 25 Total)

#### Feature 1: Oxford 3000 Lexicon Dataset & Catalog Grid (F1)
- **F1-T2-01: Search Filter with No Matching Results**
  - **Module**: `src/components/LexiconGrid.jsx`
  - **Input**: Search query string `'xyz5599_nonexistent'`.
  - **Expected Output**: Returns empty array `[]`; displays "No matching words found" empty state.
  - **Assertion**: `assert.strictEqual(filteredWords.length, 0)`.
- **F1-T2-02: Case and Whitespace Search Filter Tolerance**
  - **Module**: `src/components/LexiconGrid.jsx`
  - **Input**: Search query `'  aBAnDon  '`.
  - **Expected Output**: Trimmed & lowercased search matches `'abandon'`.
  - **Assertion**: `assert.strictEqual(results[0].word.toLowerCase(), 'abandon')`.
- **F1-T2-03: Invalid/Malformed CEFR Query Fallback**
  - **Module**: `src/components/LexiconGrid.jsx`
  - **Input**: CEFR level filter parameter `'C2'` or `'INVALID'`.
  - **Expected Output**: Gracefully falls back to showing all dataset items or returning empty list without throwing runtime error.
  - **Assertion**: `assert.doesNotThrow(() => filterByCefr('INVALID'))`.
- **F1-T2-04: Virtual Pagination Upper & Lower Bounds**
  - **Module**: `src/components/LexiconGrid.jsx`
  - **Input**: Request page `-1` or page `9999`.
  - **Expected Output**: Page `-1` clamps to page `1`; page `9999` clamps to `maxPages`.
  - **Assertion**: `assert.strictEqual(clampPage(-1, 5), 1)`; `assert.strictEqual(clampPage(9999, 5), 5)`.
- **F1-T2-05: Custom Fetched Words Deduplication**
  - **Module**: `src/context/AppContext.jsx`
  - **Input**: Add custom word object `{ word: 'Abandon', ... }` when `'abandon'` already exists.
  - **Expected Output**: Prevents duplicate insertion; state length remains unchanged.
  - **Assertion**: `assert.strictEqual(customWords.length, initialLength)`.

#### Feature 2: Dual Audio TTS & AI Speech Evaluation (F2)
- **F2-T2-01: Empty String & Whitespace Audio Playback**
  - **Module**: `src/services/audioService.js`
  - **Input**: `playAudio('   ')` or `playAudio('')`.
  - **Expected Output**: Returns early without invoking `speechSynthesis.speak()` or throwing error.
  - **Assertion**: `assert.strictEqual(mockSynthesis.speaking, false)`.
- **F2-T2-02: Zero Match Pronunciation Evaluation (Garbled Speech)**
  - **Module**: `src/services/speechEvaluation.js`
  - **Input**: `evaluateSpeech('sophisticated', 'xyz abc 123')`.
  - **Expected Output**: `{ score: 0, wordBreakdown: [{ word: 'sophisticated', match: false }] }`.
  - **Assertion**: `assert.strictEqual(res.score, 0)`.
- **F2-T2-03: Case & Punctuation Insensitive Speech Scoring**
  - **Module**: `src/services/speechEvaluation.js`
  - **Input**: `evaluateSpeech('Hello, World!', 'hello world')`.
  - **Expected Output**: `{ score: 100, ... }` ignoring commas and capitalization.
  - **Assertion**: `assert.strictEqual(res.score, 100)`.
- **F2-T2-04: Speech Recognition Error Event Handling**
  - **Module**: `src/services/speechEvaluation.js`
  - **Input**: Trigger `onerror({ error: 'no-speech' })` on speech recognition instance.
  - **Expected Output**: Invokes `onError('no-speech')` callback gracefully without crashing app.
  - **Assertion**: `assert.strictEqual(errorCaptured, 'no-speech')`.
- **F2-T2-05: Web Speech API Missing Browser Fallback**
  - **Module**: `src/services/audioService.js`
  - **Input**: Execute `playAudio('test')` in environment where `window.speechSynthesis = undefined`.
  - **Expected Output**: Automatically falls back to Google TTS audio fetch stream without throwing undefined errors.
  - **Assertion**: `assert.doesNotThrow(() => playAudio('test'))`.

#### Feature 3: Gemini AI Services (F3)
- **F3-T2-01: Missing / Empty API Key Handling**
  - **Module**: `src/services/geminiService.js`
  - **Input**: `fetchMissingTerm('elated', '')` with `apiKey = ''`.
  - **Expected Output**: Rejects or returns `null` with warning notification "API key missing".
  - **Assertion**: `assert.strictEqual(res, null)`.
- **F3-T2-02: Storyteller Selected Words Upper Limit (Max 5)**
  - **Module**: `src/context/AppContext.jsx`
  - **Input**: Attempt to select 6th word using `toggleSelectWord('word6')`.
  - **Expected Output**: Selection rejected; `selectedWords.length` stays `5`; warning toast notification triggered.
  - **Assertion**: `assert.strictEqual(selectedWords.length, 5)`.
- **F3-T2-03: Malformed JSON AI API Response Graceful Recovery**
  - **Module**: `src/services/geminiService.js`
  - **Input**: Gemini endpoint returns text `"INTERNAL_SERVER_ERROR non-json text"`.
  - **Expected Output**: Catches JSON parse exception, logs error, returns `null` or fallback mock object.
  - **Assertion**: `assert.doesNotThrow(async () => await fetchMissingTerm('bad', 'KEY'))`.
- **F3-T2-04: Extremely Long Input Prompt Truncation**
  - **Module**: `src/services/geminiService.js`
  - **Input**: `generateSentence('a'.repeat(2000), 'short', 'start', 'casual', 'KEY')`.
  - **Expected Output**: Input term sanitized or truncated before API dispatch.
  - **Assertion**: `assert.ok(sanitizedTerm.length <= 100)`.
- **F3-T2-05: Network Disconnection / Offline Timeout Handling**
  - **Module**: `src/services/geminiService.js`
  - **Input**: `fetch` throws `TypeError: Failed to fetch` (offline state).
  - **Expected Output**: Handles fetch failure, triggers toast error "Network offline", resolves safely.
  - **Assertion**: `assert.strictEqual(res, null)`.

#### Feature 4: SRS Flashcards, Quiz Game & Analytics (F4)
- **F4-T2-01: Zero Mastered Words Analytics State**
  - **Module**: `src/components/Analytics.jsx`
  - **Input**: `mastered = []`.
  - **Expected Output**: Total mastered = `0`, overall completion percentage = `0%`, no `NaN` or divide-by-zero errors.
  - **Assertion**: `assert.strictEqual(analytics.overallPercentage, 0)`.
- **F4-T2-02: 100% Mastered Words Analytics State**
  - **Module**: `src/components/Analytics.jsx`
  - **Input**: All 3000 words marked as mastered.
  - **Expected Output**: Overall completion percentage = `100.0%`.
  - **Assertion**: `assert.strictEqual(analytics.overallPercentage, 100)`.
- **F4-T2-03: Flashcards Empty Favorites List Filter**
  - **Module**: `src/components/Flashcards.jsx`
  - **Input**: Filter flashcards by "Favorites Only" when `favorites = []`.
  - **Expected Output**: Displays "No favorite flashcards saved" empty state container.
  - **Assertion**: `assert.strictEqual(visibleCards.length, 0)`.
- **F4-T2-04: Quiz Game Retry with Zero Score Reset**
  - **Module**: `src/components/QuizGame.jsx`
  - **Input**: Complete quiz with 0 correct answers and trigger "Try Again" button.
  - **Expected Output**: Resets `currentQuestionIndex` to `0`, `score` to `0`, regenerate question options pool.
  - **Assertion**: `assert.strictEqual(quizState.score, 0)`; `assert.strictEqual(quizState.questionIndex, 0)`.
- **F4-T2-05: Rapid Concurrent Mastery State Toggles**
  - **Module**: `src/context/AppContext.jsx`
  - **Input**: Rapidly execute `toggleMastered('abandon')` 10 times synchronously.
  - **Expected Output**: Alternates boolean state correctly; final state matches parity (even count = unmastered).
  - **Assertion**: `assert.strictEqual(isMastered('abandon'), false)`.

#### Feature 5: Build Output, Configuration & Deployment CI/CD (F5)
- **F5-T2-01: Base Path Trailing Slash Normalization**
  - **Module**: `vite.config.js`
  - **Input**: Test base path configuration `'./'`.
  - **Expected Output**: Prevents absolute slash `/` that breaks relative GitHub Pages subdirectory deployment.
  - **Assertion**: `assert.strictEqual(config.base.startsWith('./'), true)`.
- **F5-T2-02: Missing Build Directory Error Detection**
  - **Module**: `./dist`
  - **Input**: Inspect build output prior to executing `npm run build`.
  - **Expected Output**: Test runner reports readable error "dist directory missing, execute build first".
  - **Assertion**: `assert.ok(!fs.existsSync('./dist_nonexistent'))`.
- **F5-T2-03: Environment Variable Fallback (`VITE_GEMINI_API_KEY`)**
  - **Module**: `src/context/AppContext.jsx`
  - **Input**: `localStorage.getItem('oxford3000_gemini_api_key')` is `null`.
  - **Expected Output**: AppContext defaults to `import.meta.env.VITE_GEMINI_API_KEY || ''`.
  - **Assertion**: `assert.strictEqual(apiKey, process.env.VITE_GEMINI_API_KEY || '')`.
- **F5-T2-04: Relative Asset Link Format in Compiled HTML**
  - **Module**: `./dist/index.html`
  - **Input**: Parse script `<script src="...">` and stylesheet `<link href="...">` attributes in `./dist/index.html`.
  - **Expected Output**: All asset paths start with `./assets/` or `assets/` (never `/assets/`).
  - **Assertion**: `assert.ok(!htmlContent.includes('src="/assets/'))`.
- **F5-T2-05: LocalStorage Quota Exceeded Error Resilience**
  - **Module**: `src/context/AppContext.jsx`
  - **Input**: `localStorage.setItem` throws `DOMException: QuotaExceededError`.
  - **Expected Output**: `saveToStorage` catches error gracefully, logs error to console without breaking UI execution.
  - **Assertion**: `assert.doesNotThrow(() => saveToStorage('test_key', 'large_data'))`.

---

## 5. Verification Method

To independently verify this E2E test specification and runner architecture:

1. **Verify Working Directory Files**:
   - Inspect `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_e2e_1\BRIEFING.md`
   - Inspect `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_e2e_1\progress.md`
   - Inspect `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_e2e_1\handoff.md`

2. **Execute Test Suite Command**:
   ```powershell
   node test/e2e-runner.js
   ```
   Or via Vitest:
   ```powershell
   npx vitest run test/
   ```

3. **Verify Pass Signal & Exit Code**:
   - Check that all 50 Tier 1 & Tier 2 test cases execute with `✓ PASS`.
   - Check that `test-results.json` is generated in project root.
   - Verify zero exit status (`0`).

4. **Invalidation Conditions**:
   - Any unhandled exception during browser API polyfill calls.
   - Any test failing to assert expected input/output contract.
   - Non-relative asset paths in `./dist/index.html`.
