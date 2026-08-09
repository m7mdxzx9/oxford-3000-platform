# Handoff Report: Milestone 3 Dual Audio TTS Engine Exploration

**Agent Role**: Explorer 1 (`explorer_m3_1`)  
**Milestone**: Milestone 3 (Dual Audio TTS Engine)  
**Target File**: `src/services/audioService.js`  
**Working Directory**: `c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m3_1\`  
**Date**: August 4, 2026  

---

## 1. Observation

### Codebase Status
1. **`src/services/audioService.js`**:
   - Currently contains a baseline implementation that exports `playAudio`, `stopAudio`, and `buildGoogleTtsUrl`.
   - **Gaps Identified**:
     - Does NOT export `isAudioPlaying()` as required by the spec.
     - `playGoogleTtsFallback()` does NOT return a Promise that waits for HTML5 `Audio` `onended` / `onerror` events.
     - `playGoogleTtsFallback()` does NOT set `playbackRate = speed` on HTML5 Audio element.
     - `stopAudio()` does NOT resolve/cleanup active pending Promises from `playAudio()`.
     - Does NOT query or set matching voices via `window.speechSynthesis.getVoices()`.
2. **`src/components/LexiconGrid.jsx`**:
   - Uses `playAudio(wordObj.word, 'en-US', 0.85)` and `playAudio(wordObj.example, 'en-US', 0.9)`.
   - Relies on `await playAudio(...)` returning a Promise that resolves when audio completes.
3. **`test/tier1.test.js` & `test/tier2.test.js`**:
   - Tier 1 test `T1.F2.1` tests Web Speech API parameter passing (`text`, `lang`).
   - Tier 1 test `T1.F2.2` tests `buildGoogleTtsUrl` URL formatting.
   - Tier 2 test `T2.F2.1` tests whitespace/empty text handling.
   - Tier 2 test `T2.F2.4` tests fallback behavior when `global.window.speechSynthesis` is absent.

---

## 2. Logic Chain

1. **Dual Engine Architecture**:
   - Primary: Web Speech API (`window.speechSynthesis` / `SpeechSynthesisUtterance`). Provides native, low-latency, offline-capable voice synthesis with controllable rates (`utterance.rate`).
   - Secondary / Fallback: Google Translate TTS stream URL (`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${cleanLang}&client=tw-ob`) loaded into HTML5 `Audio` element when Web Speech API fails, errors (`utterance.onerror`), or is unsupported.
2. **Promise-Based API**:
   - `playAudio(text, lang, speed)` must return a `Promise<void>` that resolves ONLY when audio playback finishes (or is interrupted/errored).
   - Both engines wrap playback event listeners (`onend` for Web Speech, `onended` for HTML5 Audio) to trigger Promise resolution.
3. **Preemption & State Management**:
   - Preemption: Invoking `playAudio(...)` or `stopAudio()` immediately stops previous Web Speech synthesis (`window.speechSynthesis.cancel()`) and pauses/resets HTML5 `Audio` instance.
   - State Querying: `isAudioPlaying()` evaluates internal `isPlaying` flag, `window.speechSynthesis.speaking`, and active `currentAudioElement.paused`.

---

## 3. Caveats & Edge Cases

- **Voice Availability**: `window.speechSynthesis.getVoices()` may return an empty array initially in browsers where voices load asynchronously. The voice selection helper falls back gracefully to default utterance behavior if voices array is empty.
- **Autoplay Policies**: Browsers may restrict HTML5 Audio `play()` if triggered outside a user interaction context. Intercepting `play()` Promise rejection prevents unhandled promise exceptions.
- **Clean Language Code Extractor**: Google Translate TTS API expects 2-letter ISO language codes (`en`, `es`, `fr`). `lang.split('-')[0]` extracts `'en'` from `'en-US'` or `'en-GB'`.

---

## 4. Conclusion & Next Steps for Implementer Worker

The technical design document is located at:
`c:\Users\HP\Downloads\English\oxford-3000-platform\.agents\explorer_m3_1\analysis.md`

### Actionable Plan for Implementer:
1. Update `src/services/audioService.js` with the full implementation defined in `analysis.md` Section 4.
2. Ensure exported surface contains:
   - `playAudio(text, lang = 'en-US', speed = 0.9)` -> `Promise<void>`
   - `stopAudio()` -> `void`
   - `isAudioPlaying()` -> `boolean`
   - `buildGoogleTtsUrl(text, lang = 'en-US')` -> `string`
   - default export `{ playAudio, stopAudio, isAudioPlaying, buildGoogleTtsUrl }`
3. Execute tests to verify compliance.

---

## 5. Verification Method

- **Automated Tests**:
  - Run `node test/tier1.test.js` or `node test/e2e-runner.js` to execute unit and feature tests.
- **Manual Verification**:
  - Click word audio icon on `LexiconGrid` card -> verify speech plays at 0.85x speed.
  - Click example sentence audio icon -> verify speech plays at 0.9x speed.
  - Call `stopAudio()` while audio is playing -> verify audio halts immediately and `isAudioPlaying()` returns `false`.
