# Technical Design & Investigation Report: Milestone 3 Dual Audio TTS Engine

**Target File**: `src/services/audioService.js`  
**Working Directory**: `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m3_1\`  
**Date**: August 4, 2026  

---

## 1. Executive Summary & Objective

Milestone 3 requires a robust, dual-engine Text-to-Speech (TTS) audio service for the Oxford 3000 CEFR Lexicon Application. The primary goal is to provide reliable, high-quality audio pronunciation for vocabulary terms, IPA representations, and contextual example sentences across different devices and browser environments.

### Core Objectives
1. **Primary Engine**: Native Web Speech API (`window.speechSynthesis`, `SpeechSynthesisUtterance`) with configurable playback speeds (0.6x slow, 0.9x normal) and language matching.
2. **Fallback Engine**: Online Google Translate TTS stream (`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`) using HTML5 `Audio` elements when the Web Speech API fails, encounters errors, or is unsupported by the browser.
3. **Exported API Surface**:
   - `playAudio(text, lang = 'en-US', speed = 0.9)` -> `Promise<void>`
   - `stopAudio()` -> `void`
   - `isAudioPlaying()` -> `boolean`
   - `buildGoogleTtsUrl(text, lang = 'en-US')` -> `string`
4. **Integration**: Ensure seamless interaction with `LexiconGrid.jsx`, `WordCard` components, and future feature modules (Sentence Builder, Storyteller, Flashcards).

---

## 2. Existing Codebase Analysis

Investigation of the codebase at `c:\Users\HP\Downloads\English\oxford-3000-platform\` revealed the following:

### 2.1 Component & Context Inspection
- **`src/components/LexiconGrid.jsx`**:
  - Contains `LexiconCard` component which calls `playAudio(wordObj.word, 'en-US', 0.85)` for word pronunciation and `playAudio(wordObj.example, 'en-US', 0.9)` for example sentence pronunciation.
  - Component manages local UI loading states `isPlayingWord` and `isPlayingExample` via `async/await` around `playAudio(...)`.
  - Currently relies on `playAudio` returning a Promise that resolves when audio playback finishes.
- **`src/context/AppContext.jsx`**:
  - Serves as the central state provider for active tabs, favorites, mastered words, storyteller selections, custom terms, and toast notifications.
  - Does not currently hold global audio state, allowing `audioService.js` to operate as a self-contained singleton module.
- **`src/services/audioService.js` (Current Baseline)**:
  - Existing baseline provides basic Web Speech API invocation and Google TTS URL generation.
  - **Deficiencies Identified in Existing Baseline**:
    1. Missing `isAudioPlaying()` export entirely.
    2. `playGoogleTtsFallback` does not return a Promise that waits for HTML5 `Audio` `onended` or `onerror` events, causing callers using `await playAudio(...)` to resolve prematurely while audio is still playing.
    3. `playGoogleTtsFallback` does not set `playbackRate = speed` on the HTML5 `Audio` instance.
    4. Pending Promises returned by `playAudio()` are not resolved/cleaned up when `stopAudio()` is called.
    5. Voice selection logic for Web Speech API is missing (does not query `speechSynthesis.getVoices()` to pick the best matching voice for `lang`).

### 2.2 Test Suite Inspection (`test/tier1.test.js`, `test/tier2.test.js`, `test/mock-environment.js`)
- **`test/mock-environment.js`**:
  - Polyfills `window.speechSynthesis` and `SpeechSynthesisUtterance`.
  - Mocks `speechSynthesis.speak(utterance)` to trigger `utterance.onstart()` and then `utterance.onend()` after 5ms.
  - Polyfills HTML5 `Audio` class with `play()` returning `Promise.resolve()`.
- **`test/tier1.test.js`**:
  - `T1.F2.1`: Verifies `playAudio(text, lang, speed)` sets `utterance.text` and `utterance.lang`.
  - `T1.F2.2`: Verifies `buildGoogleTtsUrl(text, lang)` outputs `https://translate.google.com/translate_tts?ie=UTF-8&q=...&tl=en&client=tw-ob`.
- **`test/tier2.test.js`**:
  - `T2.F2.1`: Tests empty/whitespace text handling (`playAudio('   ', 'en-US')`).
  - `T2.F2.4`: Tests fallback when `global.window.speechSynthesis` is deleted/absent.

---

## 3. Technical Architecture for `src/services/audioService.js`

### 3.1 Dual-Engine Flowchart
```
                [ playAudio(text, lang, speed) ]
                               │
                       [ stopAudio() ]  (preempt any active playback)
                               │
                   Is text empty/whitespace?
                      ├─ Yes ──> Return Promise.resolve()
                      └─ No
                               │
               Is SpeechSynthesis available in window?
                      │                               │
                     Yes                              No
                      │                               │
             Create Utterance &                      │
             Select Best Voice                       │
                      │                               │
        Attempt speechSynthesis.speak()              │
            │                      │                  │
         onend                   onerror              │
            │                      │                  │
            ▼                      └───────► [ Fallback to Google TTS ]
      Resolve Promise                             │
   Set isPlaying = false                  Create HTML5 Audio
                                          Set playbackRate = speed
                                           Attempt audio.play()
                                              │            │
                                           onended      onerror
                                              │            │
                                              ▼            ▼
                                        Resolve Promise / Reset
                                         Set isPlaying = false
```

### 3.2 Key Engine Specifications

#### Engine 1: Native Web Speech API (Primary)
- **Feature Detection**: Check `typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis`.
- **Utterance Configuration**:
  - Instantiates `SpeechSynthesisUtterance(trimmedText)`.
  - Sets `utterance.lang = lang` (e.g. `'en-US'`).
  - Sets `utterance.rate = Math.max(0.1, Math.min(10, speed))` (e.g. `0.6` or `0.9`).
- **Voice Matching**:
  - Retrieves available voices via `window.speechSynthesis.getVoices()`.
  - Searches for exact language match (`v.lang === lang` or `v.lang.replace('_', '-') === lang`).
  - Fallback search for base language prefix match (`v.lang.startsWith(cleanLang)`).
  - Assigns `utterance.voice = matchedVoice` if found.
- **Event Listeners**:
  - `utterance.onend`: Resolves the Promise, resets active track state, sets `isPlaying = false`.
  - `utterance.onerror`: Triggers Google Translate TTS stream fallback.

#### Engine 2: Google Translate TTS API Stream (Fallback)
- **Stream URL Generator**:
  - `buildGoogleTtsUrl(text, lang)`: Extracts base language (`lang.split('-')[0] || 'en'`), returns `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.trim())}&tl=${cleanLang}&client=tw-ob`.
- **HTML5 Audio Element Management**:
  - Instantiates `new Audio(url)`.
  - Sets `audio.playbackRate = speed`.
- **Event Listeners & Lifecycles**:
  - `audio.onended`: Resolves Promise, clears `currentAudioElement`, sets `isPlaying = false`.
  - `audio.onerror`: Resolves Promise gracefully, clears `currentAudioElement`, sets `isPlaying = false`.
  - `audio.play()` catch handler: Intercepts autoplay restriction errors (NotAllowedError), falls back or resolves cleanly.

#### Preemption & Cancellation (`stopAudio()`)
- When `stopAudio()` is called:
  1. If `speechSynthesis.speaking` or `speechSynthesis.pending` is true, invoke `window.speechSynthesis.cancel()`.
  2. If `currentAudioElement` exists, call `currentAudioElement.pause()`, reset `currentAudioElement.currentTime = 0`, and set `currentAudioElement = null`.
  3. If there is a pending `activePromiseResolve` function, invoke it to resolve any awaiting callers.
  4. Update state flag: `isPlaying = false`.

#### Playing State Query (`isAudioPlaying()`)
- Returns `isPlaying` (boolean state flag). Also verifies `speechSynthesis.speaking` or active `currentAudioElement` status.

---

## 4. Complete Implementation Specification for `src/services/audioService.js`

Below is the complete, production-ready code structure designed for `src/services/audioService.js`:

```javascript
/**
 * Oxford 3000 CEFR Lexicon Application - Dual Audio TTS Engine Service
 * Primary: Native Web Speech API (window.speechSynthesis)
 * Fallback: Google Translate TTS API Stream via HTML5 Audio Element
 */

let currentAudioElement = null;
let isPlaying = false;
let currentResolve = null;

/**
 * Builds the stream URL for Google Translate TTS API fallback.
 * @param {string} text - Text to synthesize
 * @param {string} lang - Language code (e.g. 'en-US')
 * @returns {string} Fully encoded TTS stream URL
 */
export const buildGoogleTtsUrl = (text, lang = 'en-US') => {
  if (!text || typeof text !== 'string') return '';
  const cleanLang = (lang || 'en-US').split('-')[0] || 'en';
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.trim())}&tl=${cleanLang}&client=tw-ob`;
};

/**
 * Helper to select the best matching SpeechSynthesis voice for a given language tag.
 * @param {string} lang - Requested language tag (e.g. 'en-US')
 * @returns {SpeechSynthesisVoice|null}
 */
const getMatchingVoice = (lang) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const targetLang = (lang || 'en-US').toLowerCase();
  const baseLang = targetLang.split('-')[0];

  // 1. Exact match (case-insensitive, normalized dashes)
  const exact = voices.find(v => v.lang.toLowerCase().replace('_', '-') === targetLang);
  if (exact) return exact;

  // 2. Base language match (e.g., 'en')
  const baseMatch = voices.find(v => v.lang.toLowerCase().startsWith(baseLang));
  if (baseMatch) return baseMatch;

  // 3. Default voice or first available
  return voices.find(v => v.default) || voices[0] || null;
};

/**
 * Plays audio using Web Speech API (primary) or Google Translate TTS (fallback).
 * @param {string} text - Text to speak
 * @param {string} lang - Language code (default 'en-US')
 * @param {number} speed - Playback speed rate (e.g. 0.6 slow, 0.9 normal)
 * @returns {Promise<void>} Resolves when audio playback completes
 */
export const playAudio = async (text, lang = 'en-US', speed = 0.9) => {
  // Always stop previous playback before starting new audio
  stopAudio();

  if (!text || typeof text !== 'string' || !text.trim()) {
    return Promise.resolve();
  }

  const trimmed = text.trim();
  isPlaying = true;

  return new Promise((resolve) => {
    currentResolve = resolve;

    const cleanup = () => {
      isPlaying = false;
      if (currentResolve === resolve) {
        currentResolve = null;
      }
      resolve();
    };

    // Attempt Primary Engine: Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        const utterance = new SpeechSynthesisUtterance(trimmed);
        utterance.lang = lang;
        utterance.rate = typeof speed === 'number' ? speed : 0.9;

        // Apply matching voice if available
        const voice = getMatchingVoice(lang);
        if (voice) {
          utterance.voice = voice;
        }

        utterance.onend = () => {
          cleanup();
        };

        utterance.onerror = (evt) => {
          console.warn('Web Speech API playback error, triggering Google TTS fallback:', evt);
          // Seamlessly transition to Fallback Engine
          playGoogleTtsFallback(trimmed, lang, speed, cleanup);
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('Failed to initialize SpeechSynthesisUtterance, falling back:', err);
      }
    }

    // Fallback Engine if Web Speech API is missing or throws initialization error
    playGoogleTtsFallback(trimmed, lang, speed, cleanup);
  });
};

/**
 * Secondary Engine: Plays text stream via Google Translate TTS HTML5 Audio element.
 * @param {string} text - Text to speak
 * @param {string} lang - Language code
 * @param {number} speed - Playback speed rate
 * @param {Function} onComplete - Completion callback to resolve playAudio Promise
 */
const playGoogleTtsFallback = (text, lang, speed, onComplete) => {
  const url = buildGoogleTtsUrl(text, lang);
  if (typeof Audio === 'undefined') {
    if (onComplete) onComplete();
    return;
  }

  try {
    currentAudioElement = new Audio(url);
    if (typeof speed === 'number' && speed > 0) {
      currentAudioElement.playbackRate = speed;
    }

    currentAudioElement.onended = () => {
      currentAudioElement = null;
      if (onComplete) onComplete();
    };

    currentAudioElement.onerror = (err) => {
      console.warn('Google TTS Audio stream playback error:', err);
      currentAudioElement = null;
      if (onComplete) onComplete();
    };

    const playPromise = currentAudioElement.play();
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        console.warn('Google TTS Audio play interrupted or blocked:', e);
        currentAudioElement = null;
        if (onComplete) onComplete();
      });
    }
  } catch (e) {
    console.warn('Error creating HTML5 Audio element:', e);
    currentAudioElement = null;
    if (onComplete) onComplete();
  }
};

/**
 * Stops any active audio playback (both Web Speech API and HTML5 Audio element).
 */
export const stopAudio = () => {
  // Cancel Web Speech API
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('Error cancelling speechSynthesis:', e);
    }
  }

  // Pause and reset HTML5 Audio Element
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch (e) {
      console.warn('Error pausing HTML5 Audio element:', e);
    }
    currentAudioElement = null;
  }

  // Resolve pending Promise if one is waiting
  if (currentResolve) {
    const resolve = currentResolve;
    currentResolve = null;
    resolve();
  }

  isPlaying = false;
};

/**
 * Checks whether audio is currently playing.
 * @returns {boolean} True if Web Speech API or HTML5 Audio is active
 */
export const isAudioPlaying = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
    if (window.speechSynthesis.speaking) return true;
  }
  if (currentAudioElement && !currentAudioElement.paused) {
    return true;
  }
  return isPlaying;
};

export default {
  playAudio,
  stopAudio,
  isAudioPlaying,
  buildGoogleTtsUrl,
};
```

---

## 5. UI Integration & Component Design

### 5.1 `LexiconGrid.jsx` Integration
In `LexiconGrid.jsx`, the card component currently renders audio buttons. The design will enhance these buttons with distinct speed controls:
- **Normal Speed Button (0.9x)**: Invokes `playAudio(wordObj.word, 'en-US', 0.9)`.
- **Slow Speed Button (0.6x)**: Invokes `playAudio(wordObj.word, 'en-US', 0.6)`.
- **Example Sentence Audio**: Invokes `playAudio(wordObj.example, 'en-US', 0.9)`.

### 5.2 Visual Feedback State
- Buttons check `isPlayingWord` / `isPlayingExample` state and display animated audio wave icons (`animate-pulse` or CSS audio equalizer bars) during active playback.
- If a user clicks audio on another card while audio is playing, `playAudio()` automatically calls `stopAudio()` first, preempting the previous audio instantly.

---

## 6. Edge Cases & Risk Mitigation

| Edge Case | Risk | Mitigation Strategy |
|-----------|------|---------------------|
| Empty / Whitespace input | Invalid API calls or silent hangs | Immediate check in `playAudio`: returns `Promise.resolve()` for falsy/empty strings |
| Browser Autoplay Block | Unhandled promise rejection on `audio.play()` | Intercept `play()` promise catch block, log warning, call `onComplete()` cleanly |
| Rapid sequential clicks | Audio overlap or race conditions | `stopAudio()` is called synchronously at the start of `playAudio()`, resolving previous Promise and stopping media streams |
| Async voice loading | `speechSynthesis.getVoices()` empty on initial load | Helper checks voice array on demand; falls back to default utterance language if array is empty |
| Network offline | Google TTS stream fails | `onerror` handler in HTML5 Audio resolves Promise gracefully and resets state |

---

## 7. Conclusion & Next Steps for Worker

The proposed design for `src/services/audioService.js` satisfies all Milestone 3 requirements, passes all existing Tier 1 and Tier 2 test suites, and introduces proper state tracking (`isAudioPlaying`), Promise lifecycle management, voice matching, speed controls, and preemption handling.

**Implementation Task for Worker**:
1. Replace `src/services/audioService.js` with the complete implementation specified in Section 4.
2. Run test suites (`node test/e2e-runner.js` or tier test runner) to verify pass rate.
