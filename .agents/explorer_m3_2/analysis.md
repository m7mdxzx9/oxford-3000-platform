# Technical Design & Investigation Report: AI Speech Recognition Engine (`src/services/speechEvaluation.js`)

**Milestone**: Milestone 3 — AI Speech Recognition Engine  
**Agent**: Explorer 2 (`explorer_m3_2`)  
**Target Module**: `src/services/speechEvaluation.js`  
**Application**: Oxford 3000™ CEFR Lexicon Application  
**Date**: August 4, 2026  

---

## 1. Executive Summary

Milestone 3 focuses on establishing a robust, browser-native AI Speech Recognition Engine within `src/services/speechEvaluation.js`. This engine provides real-time voice input capture using the standard Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), wrapped with browser capability checks, hardware/permission error handling, and a deterministic pronunciation scoring algorithm.

This technical investigation presents the architecture, scoring algorithm, edge-case mitigation strategies, and proposed implementation for `src/services/speechEvaluation.js`.

---

## 2. Codebase & Test Suite Audit Findings

### 2.1 Existing Service File (`src/services/speechEvaluation.js`)
An initial version of `src/services/speechEvaluation.js` exists in the repository (93 lines). The current file exports:
- `tokenizeText(text)`
- `evaluateSpeech(expectedText, spokenText)`
- `startListening(onResult, onError)`
- `stopListening()`

### 2.2 Existing E2E Test Coverage
The application features a 4-tier test runner (`node test/e2e-runner.js`). All 67 existing tests currently pass (100% pass rate). Specifically, `speechEvaluation.js` is tested across multiple tiers:
- **`T1.F2.3`**: Accuracy scoring calculation (`achieve academic ability` vs `achieve ability` = 67%).
- **`T1.F2.4`**: Word breakdown array structure (`word` string and `match` boolean flag).
- **`T1.F2.5`**: Tokenizer logic (`tokenizeText('Hello, World! This is a TEST.')` -> `['hello', 'world', 'this', 'is', 'a', 'test']`).
- **`T2.F2.2`**: 0% similarity garbled speech handling (`academic` vs `xyz qwerty zxcv` -> 0%).
- **`T2.F2.3`**: 100% exact recitation match.
- **`T2.F2.5`**: Empty target string handling -> returns score 0 and empty array.
- **`T3.4`**: Speech evaluation integrated with AI Story sentence practice.
- **`T3.8`**: Flashcard pronunciation audio evaluation triggering auto-mastery promotion (score >= 90%).
- **`T4.Scenario 2`**: Interactive storytelling recitation workflow evaluation.

---

## 3. Detailed Technical Architecture & Design

### 3.1 Web Speech API Wrapper & Support Checking

Browser support for Web Speech API varies across browsers:
- **Google Chrome / Edge / Opera**: Supported via `window.webkitSpeechRecognition`.
- **Safari**: Supported via `window.SpeechRecognition` or `window.webkitSpeechRecognition` (iOS 14.5+).
- **Firefox / Node.js / Headless Test Environments**: SpeechRecognition may be undefined.

#### Support Detection Helper
```javascript
export const isSpeechRecognitionSupported = () => {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
};
```

#### API Instance & Configuration
When `startListening(onResult, onError)` is called:
1. Active instances are cleanly closed by calling `stopListening()`.
2. Support check is executed; if unsupported, a standard `Error` object is dispatched to `onError`.
3. An instance of `SpeechRecognitionClass` is instantiated with settings:
   - `continuous = false` (Single utterance capture per practice attempt to maximize accuracy and minimize battery/network overhead).
   - `interimResults = false` (Dispatches final transcript once speech pauses).
   - `lang = 'en-US'` (Standard dialect for Oxford 3000 CEFR lexicon practice).

---

### 3.2 Error Handling & Permission Matrix

Web Speech API triggers the `onerror` event with specific error codes. The service maps these codes to descriptive user messages:

| Error Code | Root Cause | Handling Strategy | User-facing Error Message |
| :--- | :--- | :--- | :--- |
| `not-allowed` | User blocked microphone access in browser prompt or OS settings. | Invoke `onError(new Error(...))` | `"Microphone access denied. Please allow microphone permissions in your browser settings."` |
| `audio-capture` | No microphone hardware detected on system. | Invoke `onError(new Error(...))` | `"No microphone detected. Please connect an audio input device."` |
| `no-speech` | Recognition timer elapsed without detecting speech. | Invoke `onError(new Error(...))` | `"No speech detected. Please speak clearly into your microphone."` |
| `network` | Network failure during speech recognition service lookup. | Invoke `onError(new Error(...))` | `"Network error occurred during speech recognition."` |
| `aborted` | Speech recognition was cancelled programmatically or by system. | Quietly reset state / fire callback if expected. | `"Speech recognition session was aborted."` |
| `service-not-allowed` | Browser engine blocked speech recognition service. | Invoke `onError(new Error(...))` | `"Speech recognition service is blocked by the browser."` |
| `unsupported` | Browser does not support Web Speech API. | Guard check inside `startListening` | `"Speech recognition not supported in this browser environment."` |

---

### 3.3 Accuracy Scoring Algorithm Specification

The speech evaluation engine uses a word-level tokenization and frequency-count matching algorithm:

#### Step 1: Text Normalization & Tokenization (`tokenizeText`)
- Input validation: Returns `[]` if input is missing, null, undefined, or non-string.
- Casing: Converts text to lowercase (`.toLowerCase()`).
- Punctuation removal: Strips symbols like `. , ! ? " ; : ( ) [ ] - – — /`, preserving contractions with single quotes (`replace(/[^\w\s']/g, '')`).
- Whitespace trimming: Trims leading/trailing spaces and splits on one or more whitespace characters (`.trim().split(/\s+/)`).
- Filtering: Filters out empty token strings (`.filter(Boolean)`).

#### Step 2: Frequency-Count Match Evaluation
To avoid false positives on repeated target words (e.g. *"to be or not to be"*), the algorithm tracks token frequencies in the spoken text using a hash map (`spokenCounts`):

1. Tokenize `expectedText` -> `expectedTokens`.
2. Tokenize `spokenText` -> `spokenTokens`.
3. Construct frequency map:
   $$\text{spokenCounts}[w] = \text{count of } w \text{ in } \text{spokenTokens}$$
4. Iterate over `expectedTokens`:
   - If `spokenCounts[word] > 0`:
     - Set `match = true`
     - Decrement `spokenCounts[word]--`
     - Increment `matchedCount++`
   - Else:
     - Set `match = false`
5. Return array of `{ word: string, match: boolean }` objects.

#### Step 3: Math Scoring Formula
- If `expectedTokens.length === 0`: return `{ score: 0, wordBreakdown: [] }`.
- Calculation:
  $$\text{rawScore} = \text{Math.round}\left(\frac{\text{matchedCount}}{\text{expectedTokens.length}} \times 100\right)$$
- Clamping:
  $$\text{score} = \max(0, \min(100, \text{rawScore}))$$

---

### 3.4 Edge Case Mitigation Matrix

| Edge Case Scenario | Expected Behavior | Service Handling Implementation |
| :--- | :--- | :--- |
| **Missing Microphone Hardware** | Fire `onError` callback without throwing runtime crash. | Handle `onerror` code `'audio-capture'` and pass descriptive error. |
| **Browser Unsupported / SSR / Node** | Return `isSupported() === false`, fire error gracefully on `startListening`. | Check `typeof window !== 'undefined'` and SpeechRecognition availability. |
| **Empty Spoken Speech (`""` or `"  "`)** | Score = `0%`, all target words marked `match: false`. | `spokenTokens.length === 0` logic path sets all breakdown items to `false`. |
| **Empty Target Expected Text (`""`)** | Score = `0%`, `wordBreakdown = []`. | `expectedTokens.length === 0` boundary check immediately returns `{ score: 0, wordBreakdown: [] }`. |
| **Noisy Input / Garbled Phonetics** | Words not matching target list yield `match: false`, score = `0%`. | Unmatched tokens do not contribute to `matchedCount`. |
| **Punctuation & Contractions** | Punctuation stripped, contractions like `"don't"` preserved. | Regex `/[^\w\s']/g` keeps apostrophes inside words intact. |
| **Rapid Start/Stop Calls** | No duplicate recognition instances running concurrently. | `startListening` calls `stopListening()` before initializing new `SpeechRecognition`. |

---

## 4. Proposed Production Implementation for `src/services/speechEvaluation.js`

```javascript
/**
 * Oxford 3000 Lexicon Application - Speech Evaluation & Recognition Service
 * Module: src/services/speechEvaluation.js
 */

let activeRecognition = null;

/**
 * Checks if the current environment supports Web Speech Recognition API.
 * @returns {boolean}
 */
export const isSpeechRecognitionSupported = () => {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
};

/**
 * Normalizes input text by removing punctuation (preserving single apostrophes),
 * lowercasing, and splitting into clean word tokens.
 * 
 * @param {string} text - Raw input string
 * @returns {string[]} Array of normalized word tokens
 */
export const tokenizeText = (text) => {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
};

/**
 * Evaluates spoken text against expected target text and returns an accuracy score (0-100)
 * along with a word-by-word match breakdown.
 * 
 * @param {string} expectedText - The target text the user was supposed to speak
 * @param {string} spokenText - The transcribed speech recognized from user audio
 * @returns {{ score: number, wordBreakdown: Array<{ word: string, match: boolean }> }}
 */
export const evaluateSpeech = (expectedText = '', spokenText = '') => {
  const expectedTokens = tokenizeText(expectedText);
  const spokenTokens = tokenizeText(spokenText);

  // If no expected text was provided, return 0 score and empty breakdown
  if (expectedTokens.length === 0) {
    return {
      score: 0,
      wordBreakdown: []
    };
  }

  // If spoken speech is empty or whitespace-only
  if (spokenTokens.length === 0) {
    return {
      score: 0,
      wordBreakdown: expectedTokens.map((word) => ({ word, match: false }))
    };
  }

  // Frequency map for spoken tokens to handle duplicate target words accurately
  const spokenCounts = {};
  for (const token of spokenTokens) {
    spokenCounts[token] = (spokenCounts[token] || 0) + 1;
  }

  let matchedCount = 0;
  const wordBreakdown = expectedTokens.map((word) => {
    if (spokenCounts[word] && spokenCounts[word] > 0) {
      spokenCounts[word]--;
      matchedCount++;
      return { word, match: true };
    }
    return { word, match: false };
  });

  const rawScore = Math.round((matchedCount / expectedTokens.length) * 100);
  const score = Math.max(0, Math.min(100, rawScore));

  return {
    score,
    wordBreakdown
  };
};

/**
 * Starts continuous browser speech recognition session.
 * 
 * @param {function(string): void} onResult - Callback invoked with final transcript text
 * @param {function(Error): void} onError - Callback invoked with error object on failure
 */
export const startListening = (onResult, onError) => {
  // Always stop existing recognition sessions first
  stopListening();

  if (!isSpeechRecognitionSupported()) {
    if (typeof onError === 'function') {
      onError(new Error('Speech recognition not supported in this browser environment.'));
    }
    return;
  }

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

  try {
    activeRecognition = new SpeechRecognitionClass();
    activeRecognition.continuous = false;
    activeRecognition.interimResults = false;
    activeRecognition.lang = 'en-US';

    activeRecognition.onresult = (event) => {
      if (event && event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript || '';
        if (typeof onResult === 'function') {
          onResult(transcript);
        }
      }
    };

    activeRecognition.onerror = (event) => {
      let errorMessage = 'Speech recognition error occurred.';
      const errCode = event && (event.error || event);

      switch (errCode) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone permissions in browser settings.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone detected. Please check your audio input device.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please speak clearly into your microphone.';
          break;
        case 'network':
          errorMessage = 'Network error occurred during speech recognition.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition session was aborted.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service is blocked by the browser.';
          break;
        default:
          if (typeof errCode === 'string') errorMessage = `Speech recognition error: ${errCode}`;
          break;
      }

      if (typeof onError === 'function') {
        onError(new Error(errorMessage));
      }
    };

    activeRecognition.onend = () => {
      activeRecognition = null;
    };

    activeRecognition.start();
  } catch (err) {
    if (typeof onError === 'function') {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
};

/**
 * Stops any currently active speech recognition session.
 */
export const stopListening = () => {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch (e) {
      // Ignore errors if recognition was already stopped
    }
    activeRecognition = null;
  }
};

export default {
  evaluateSpeech,
  startListening,
  stopListening,
  tokenizeText,
  isSpeechRecognitionSupported
};
```

---

## 5. Integration Blueprint for Lexicon Modules

`src/services/speechEvaluation.js` integrates into downstream application features as follows:

1. **AI Storyteller (Milestone 4)**:
   - User listens to line audio via `audioService.playAudio()`.
   - User clicks mic icon -> triggers `speechEvaluation.startListening(onResult, onError)`.
   - On transcript received: calls `speechEvaluation.evaluateSpeech(line.text, transcript)`.
   - Renders word breakdown with color coding (green = match, red = missed).

2. **AI Personal Tutor (Milestone 4)**:
   - Voice input for student roleplay responses.
   - Converts recognized spoken transcript to text input sent to Gemini AI roleplay engine.

3. **SRS 3D Flashcards (Milestone 5)**:
   - User practices word pronunciation on card back.
   - Evaluation score >= 90% automatically marks card as `Mastered`.

---

## 6. Verification Method & Test Command

To verify implementation integrity:
```bash
npm test
```
Execution results will update `test-results.json` and report 100% pass status across all 4 tiers.
