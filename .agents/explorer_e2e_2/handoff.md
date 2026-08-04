# Explorer 2 Handoff Report: E2E Test Specifications (Tier 3 Cross-Feature & Tier 4 Real-World Workflows)

## 1. Observation

### 1.1 Project Codebase & File Structure
Direct inspection of the target project directory `c:\Users\HP\Downloads\English\oxford-3000-platform\` confirms the following component architecture and file layout:

- **Root & Build Configuration**:
  - `package.json`: Configured as ESM (`"type": "module"`), React 18 (`^18.2.0`), Vite (`^5.1.6`), Tailwind CSS (`^3.4.1`), Lucide React (`^0.344.0`), clsx (`^2.1.0`), tailwind-merge (`^2.2.1`). Scripts: `dev` (`vite`), `build` (`vite build`), `preview` (`vite preview`).
  - `vite.config.js`: Base path set to relative `./` (`base: './'`), output directory `dist`, dev server port 3000 (`port: 3000`).
  - `tailwind.config.js`: Customized dark theme colors (`bg-dark`: `#060d21`, `cefr.a1`: `#10b981`, `cefr.a2`: `#0ea5e9`, `cefr.b1`: `#f59e0b`, `cefr.b2`: `#f43f5e`), custom fonts (`Inter`, `Cairo`, `Tajawal`, `JetBrains Mono`), glassmorphic styling, and animation utilities.
  - `index.html`: Dark mode root (`<html lang="en" class="dark">`), Google Fonts preconnect, root container (`<div id="root"></div>`), entry script `/src/main.jsx`.

- **Application State & React Component Hierarchy**:
  - `src/main.jsx`: Mounts `<App />` wrapped in `<React.StrictMode>`.
  - `src/App.jsx`: Wraps main application inside `<AppProvider>`. Renders sticky `<Navbar />`, dynamic `<MainContent />` based on `activeTab`, `<footer />`, `<ApiKeyModal />`, and `<ToastNotifications />`.
  - `src/context/AppContext.jsx`: Central state container defining state variables, localStorage sync effects, and dispatch helpers:
    - `activeTab`: State tab switcher (`'grid'`, `'sentence'`, `'story'`, `'tutor'`, `'flashcards'`, `'quiz'`, `'analytics'`).
    - `favorites`: Array of favorited word terms (`STORAGE_KEYS.FAVORITES` = `'oxford3000_favorites'`).
    - `mastered`: Array of mastered word terms (`STORAGE_KEYS.MASTERED` = `'oxford3000_mastered'`).
    - `customWords`: Dynamically fetched AI lexicon entries (`STORAGE_KEYS.CUSTOM_WORDS` = `'oxford3000_custom_words'`).
    - `selectedWords`: Array of selected terms for Storyteller (capped at maximum 5).
    - `apiKey`: Gemini API key override stored in `localStorage` (`STORAGE_KEYS.API_KEY` = `'oxford3000_gemini_api_key'`), defaulting to `import.meta.env.VITE_GEMINI_API_KEY`.
    - `isApiKeyModalOpen`: Boolean controlling modal visibility.
    - `notifications`: Array of active toast notifications with auto-dismiss timer.
  - `src/components/Navbar.jsx`: Glassmorphic navigation header featuring 7 tab buttons with live badge counters (`selectedWordsCount/5`, `favoritesCount`, `masteredCount`), Gemini API key status indicator, and responsive mobile menu.
  - `src/components/ApiKeyModal.jsx`: Modal for viewing, updating, or clearing the Gemini API key.
  - `src/components/ToastNotifications.jsx`: Fixed position bottom-right toast notification container.

- **Planned Data Models & Service Exports (from `e2e_testing_orch/SCOPE.md` & `explorer_e2e_3/handoff.md`)**:
  - `src/data/oxford3000.js`: Array of Oxford 3000 lexicon entries containing `{ word, pos, cefr, arabic, example, ipa }`.
  - `src/services/audioService.js`: Exports `playAudio(word, rate)`, `stopAudio()`.
  - `src/services/speechEvaluation.js`: Exports `startListening(onResult)`, `stopListening()`, `evaluateSpeech(targetText, spokenText)`.
  - `src/services/geminiService.js`: Exports `fetchMissingTerm(word, apiKey)`, `generateSentence(word, length, position, apiKey)`, `generateStory(words, theme, level, apiKey)`, `getTutorResponse(history, message, scenario, apiKey)`.

---

## 2. Logic Chain

1. **State Centralization Analysis**: `AppContext.jsx` acts as the single source of truth for cross-feature interactions. State transitions in one feature (e.g. marking a term as favorite or mastered in the Catalog Grid) immediately trigger reactive updates in `favoritesCount` / `masteredCount`, which update Navbar badges, Flashcard pools, Quiz question generators, and Analytics CEFR calculations.
2. **Cross-Feature Coupling Points**:
   - **Catalog Grid (F1) <-> Audio TTS / Speech (F2)**: Catalog grid actions invoke `audioService.playAudio` for pronunciation and pass term targets to `speechEvaluation`.
   - **Catalog Grid (F1) <-> Gemini AI (F3)**: Missing term searches trigger `geminiService.fetchMissingTerm`, which appends new terms to `customWords` state, updating the live catalog grid.
   - **Gemini AI (F3) <-> SRS / Analytics (F4)**: Words extracted from AI Storyteller or AI Tutor roleplay can be favorited/mastered, directly modifying SRS flashcard queues and Analytics dashboard metrics.
   - **SRS Flashcards (F4) <-> Quiz Game (F4) <-> Analytics (F4)**: SRS mastery toggles populate the quiz candidate pool; quiz performance feeds back into the CEFR level mastery breakdown.
   - **API Key Configuration (F3) <-> LocalStorage (F5)**: Key updates in `ApiKeyModal` persist via `localStorage` and override default environment parameters across all Gemini service calls.
3. **Specification Strategy**:
   - **Tier 3 (Cross-Feature Combinations)**: Design >=10 (specifically 12) pairwise interaction test cases verifying interface boundaries, state reactivity, event propagation, and state synchronization across feature boundaries.
   - **Tier 4 (Real-World Application Scenarios)**: Design >=5 (specifically 5) complete end-to-end user workflows simulating actual learner journeys from initial discovery to mastery and analytics reflection.

---

## 3. Caveats

- **Hermetic Test Execution**: End-to-end tests in automated runners must mock Web Speech API, Speech Recognition, and Gemini API network calls to remain deterministic and offline-compliant.
- **LocalStorage Isolation**: Tests must clear `localStorage` before each test run to avoid state leakage between test scenarios.
- **Async Timing & Animations**: UI state transitions (such as toast notification timeouts and modal animations) require explicit async waiting or mock timer control during runner execution.

---

## 4. Conclusion & Detailed Test Specifications

---

### TIER 3: CROSS-FEATURE COMBINATIONS (12 Pairwise Feature Interaction Tests)

```
+---------------------------------------------------------------------------------------------------+
| TIER 3 FEATURE INTERACTION MAP                                                                    |
|                                                                                                   |
|  +--------------------+       Audio TTS / Speech        +-----------------------+                 |
|  | F1: Lexicon Catalog | <----------------------------> | F2: Audio & Speech    |                 |
|  +--------------------+                                 +-----------------------+                 |
|            |                                                        |                             |
|            | Search / Fetch                                         | Pronunciation Score         |
|            v                                                        v                             |
|  +--------------------+                                 +-----------------------+                 |
|  | F3: Gemini AI      | ------------------------------> | F4: Flashcards, Quiz  |                 |
|  +--------------------+        Tutor Vocab Extract      |     & Analytics       |                 |
|            |                                            +-----------------------+                 |
|            | Custom Key Override                                    |                                 |
|            v                                                    | LocalStorage Sync               |
|  +--------------------+                                         v                                 |
|  | F5: Build & Config | <------------------------------------------------                         |
|  +--------------------+                                                                           |
+---------------------------------------------------------------------------------------------------+
```

#### Test 3.1: Lexicon Catalog Filter -> Audio TTS Playback Interaction
- **Target Features**: Lexicon Catalog (F1) + Audio TTS Service (F2)
- **Pre-conditions**: Lexicon dataset loaded with A1-B2 terms. SpeechSynthesis mock initialized.
- **Action Sequence**:
  1. Filter Lexicon Catalog by CEFR level `B2` and part of speech `verb`.
  2. Locate term card "negotiate" (`/rɪˈɡoʊ.ʃi.eɪt/`).
  3. Click "Play Pronunciation" button with speed set to `0.9x`.
- **Expected Outcome**:
  - `audioService.playAudio("negotiate", 0.9)` is called.
  - SpeechSynthesisUtterance object contains `text: "negotiate"`, `rate: 0.9`, `lang: "en-US"`.
  - Button UI displays active speaking indicator state during playback.

#### Test 3.2: Lexicon Missing Term Search -> Gemini AI Fetch -> Catalog Grid Dynamic Update
- **Target Features**: Lexicon Catalog (F1) + Gemini AI Service (F3)
- **Pre-conditions**: Search query "resilience" is absent from default Oxford 3000 dataset.
- **Action Sequence**:
  1. User types "resilience" into Catalog search input.
  2. Search returns 0 results and displays "AI Fetch Missing Term" prompt.
  3. User clicks "Fetch Term with Gemini AI".
  4. `geminiService.fetchMissingTerm("resilience", apiKey)` executes and returns structured term payload.
- **Expected Outcome**:
  - `addCustomWord` appends object to `customWords` state.
  - `oxford3000_custom_words` in `localStorage` contains stringified term array.
  - Catalog Grid dynamically renders "resilience" card with custom badge, IPA, Arabic translation, and LTR isolation.
  - Toast notification "Added missing term 'resilience' to Lexicon!" is displayed.

#### Test 3.3: Storyteller Selected Words (Catalog Grid) -> AI Story Generator -> Audio Line Playback
- **Target Features**: Lexicon Catalog (F1) + Gemini AI Storyteller (F3) + Audio TTS (F2)
- **Pre-conditions**: Catalog grid loaded. Storyteller selection pool empty (`selectedWords.length === 0`).
- **Action Sequence**:
  1. Click "Select for Story" on 3 Catalog terms: "adventure", "explore", "destination".
  2. Verify Navbar Storyteller badge displays "3/5".
  3. Navigate to Storyteller tab (`activeTab === 'story'`).
  4. Click "Generate AI Story".
  5. Click "Play Line 1 Audio" on generated story paragraph.
- **Expected Outcome**:
  - `selectedWords` state contains 3 objects.
  - `geminiService.generateStory` receives `["adventure", "explore", "destination"]`.
  - Storyteller renders story title, paragraph lines with highlighted target terms.
  - Line 1 audio trigger invokes `audioService.playAudio` with exact text of line 1.

#### Test 3.4: AI Story Sentence -> Speech Recognition Audio Evaluation -> Score & Feedback Update
- **Target Features**: Gemini AI Storyteller (F3) + Speech Recognition Evaluation (F2)
- **Pre-conditions**: AI Story generated and rendered on screen. Speech recognition mock ready.
- **Action Sequence**:
  1. User selects story line 1: "We started our adventure early in the morning."
  2. Click "Record Pronunciation" button.
  3. Mock microphone delivers spoken text: "We started our adventure early in morning."
  4. `speechEvaluation.evaluateSpeech(targetLine, spokenText)` processes input.
- **Expected Outcome**:
  - Function returns accuracy score (e.g. `88%`) and word-by-word match array (`[{ word: "the", matched: false }, ...]`).
  - Score badge updates on UI with color coding (Green for >= 85%).
  - Detailed breakdown highlights missing/mispronounced words in red/amber.

#### Test 3.5: AI Personal Tutor Scenario -> Roleplay Dialogue -> Vocabulary Extraction to Flashcards
- **Target Features**: Gemini AI Personal Tutor (F3) + SRS Flashcards State (F4)
- **Pre-conditions**: User active in AI Tutor tab (`activeTab === 'tutor'`).
- **Action Sequence**:
  1. Select roleplay scenario "Job Interview" and submit user response.
  2. `geminiService.getTutorResponse` returns response with grammar feedback and recommended vocabulary terms: `["qualification", "applicant"]`.
  3. Click "Favorite All Recommended Terms" button on response card.
- **Expected Outcome**:
  - `toggleFavorite` adds "qualification" and "applicant" to `favorites` state array.
  - `oxford3000_favorites` in `localStorage` is updated.
  - Navbar Flashcards badge count increments accordingly.
  - Navigating to Flashcards tab shows newly favorited cards in the active stack.

#### Test 3.6: Catalog Grid -> SRS Flashcard 3D Flip -> Toggle Mastered State -> Analytics CEFR Update
- **Target Features**: Lexicon Catalog (F1) + SRS Flashcards (F4) + Progress Analytics (F4)
- **Pre-conditions**: Initial mastered count is 0 (`masteredCount === 0`).
- **Action Sequence**:
  1. Navigate to 3D Flashcards (`activeTab === 'flashcards'`).
  2. Trigger 3D flip card toggle (`isFlipped = true`).
  3. Click "Mark as Mastered" button on B1 term "achievement".
  4. Navigate to Progress Analytics tab (`activeTab === 'analytics'`).
- **Expected Outcome**:
  - `toggleMastered("achievement")` fires, adding term to `mastered` array.
  - `oxford3000_mastered` in `localStorage` is updated.
  - Toast notification "🎉 Mastered 'achievement'!" is displayed.
  - Analytics tab updates B1 CEFR mastery percentage and overall lexicon progress bar.

#### Test 3.7: Mastered Words Pool -> Dynamic Quiz Generation -> Score Calculation -> Analytics Sync
- **Target Features**: SRS Flashcards State (F4) + Quiz Game (F4) + Progress Analytics (F4)
- **Pre-conditions**: 5 terms marked as mastered across A1, A2, B1, B2.
- **Action Sequence**:
  1. Navigate to Quiz Game (`activeTab === 'quiz'`).
  2. Click "Start Adaptive Quiz".
  3. Answer 5 multiple-choice questions generated from mastered/favorites pool.
  4. Complete quiz with 4 correct answers out of 5.
- **Expected Outcome**:
  - Quiz generator builds valid 4-option questions with 1 correct answer and 3 distractors.
  - Final score modal displays `80%` score and completion summary.
  - Analytics tab records quiz session history, average accuracy score, and total completed quizzes.

#### Test 3.8: Flashcard Pronunciation Audio -> Speech Evaluation -> Auto-Mastery Promotion
- **Target Features**: SRS Flashcards (F4) + Audio TTS (F2) + Speech Evaluation (F2)
- **Pre-conditions**: Term "consequence" (B2) in flashcard queue with `mastered = false`.
- **Action Sequence**:
  1. Click audio listen button on "consequence" card.
  2. Click record speech button and speak term accurately.
  3. `evaluateSpeech("consequence", "consequence")` returns `100%` accuracy score.
- **Expected Outcome**:
  - System automatically triggers `toggleMastered("consequence")`.
  - Flashcard UI updates card status with a gold "Mastered" badge and celebration particle animation.
  - Navbar Analytics badge updates immediately.

#### Test 3.9: Gemini API Key Input -> LocalStorage Persistence -> AI Service Pass-Through
- **Target Features**: API Key Modal (F5) + Gemini AI Services (F3)
- **Pre-conditions**: Default environment API key active.
- **Action Sequence**:
  1. Click "API Key" button in Navbar to open `ApiKeyModal`.
  2. Enter custom key `AIzaSyCustomTestKey999` and click "Save Key".
  3. Trigger AI Sentence Builder request (`activeTab === 'sentence'`).
- **Expected Outcome**:
  - `apiKey` in `AppContext` is set to `AIzaSyCustomTestKey999`.
  - `localStorage.getItem("oxford3000_gemini_api_key")` returns `AIzaSyCustomTestKey999`.
  - Navbar API Key status indicator displays green active status dot.
  - `geminiService.generateSentence` receives `AIzaSyCustomTestKey999` as the apiKey argument.

#### Test 3.10: LocalStorage State -> Application Reload -> State Hydration -> Analytics Integrity
- **Target Features**: LocalStorage Storage Keys (F5) + App Context Hydration (F1-F4)
- **Pre-conditions**: Set `oxford3000_favorites` = `["abandon", "ability"]` and `oxford3000_mastered` = `["able"]` in `localStorage`.
- **Action Sequence**:
  1. Re-render/initialize `AppProvider`.
  2. Check initial state values in context.
  3. Navigate through Navbar tabs (Grid, Flashcards, Analytics).
- **Expected Outcome**:
  - `favorites` state hydrates with `["abandon", "ability"]` (`favoritesCount === 2`).
  - `mastered` state hydrates with `["able"]` (`masteredCount === 1`).
  - Navbar badges render `2` for Flashcards and `1` for Analytics.
  - Analytics dashboard accurately calculates CEFR A1 breakdown based on hydrated state.

#### Test 3.11: Catalog Filter -> Multi-select for Storyteller -> Over-Limit Toast Guard
- **Target Features**: Lexicon Catalog (F1) + Storyteller Selection Guard (F3) + Toast Notifications
- **Pre-conditions**: `selectedWords` array contains 5 items (maximum limit reached).
- **Action Sequence**:
  1. Filter grid by CEFR `A2`.
  2. Click "Select for Story" on a 6th term ("explore").
- **Expected Outcome**:
  - `toggleSelectWord` detects `prev.length >= 5`.
  - Toast notification warning "Maximum 5 words can be selected for Storytelling." is triggered.
  - `selectedWords` array length remains capped at 5.
  - Card selection border/badge for 6th item remains inactive.

#### Test 3.12: Custom AI Fetched Term -> Flashcard Queue -> Quiz Distractor Option Generation
- **Target Features**: Gemini AI Term Fetcher (F3) + SRS Flashcards (F4) + Quiz Distractor Generator (F4)
- **Pre-conditions**: Custom term "sustainability" added via AI fetcher.
- **Action Sequence**:
  1. Navigate to Quiz Game.
  2. Trigger Quiz question generation.
- **Expected Outcome**:
  - Quiz engine includes custom word "sustainability" in question pool or as a valid distractor choice.
  - Question rendering formats Arabic translation and part of speech correctly.

---

### TIER 4: REAL-WORLD APPLICATION SCENARIOS (5 Complete End-to-End Workflows)

```
+----------------------------------------------------------------------------------------------------+
| COMPLETE END-TO-END LEARNING WORKFLOW PIPELINE                                                     |
|                                                                                                    |
|  [1. Catalog Search & Filter] ---> [2. TTS Audio & AI Sentence] ---> [3. Favorite / SRS Flashcard]  |
|                                                                                 |                  |
|                                                                                 v                  |
|  [6. CEFR Analytics Progress] <--- [5. Quiz Game Challenge] <--- [4. Mastery State Update]         |
+----------------------------------------------------------------------------------------------------+
```

#### Scenario 1: Comprehensive Lexicon Discovery & AI Sentence Composition Workflow
- **Scenario Description**: An intermediate student searches for specific B2 business terms, listens to native audio pronunciation, generates AI context sentences, and saves newly discovered terms to their personal study collection.
- **Detailed Step-by-Step Execution Path**:
  1. **Launch App**: Application renders Lexicon Catalog Grid as default view (`activeTab === 'grid'`).
  2. **Filter Catalog**: User applies CEFR level filter `B2` and types search query `"negotiate"`.
  3. **Inspect Card**: Grid updates to show 1 matching result. Card displays word `"negotiate"`, part of speech `"verb"`, IPA `"/rɪˈɡoʊ.ʃi.eɪt/"`, Arabic translation `"يتفاوض"`, and LTR isolation styling.
  4. **Audio Playback**: User clicks native TTS audio button. `audioService.playAudio("negotiate", 0.9)` triggers WebSpeechUtterance audio playback.
  5. **Switch to AI Sentence Builder**: User clicks "Sentence Builder" tab in Navbar (`activeTab === 'sentence'`).
  6. **Generate Sentence**: User enters target word `"negotiate"`, selects sentence length `"Medium"`, and anchor position `"middle"`. Click "Generate Sentence".
  7. **Render AI Response**: `geminiService.generateSentence` returns `"The two companies met to negotiate a new commercial agreement."` Target word is highlighted with cyan background.
  8. **Save to Favorites**: User clicks star icon on sentence card. `toggleFavorite("negotiate")` updates state, saves to `localStorage.oxford3000_favorites`, displays success toast `"Added 'negotiate' to favorites"`, and increments Navbar Flashcards badge to `1`.

#### Scenario 2: Interactive AI Storytelling & Line-by-Line Pronunciation Practice Workflow
- **Scenario Description**: A learner selects 3 vocabulary terms from the catalog grid, generates a cohesive short story using Gemini AI, listens to line-by-line narration, and records their own voice to evaluate pronunciation accuracy.
- **Detailed Step-by-Step Execution Path**:
  1. **Select Words**: In Catalog Grid, user selects 3 terms: `"adventure"` (A2), `"explore"` (B1), `"destination"` (B2). Navbar Storyteller badge displays `"3/5"`.
  2. **Navigate to Storyteller**: Click "Storyteller" tab (`activeTab === 'story'`). Selected terms render in top selection drawer.
  3. **Configure & Generate**: User selects theme `"Travel & Exploration"` and difficulty `"Intermediate"`. Click "Generate AI Story".
  4. **Receive Story Payload**: `geminiService.generateStory` returns structured story with title `"The Unmapped Journey"` and 4 sentence lines embedding the selected target terms.
  5. **Line-by-Line Audio**: User clicks "Play Audio" on Line 1. `audioService.playAudio` speaks Line 1.
  6. **Voice Recording & Scoring**: User clicks "Record Speech" on Line 1. `speechEvaluation.startListening` records user voice. `evaluateSpeech` compares spoken audio with target text, returning `92%` match accuracy with word-by-word visual breakdown.
  7. **Mark Mastered & Clear**: User clicks "Mark Selected Words as Mastered". `toggleMastered` adds all 3 terms to `mastered` state. Click "Clear Selection" (`clearSelectedWords()`) to reset drawer.

#### Scenario 3: AI Personal Tutor Roleplay & Adaptive Grammar Feedback Workflow
- **Scenario Description**: A student engages in a realistic conversational roleplay session with an AI tutor (job interview scenario), receives real-time grammar corrections, and extracts recommended vocabulary directly into their flashcard collection.
- **Detailed Step-by-Step Execution Path**:
  1. **Navigate to AI Tutor**: Click "AI Tutor" tab in Navbar (`activeTab === 'tutor'`).
  2. **Select Scenario**: Choose roleplay scenario `"Job Interview"` and CEFR level `"B2"`.
  3. **Send User Message**: User inputs message: `"I am working in software for three years and I want apply for this position."`
  4. **AI Tutor Processing**: `geminiService.getTutorResponse` processes conversation history and input.
  5. **Render Feedback Card**: UI displays:
     - **Tutor Response**: `"That's impressive experience! Could you tell me more about your recent projects?"`
     - **Grammar Corrections**: `"I have been working in software for three years and I want to apply for this position."` (Highlights present perfect continuous and infinitive `to apply`).
     - **Recommended Terms**: `["experience", "qualification", "applicant"]`.
  6. **Add Recommendations to Study Queue**: User clicks "Add Recommended Terms to Flashcards". `toggleFavorite` adds terms to `favorites` state and `localStorage`.

#### Scenario 4: Vocabulary Mastery Loop (Flashcards -> Quiz -> Analytics Dashboard Workflow)
- **Scenario Description**: A user reviews saved terms using 3D interactive flashcards, evaluates retention through a timed quiz game, and inspects updated CEFR mastery metrics on the Analytics dashboard.
- **Detailed Step-by-Step Execution Path**:
  1. **Pre-condition**: User has 6 favorites in `localStorage` across A1 (2), A2 (2), B1 (2).
  2. **Navigate to 3D Flashcards**: Click "Flashcards" tab (`activeTab === 'flashcards'`). Stack displays 6 cards.
  3. **Interactive Flip & Review**: User clicks card 1. Card executes 3D CSS flip animation (`rotateY(180deg)`), revealing Arabic translation, IPA, definition, and example sentence. Click audio play button.
  4. **Master Terms**: User marks 4 cards as "Mastered". `toggleMastered` updates `mastered` state array and localStorage `oxford3000_mastered`.
  5. **Navigate to Quiz Game**: Click "Quiz Game" tab (`activeTab === 'quiz'`).
  6. **Execute Quiz**: Quiz engine generates 5 multiple-choice questions pulling target terms from mastered/favorites pool. User answers all 5 questions, scoring `80%` (4/5).
  7. **View Analytics**: Click "Analytics" tab (`activeTab === 'analytics'`). Dashboard renders updated stats:
     - Total Mastered Count: `4 / 3000` (`0.13%`).
     - CEFR Breakdown: A1: `50%`, A2: `50%`, B1: `0%`, B2: `0%`.
     - Quiz Performance Chart: 1 session completed, 80% average score.

#### Scenario 5: Dynamic Lexicon Expansion via Gemini Instant Fetcher & Analytics Tracking
- **Scenario Description**: A user searches for an advanced term not present in the pre-bundled catalog, configures a custom Gemini API Key in the settings modal, dynamically fetches full term metadata from Gemini AI, appends it to the live Lexicon Grid, and verifies persistent hydration across browser reloads.
- **Detailed Step-by-Step Execution Path**:
  1. **Open API Key Modal**: User clicks "API Key" button in Navbar. `isApiKeyModalOpen` becomes `true`.
  2. **Save Custom Key**: User inputs Google AI Studio key `"AIzaSyTestKey123456789"` and clicks "Save Key". Key stores in `localStorage.oxford3000_gemini_api_key`. Toast confirms update.
  3. **Search Missing Term**: In Catalog Grid, user searches for `"resilience"`. Grid shows empty state with "AI Fetch Missing Term" option.
  4. **Invoke AI Fetcher**: User clicks "Fetch Term with Gemini AI". `geminiService.fetchMissingTerm("resilience", apiKey)` executes.
  5. **Receive Payload**: Gemini API returns JSON payload `{ word: "resilience", pos: "noun", cefr: "B2", arabic: "مرونة / قدرة على التكيف", ipa: "/rɪˈzɪl.jəns/", example: "She showed great resilience during difficult times." }`.
  6. **Dynamic Grid Insertion**: `addCustomWord` prepends object to `customWords`. Grid renders new card with "AI Fetched" badge, LTR isolation styling, and audio controls.
  7. **Verify Persistence**: Simulate app refresh. `AppProvider` initializes -> `loadFromStorage` hydrates `customWords` -> `"resilience"` remains present in catalog grid, flashcard pool, and quiz generator.

---

## 5. Verification Method

To verify this test specification and run tests independently:

1. **Verify Directory and Meta Files**:
   - Inspect `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_e2e_2\handoff.md` to confirm all 5 components, 12 Tier 3 tests, and 5 Tier 4 workflows are fully documented.
   - Inspect `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_e2e_2\progress.md` for completion status.

2. **Execute Test Runner**:
   - Run standard Node execution runner command:
     ```bash
     node test/e2e-runner.js
     ```
   - Alternatively run Vitest test command:
     ```bash
     npm test
     ```

3. **Invalidation Conditions**:
   - Any failure in state hydration from `localStorage`.
   - Mismatch in term schema attributes (`word`, `pos`, `cefr`, `arabic`, `example`, `ipa`).
   - Failure to cap `selectedWords` at 5 items max.
   - Non-zero exit code during execution of `test/e2e-runner.js`.
