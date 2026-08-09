# Dual Audio TTS Engine Analysis & Implementation Plan (`src/services/audioService.js`)

## 1. Observation

### 1.1 Existing File Locations & Signatures
- **Primary Target File**: `src/services/audioService.js` (74 lines, 1948 bytes)
- **Project Spec File**: `.agents/orchestrator/PROJECT.md` (lines 25-28, 61)
- **Primary Consumer**: `src/components/LexiconGrid.jsx` (lines 4, 69, 82)
- **Test Suite**: `test/tier1.test.js` (T1.F2.1, T1.F2.2), `test/tier2.test.js` (T2.F2.1, T2.F2.4), `test/tier3.test.js` (T3.1, T3.3, T3.8), `test/mock-environment.js` (MockSpeechSynthesis, MockAudio, mockFetch)

### 1.2 Verbatim Interface Spec (`PROJECT.md`)
```javascript
// Interface Contract for src/services/audioService.js
playAudio(text, lang = 'en-US', speed = 0.9) -> Promise<void>
stopAudio() -> void
```

### 1.3 Verbatim Current Implementation (`src/services/audioService.js`)
```javascript
let currentAudioElement = null;

export const buildGoogleTtsUrl = (text, lang = 'en-US') => {
  const cleanLang = lang.split('-')[0] || 'en';
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.trim())}&tl=${cleanLang}&client=tw-ob`;
};

export const playAudio = async (text, lang = 'en-US', speed = 0.9) => {
  stopAudio();

  if (!text || typeof text !== 'string' || !text.trim()) {
    return;
  }

  const trimmed = text.trim();

  // Try Web Speech API first
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
    try {
      return await new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(trimmed);
        utterance.lang = lang;
        utterance.rate = speed;

        utterance.onend = () => resolve();
        utterance.onerror = () => {
          // Fallback to Google TTS on error
          playGoogleTtsFallback(trimmed, lang).then(resolve);
        };

        window.speechSynthesis.speak(utterance);
      });
    } catch (err) {
      // Fallback
    }
  }

  // Fallback to Audio element with Google TTS URL
  return playGoogleTtsFallback(trimmed, lang);
};

const playGoogleTtsFallback = async (text, lang) => {
  const url = buildGoogleTtsUrl(text, lang);
  if (typeof Audio !== 'undefined') {
    try {
      currentAudioElement = new Audio(url);
      await currentAudioElement.play();
    } catch (e) {
      // Audio playback interrupted or unsupported
    }
  }
};

export const stopAudio = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch (e) {}
    currentAudioElement = null;
  }
};
```

### 1.4 Test Suite Results
- Test Command: `npm test` (`node test/e2e-runner.js`)
- Result: **67/67 tests passed (100% pass rate)**.
- Fast execution time (~30ms) using hermetic Node mocks.

---

## 2. Logic Chain

1. **Requirement Analysis**:
   - The system requires a dual-engine text-to-speech service (`src/services/audioService.js`) with Web Speech API (`SpeechSynthesisUtterance`) as the primary mechanism and Google Translate TTS streaming (`translate_tts` endpoint with `client=tw-ob`) as the fallback mechanism.
2. **Current Capabilities**:
   - `playAudio` properly validates non-empty string input and invokes `stopAudio()` prior to playback to clear previous speech tasks.
   - Standard browser detection (`typeof window !== 'undefined' && 'speechSynthesis' in window`) is used for Web Speech API.
   - `buildGoogleTtsUrl` constructs a valid fallback stream URL with UTF-8 encoding and language code parsing (`en-US` -> `en`).
   - `stopAudio()` cancels both active SpeechSynthesis utterances and pauses/resets HTML5 `Audio` element instances.
3. **Identified Technical Gaps & Enhancement Opportunities**:
   - **Playback Speed Disparity**: `playAudio` accepts a `speed` parameter (default `0.9`), which is passed to `utterance.rate` in Web Speech API. However, `playGoogleTtsFallback(trimmed, lang)` does not receive `speed` and does not set `currentAudioElement.playbackRate = speed`.
   - **Audio Completion Resolution in Fallback**: `playGoogleTtsFallback` resolves when `currentAudioElement.play()` starts (or throws), rather than waiting for the `onended` event of the HTML5 Audio element. Resolving on `onended` provides proper lifecycle alignment across both primary and fallback engines.
   - **Chrome SpeechSynthesis Hang Guard**: Chrome has a known browser quirk where `speechSynthesis` can get stuck in a paused or blocked state under rapid consecutive playback requests. Adding explicit `window.speechSynthesis.resume()` or checking `window.speechSynthesis.paused` prevents silent freezes.
   - **Voice Selection Optimization**: Web Speech API benefits from selecting an English voice matching the requested locale when available via `window.speechSynthesis.getVoices()`.

---

## 3. Caveats

1. **Browser Autoplay Restrictions**: Browsers (Chrome, Safari) restrict programmatic HTML5 `Audio.play()` without prior user interaction (`NotAllowedError`). In application usage, audio is triggered via explicit click events (e.g. `LexiconCard` play buttons), satisfying browser security requirements.
2. **Google Translate TTS API Client Rate Limits**: The `client=tw-ob` endpoint is an unofficial Google Translate TTS endpoint. It functions well for fallback word/phrase streams, but could encounter CORS or rate limiting if flooded with hundreds of rapid requests without user interaction. Primary Web Speech API minimizes fallback dependency.
3. **Node/CI Test Environment**: Node.js environments lack native `SpeechSynthesis` and `Audio` APIs, relying on `test/mock-environment.js` polyfills during `npm test`.

---

## 4. Conclusion & Proposed Code Patch

### 4.1 Assessment
The Dual Audio TTS Engine (`src/services/audioService.js`) is fully functional and passes all existing 67 E2E tests. Incorporating playback rate synchronization for fallback streaming, promise resolution on HTML5 audio completion, voice selection, and Chrome engine unsticking will optimize performance and user experience.

### 4.2 Proposed Enhanced Code Patch (`proposed_audioService.js`)

Below is the recommended enhancement for `src/services/audioService.js`:

```javascript
/**
 * Dual Audio TTS Service
 * Primary: Web Speech API (window.speechSynthesis)
 * Fallback: Google Translate TTS Stream (HTML5 Audio)
 */

let currentAudioElement = null;

/**
 * Builds standard Google Translate TTS stream URL
 * @param {string} text - Plain text word or sentence
 * @param {string} lang - Locale code (e.g., 'en-US')
 * @returns {string} Fully formatted stream URL
 */
export const buildGoogleTtsUrl = (text, lang = 'en-US') => {
  const cleanLang = (lang || 'en').split('-')[0] || 'en';
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.trim())}&tl=${cleanLang}&client=tw-ob`;
};

/**
 * Plays text using primary Web Speech API, with automatic Google TTS API stream fallback.
 * @param {string} text - Text to speak
 * @param {string} lang - Target language (default 'en-US')
 * @param {number} speed - Playback speed rate (default 0.9)
 * @returns {Promise<void>} Resolves when audio playback finishes
 */
export const playAudio = async (text, lang = 'en-US', speed = 0.9) => {
  stopAudio();

  if (!text || typeof text !== 'string' || !text.trim()) {
    return;
  }

  const trimmed = text.trim();

  // Primary Engine: Web Speech API
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
    try {
      // Resume if browser TTS engine is in a stuck paused state
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      return await new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(trimmed);
        utterance.lang = lang;
        utterance.rate = speed;

        // Best-effort voice matching for English locale
        const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
        if (voices && voices.length > 0) {
          const matchedVoice = voices.find((v) => v.lang === lang || v.lang.startsWith(lang.split('-')[0]));
          if (matchedVoice) utterance.voice = matchedVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = () => {
          // Fallback to Google TTS on Web Speech API error
          playGoogleTtsFallback(trimmed, lang, speed).then(resolve);
        };

        window.speechSynthesis.speak(utterance);
      });
    } catch (err) {
      // Fall through to Google TTS fallback on exception
    }
  }

  // Fallback Engine: Google Translate TTS HTML5 Audio Stream
  return playGoogleTtsFallback(trimmed, lang, speed);
};

/**
 * Fallback audio playback using Google Translate TTS stream URL
 * @param {string} text - Plain text word or sentence
 * @param {string} lang - Language code
 * @param {number} speed - Playback speed rate
 * @returns {Promise<void>}
 */
const playGoogleTtsFallback = (text, lang, speed = 0.9) => {
  return new Promise((resolve) => {
    const url = buildGoogleTtsUrl(text, lang);
    if (typeof Audio !== 'undefined') {
      try {
        currentAudioElement = new Audio(url);
        currentAudioElement.playbackRate = speed;

        currentAudioElement.onended = () => {
          currentAudioElement = null;
          resolve();
        };

        currentAudioElement.onerror = () => {
          currentAudioElement = null;
          resolve();
        };

        currentAudioElement.play().catch(() => {
          currentAudioElement = null;
          resolve();
        });
      } catch (e) {
        currentAudioElement = null;
        resolve();
      }
    } else {
      resolve();
    }
  });
};

/**
 * Stops any currently active speech synthesis or HTML5 audio playback.
 */
export const stopAudio = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch (e) {}
    currentAudioElement = null;
  }
};

export default {
  playAudio,
  stopAudio,
  buildGoogleTtsUrl
};
```

---

## 5. Verification Method

### 5.1 Automated E2E Test Verification
1. Run the project master E2E test suite:
   ```powershell
   npm test
   ```
2. Invalidation condition: Any test failure in `test/tier1.test.js`, `test/tier2.test.js`, `test/tier3.test.js`, or `test/tier4.test.js`.
3. Expected Output:
   ```
   TOTAL TESTS EXECUTED : 67
   TOTAL PASSED         : 67
   TOTAL FAILED         : 0
   PASS RATE            : 100.0%
   ```

### 5.2 Manual Browser Verification Scenarios
1. **Catalog Word Playback**:
   - Navigate to Lexicon Catalog grid (`LexiconGrid.jsx`).
   - Click the audio speaker button on any word card (e.g. `ability`).
   - Verify speech audio plays at rate `0.85` and icon pulses during playback.
2. **Example Sentence Playback**:
   - Click "Play" on example sentence (e.g. `"She has the ability to pass the exam."`).
   - Verify full sentence plays at rate `0.9`.
3. **Fallback Simulation**:
   - In browser developer tools, override `window.speechSynthesis.speak = null`.
   - Click speaker button on card.
   - Verify fallback HTML5 Audio stream plays via Google TTS URL.
4. **Rapid Toggle Interruption**:
   - Click speaker buttons rapidly on 3 different cards in succession.
   - Verify previous audio stops cleanly without overlapping speech output.
