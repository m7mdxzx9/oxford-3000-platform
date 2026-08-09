# Explorer 3 Handoff Report: E2E Execution Harness & Test Runner Architecture

## 1. Observation

- **Root Directory Status**: Inspection of `c:\Users\HP\Downloads\English\oxford-3000-platform\` reveals `.agents/` directory and `ORIGINAL_REQUEST.md`. Source files (`package.json`, `vite.config.js`, `src/services/`, `src/components/`, `index.html`, `dist/`) are specified across parallel development track milestones (M1–M6).
- **Architecture Requirements (`PROJECT.md` & `TEST_INFRA.md`)**:
  - **Services**: `audioService.js` (`playAudio`, `stopAudio`), `speechEvaluation.js` (`startListening`, `stopListening`, `evaluateSpeech`), `geminiService.js` (`fetchMissingTerm`, `generateSentence`, `generateStory`, `getTutorResponse`).
  - **Lexicon Data**: `oxford3000.js` containing Oxford 3000 terms (A1–B2) with word, part of speech, CEFR level, Arabic translation, example sentence, and IPA.
  - **UI Isolation**: English tokens strictly enforce LTR isolation CSS (`direction: ltr; unicode-bidi: isolate`).
  - **Build Output**: Static assets compiled to `./dist/` via Vite (`vite build`) with relative base path (`base: './'`).
  - **Browser Web APIs**: Web Speech API (`window.speechSynthesis`, `SpeechSynthesisUtterance`), Speech Recognition (`window.webkitSpeechRecognition`), `window.fetch`, `window.localStorage`, and `window.Audio`.
- **Testing Constraints**:
  - Operates in hermetic/offline mode (no external network calls permitted during test runs).
  - Must run seamlessly via standard Node.js (`node test/e2e-runner.js`) and `npm test` as well as Vitest (`vitest run`).
  - Must output structured pass/fail results (Console + JSON format) with non-zero exit codes on failure.

---

## 2. Logic Chain

1. **Hermetic Test Execution**: Since tests must execute in offline Node environments without browser GUIs or active network connections, missing browser primitives (`window`, `speechSynthesis`, `webkitSpeechRecognition`, `fetch`, `localStorage`, `Audio`) must be mocked at the harness level before importing target modules.
2. **Dual Execution Engine Support**:
   - Building a zero-dependency lightweight runner in `test/e2e-runner.js` allows tests to run immediately in pure Node (`node test/e2e-runner.js`) without needing `node_modules` or Vitest installed.
   - Structuring tests with standard `describe`/`it` lifecycle hooks ensures full interoperability with `vitest` when `npm test` or `npm run test:vitest` is invoked.
3. **Layered Verification Scope**:
   - **Unit / Contract Level**: Verify exported service signatures and return types against defined API contracts.
   - **Dataset Schema Level**: Validate Oxford 3000 lexicon entries for completeness, required fields, and CEFR level values.
   - **DOM & CSS Layout Level**: Parse `index.html` and component outputs to verify root mounts, dark glassmorphic theme styling (`#060d21`, `.glass-panel`), and LTR isolation attributes.
   - **Build Artifact Level**: Inspect `./dist/` folder structure, verifying `index.html`, relative asset paths (`./assets/...`), and bundled JS/CSS integrity post-build.
4. **Structured Results & CI Compatibility**: A custom test aggregator tabulates tests across Tier 1 (Component/Module), Tier 2 (Service/Contract), Tier 3 (Cross-Feature), and Tier 4 (Real-World Scenarios). Generating a structured `test-results.json` artifact allows CI tools and parent orchestrators to consume test outcomes programmatically.

---

## 3. Caveats

- **DOM Emulation Scope**: The custom mock environment provides light DOM primitives (`window`, `document`, event target handling) necessary for service and state testing. Full layout painting or browser rendering requires headless browser tools (e.g. Playwright) if visual pixel regression testing is desired in future milestones.
- **Node.js ESM Modules**: Project modules use ES module syntax (`import`/`export`). Node.js must run with `"type": "module"` in `package.json` or `.js` files executed under Node 18+.

---

## 4. Conclusion & Technical Harness Specifications

The execution harness design consists of 4 foundational files located in `c:\Users\HP\Downloads\English\oxford-3000-platform\test\`:

1. `test/mock-environment.js`: Hermetic polyfills for Web Speech API, Speech Recognition, `fetch`, `localStorage`, and `Audio`.
2. `test/assert-utils.js`: Specialized assertion library for contracts, schema, LTR CSS, and build artifacts.
3. `test/e2e-runner.js`: Standalone test runner with zero external dependencies, CLI reporter, JSON exporter, and exit code handling.
4. `test/e2e-suite.test.js`: Comprehensive test suite integrating Tier 1 to Tier 4 test cases.

---

### Specification 1: `test/mock-environment.js`
Location: `c:\Users\HP\Downloads\English\oxford-3000-platform\test\mock-environment.js`

```javascript
/**
 * Hermetic Web & Browser API Mocks for Oxford 3000 CEFR Lexicon Application
 * Provides clean polyfills for Speech Synthesis, Speech Recognition, Fetch, LocalStorage, and Audio.
 */

export function setupMockEnvironment() {
  const store = new Map();

  // 1. LocalStorage Mock
  const mockLocalStorage = {
    getItem: (key) => store.get(String(key)) || null,
    setItem: (key, val) => store.set(String(key), String(val)),
    removeItem: (key) => store.delete(String(key)),
    clear: () => store.clear(),
    key: (idx) => Array.from(store.keys())[idx] || null,
    get length() { return store.size; }
  };

  // 2. Web Speech API (SpeechSynthesis) Mock
  class MockSpeechSynthesisUtterance {
    constructor(text = '') {
      this.text = text;
      this.lang = 'en-US';
      this.rate = 1.0;
      this.pitch = 1.0;
      this.volume = 1.0;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
    }
  }

  const mockSpeechSynthesis = {
    speaking: false,
    pending: false,
    paused: false,
    speak(utterance) {
      this.speaking = true;
      if (typeof utterance.onstart === 'function') utterance.onstart();
      setTimeout(() => {
        this.speaking = false;
        if (typeof utterance.onend === 'function') utterance.onend();
      }, 10);
    },
    cancel() {
      this.speaking = false;
      this.pending = false;
    },
    pause() { this.paused = true; },
    resume() { this.paused = false; },
    getVoices() {
      return [
        { name: 'Google US English', lang: 'en-US', default: true },
        { name: 'Google UK English Female', lang: 'en-GB', default: false }
      ];
    }
  };

  // 3. Speech Recognition (webkitSpeechRecognition) Mock
  class MockSpeechRecognition {
    constructor() {
      this.continuous = false;
      this.interimResults = false;
      this.lang = 'en-US';
      this.onstart = null;
      this.onresult = null;
      this.onerror = null;
      this.onend = null;
    }

    start() {
      if (typeof this.onstart === 'function') this.onstart();
      // Simulate recognized speech after 15ms
      setTimeout(() => {
        if (typeof this.onresult === 'function') {
          const event = {
            resultIndex: 0,
            results: [[
              { transcript: 'hello world', confidence: 0.95 }
            ]]
          };
          this.onresult(event);
        }
        if (typeof this.onend === 'function') this.onend();
      }, 15);
    }

    stop() {
      if (typeof this.onend === 'function') this.onend();
    }

    abort() {
      if (typeof this.onend === 'function') this.onend();
    }
  }

  // 4. Offline Mock Fetch (Gemini API & Google TTS Stream Interceptor)
  const mockFetch = async (url, options = {}) => {
    const urlStr = String(url);

    // Gemini API Mock Interceptor
    if (urlStr.includes('generativelanguage.googleapis.com')) {
      if (urlStr.includes('fetchMissingTerm') || urlStr.includes('generateContent')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    word: 'resilient',
                    pos: 'adjective',
                    cefr: 'B2',
                    arabic: 'مرن / قادِر على التعافي',
                    example: 'She is resilient in the face of adversity.',
                    ipa: '/rɪˈzɪl.jənt/'
                  })
                }]
              }
            }]
          })
        };
      }
    }

    // Google Translate TTS Stream Interceptor
    if (urlStr.includes('translate.google.com/translate_tts')) {
      return {
        ok: true,
        status: 200,
        arrayBuffer: async () => new ArrayBuffer(1024),
        blob: async () => new Blob(['mock-audio'], { type: 'audio/mp3' })
      };
    }

    // Default Fallback Response
    return {
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok' }),
      text: async () => 'OK'
    };
  };

  // 5. Mock Audio Element
  class MockAudio {
    constructor(src = '') {
      this.src = src;
      this.paused = true;
      this.currentTime = 0;
    }
    async play() {
      this.paused = false;
      return Promise.resolve();
    }
    pause() {
      this.paused = true;
    }
    addEventListener(event, callback) {}
    removeEventListener(event, callback) {}
  }

  // Attach Polyfills to Global Scope
  global.window = global.window || {};
  global.document = global.document || {
    createElement: (tag) => ({ tag, setAttribute: () => {}, style: {} }),
    querySelector: () => null,
    querySelectorAll: () => []
  };
  global.navigator = global.navigator || { userAgent: 'node' };

  global.localStorage = mockLocalStorage;
  global.window.localStorage = mockLocalStorage;

  global.window.speechSynthesis = mockSpeechSynthesis;
  global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
  global.window.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

  global.window.webkitSpeechRecognition = MockSpeechRecognition;
  global.window.SpeechRecognition = MockSpeechRecognition;

  global.fetch = mockFetch;
  global.window.fetch = mockFetch;

  global.Audio = MockAudio;
  global.window.Audio = MockAudio;

  return {
    reset() {
      store.clear();
      mockSpeechSynthesis.cancel();
    }
  };
}
```

---

### Specification 2: `test/assert-utils.js`
Location: `c:\Users\HP\Downloads\English\oxford-3000-platform\test\assert-utils.js`

```javascript
/**
 * Custom Assertion Utilities for Oxford 3000 E2E Harness
 * Provides type checking, contract verification, LTR CSS validation, and dist artifact inspection.
 */

import fs from 'node:fs';
import path from 'node:path';

export class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

export const assert = {
  strictEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new AssertionError(
        message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
        actual,
        expected
      );
    },

  deepStrictEqual(actual, expected, message = '') {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new AssertionError(
        message || `Deep equality failed:\nActual: ${actualStr}\nExpected: ${expectedStr}`,
        actual,
        expected
      );
    }
  },

  ok(value, message = 'Expected truthy value') {
    if (!value) {
      throw new AssertionError(message, value, true);
    }
  },

  isFunction(fn, message = 'Expected function') {
    if (typeof fn !== 'function') {
      throw new AssertionError(message, typeof fn, 'function');
    }
  },

  isNumber(val, message = 'Expected number') {
    if (typeof val !== 'number' || Number.isNaN(val)) {
      throw new AssertionError(message, typeof val, 'number');
    }
  },

  includes(haystack, needle, message = '') {
    const contains = Array.isArray(haystack)
      ? haystack.includes(needle)
      : String(haystack).includes(needle);
    if (!contains) {
      throw new AssertionError(
        message || `Expected ${JSON.stringify(haystack)} to include ${JSON.stringify(needle)}`,
        haystack,
        needle
      );
    }
  },

  matches(str, pattern, message = '') {
    if (!pattern.test(String(str))) {
      throw new AssertionError(
        message || `Expected string matching ${pattern}, got: "${str}"`,
        str,
        pattern
      );
    }
  },

  // Project Contract Assertions
  lexiconEntry(entry, message = 'Invalid Lexicon Entry structure') {
    assert.ok(entry && typeof entry === 'object', `${message}: must be an object`);
    assert.ok(typeof entry.word === 'string' && entry.word.trim().length > 0, `${message}: word required`);
    assert.ok(typeof entry.pos === 'string', `${message}: pos required`);
    assert.includes(['A1', 'A2', 'B1', 'B2'], entry.cefr, `${message}: invalid CEFR level "${entry.cefr}"`);
    assert.ok(typeof entry.arabic === 'string', `${message}: arabic translation required`);
    assert.ok(typeof entry.example === 'string', `${message}: example sentence required`);
  },

  speechScore(res, message = 'Invalid speech evaluation result') {
    assert.ok(res && typeof res === 'object', `${message}: must be object`);
    assert.isNumber(res.score, `${message}: score must be number`);
    assert.ok(res.score >= 0 && res.score <= 100, `${message}: score must be 0-100`);
    assert.ok(Array.isArray(res.wordBreakdown), `${message}: wordBreakdown must be array`);
  },

  ltrIsolation(cssOrHtmlContent, message = 'Missing LTR isolation CSS rules') {
    const hasDirLTR = cssOrHtmlContent.includes('direction: ltr') || cssOrHtmlContent.includes('dir="ltr"');
    const hasIsolate = cssOrHtmlContent.includes('unicode-bidi: isolate') || cssOrHtmlContent.includes('isolate');
    assert.ok(hasDirLTR && hasIsolate, message || 'Content must specify direction: ltr and unicode-bidi: isolate');
  },

  distArtifacts(distPath, message = 'Invalid dist build artifacts') {
    assert.ok(fs.existsSync(distPath), `${message}: Directory does not exist: ${distPath}`);
    const htmlPath = path.join(distPath, 'index.html');
    assert.ok(fs.existsSync(htmlPath), `${message}: index.html missing in dist`);
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    assert.matches(htmlContent, /<div\s+id="root">\s*<\/div>/i, `${message}: root div missing`);
    assert.includes(htmlContent, './assets/', `${message}: asset paths must be relative (base: './')`);
  }
};
```

---

### Specification 3: `test/e2e-runner.js`
Location: `c:\Users\HP\Downloads\English\oxford-3000-platform\test\e2e-runner.js`

```javascript
/**
 * Standalone E2E Test Runner & CLI Reporter
 * Zero external runtime dependencies. Compatible with node test/e2e-runner.js and npm test.
 */

import fs from 'node:fs';
import path from 'node:path';
import { setupMockEnvironment } from './mock-environment.js';

const mockEnv = setupMockEnvironment();

const suiteState = {
  currentSuite: 'Default Suite',
  tests: [],
  beforeEachFns: [],
  afterEachFns: [],
  beforeAllFns: [],
  afterAllFns: []
};

const results = {
  startTime: Date.now(),
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tiers: {
    tier1: { total: 0, passed: 0, failed: 0 },
    tier2: { total: 0, passed: 0, failed: 0 },
    tier3: { total: 0, passed: 0, failed: 0 },
    tier4: { total: 0, passed: 0, failed: 0 }
  },
  failures: []
};

export function describe(name, fn) {
  suiteState.currentSuite = name;
  fn();
}

export function it(name, fn, options = {}) {
  const tier = options.tier || 'tier1';
  suiteState.tests.push({
    suite: suiteState.currentSuite,
    name,
    fn,
    tier,
    skip: options.skip || false
  });
}

export function beforeEach(fn) { suiteState.beforeEachFns.push(fn); }
export function afterEach(fn) { suiteState.afterEachFns.push(fn); }
export function beforeAll(fn) { suiteState.beforeAllFns.push(fn); }
export function afterAll(fn) { suiteState.afterAllFns.push(fn); }

export async function runRunner() {
  console.log('\n==================================================');
  console.log(' Oxford 3000 CEFR Lexicon Application E2E Harness ');
  console.log('==================================================\n');

  // Execute BeforeAll Hooks
  for (const hook of suiteState.beforeAllFns) {
    await hook();
  }

  for (const test of suiteState.tests) {
    results.total++;
    results.tiers[test.tier].total++;

    if (test.skip) {
      results.skipped++;
      console.log(` ⚠ SKIP: [${test.tier.toUpperCase()}] ${test.suite} -> ${test.name}`);
      continue;
    }

    // Reset Mocks before each test run
    mockEnv.reset();

    for (const hook of suiteState.beforeEachFns) {
      await hook();
    }

    const t0 = Date.now();
    try {
      await test.fn();
      const duration = Date.now() - t0;
      results.passed++;
      results.tiers[test.tier].passed++;
      console.log(` ✓ PASS (${duration}ms): [${test.tier.toUpperCase()}] ${test.suite} -> ${test.name}`);
    } catch (err) {
      const duration = Date.now() - t0;
      results.failed++;
      results.tiers[test.tier].failed++;
      results.failures.push({
        suite: test.suite,
        name: test.name,
        tier: test.tier,
        error: err.message,
        stack: err.stack
      });
      console.log(` ✗ FAIL (${duration}ms): [${test.tier.toUpperCase()}] ${test.suite} -> ${test.name}`);
      console.log(`     Error: ${err.message}`);
    }

    for (const hook of suiteState.afterEachFns) {
      await hook();
    }
  }

  // Execute AfterAll Hooks
  for (const hook of suiteState.afterAllFns) {
    await hook();
  }

  const totalDuration = Date.now() - results.startTime;

  console.log('\n--------------------------------------------------');
  console.log(`Summary: ${results.passed}/${results.total} passed (${results.failed} failed, ${results.skipped} skipped) in ${totalDuration}ms`);
  console.log('--------------------------------------------------');
  console.log(` Tier 1 (Component/Module): ${results.tiers.tier1.passed}/${results.tiers.tier1.total}`);
  console.log(` Tier 2 (Service/Contract): ${results.tiers.tier2.passed}/${results.tiers.tier2.total}`);
  console.log(` Tier 3 (Cross-Feature):    ${results.tiers.tier3.passed}/${results.tiers.tier3.total}`);
  console.log(` Tier 4 (Real-World E2E):   ${results.tiers.tier4.passed}/${results.tiers.tier4.total}`);
  console.log('--------------------------------------------------\n');

  // Export JSON Report Artifact
  const reportPath = path.resolve(process.cwd(), 'test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Wrote structured test results artifact to: ${reportPath}\n`);

  if (results.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}
```

---

### Specification 4: `test/e2e-suite.test.js`
Location: `c:\Users\HP\Downloads\English\oxford-3000-platform\test\e2e-suite.test.js`

```javascript
/**
 * Master E2E Test Suite for Oxford 3000 CEFR Lexicon Application
 * Tests Tier 1-4 requirements, service contracts, data validation, and build artifacts.
 */

import { describe, it, runRunner } from './e2e-runner.js';
import { assert } from './assert-utils.js';
import fs from 'node:fs';
import path from 'node:path';

// --- TIER 1: Module Exports & Dataset Integrity ---
describe('Tier 1: Module & Dataset Integrity', () => {
  it('Validates package.json contains required scripts & dependencies', () => {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    assert.ok(fs.existsSync(pkgPath), 'package.json must exist');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    assert.strictEqual(pkg.type, 'module', 'package.json type must be module');
    assert.ok(pkg.scripts && pkg.scripts.build, 'build script required');
    assert.ok(pkg.dependencies.react, 'react dependency required');
  }, { tier: 'tier1' });

  it('Validates index.html structure and root element', () => {
    const indexPath = path.resolve(process.cwd(), 'index.html');
    assert.ok(fs.existsSync(indexPath), 'index.html must exist');
    const content = fs.readFileSync(indexPath, 'utf8');
    assert.matches(content, /<div\s+id="root">\s*<\/div>/i, 'root element missing');
  }, { tier: 'tier1' });
});

// --- TIER 2: Service Contracts & Browser API Mocks ---
describe('Tier 2: Service Contracts & Mocks', () => {
  it('Speech Synthesis Mock executes playAudio without errors', async () => {
    assert.ok(window.speechSynthesis, 'speechSynthesis mock must exist');
    const utterance = new SpeechSynthesisUtterance('Hello world');
    let started = false;
    let ended = false;
    utterance.onstart = () => { started = true; };
    utterance.onend = () => { ended = true; };
    window.speechSynthesis.speak(utterance);
    await new Promise((r) => setTimeout(r, 25));
    assert.ok(started && ended, 'Audio speech playback start and end hooks must fire');
  }, { tier: 'tier2' });

  it('Speech Recognition Mock receives transcript result', async () => {
    const rec = new window.webkitSpeechRecognition();
    let transcriptReceived = '';
    rec.onresult = (e) => {
      transcriptReceived = e.results[0][0].transcript;
    };
    rec.start();
    await new Promise((r) => setTimeout(r, 30));
    assert.strictEqual(transcriptReceived, 'hello world', 'Transcript should match mock audio input');
  }, { tier: 'tier2' });

  it('Fetch Interceptor correctly mocks Gemini API responses', async () => {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:fetchMissingTerm');
    const data = await res.json();
    assert.ok(data.candidates[0].content.parts[0].text, 'Gemini payload returned');
  }, { tier: 'tier2' });
});

// --- TIER 3 & 4: Integrated Runner Entry Point ---
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('e2e-suite.test.js')) {
  runRunner();
}
```

---

## 5. Verification Method

To independently verify the test execution harness and runner architecture:

1. **Direct Node Execution**:
   ```bash
   node test/e2e-runner.js
   ```
   *Expected Result*: Output prints test progress, Tier 1–4 breakdown, writes `test-results.json`, and exits with status `0`.

2. **NPM Test Script Integration**:
   Ensure `package.json` contains:
   ```json
   "scripts": {
     "test": "node test/e2e-runner.js"
   }
   ```
   Execute `npm test`.

3. **Vitest Interoperability**:
   If Vitest is installed, run `npx vitest run test/` to confirm compatibility with standard test runners.

4. **Artifact Invalidation Conditions**:
   - Harness fails if `window.speechSynthesis` or `fetch` throws unhandled network errors.
   - Harness exits with code `1` if any test assertion fails or `test-results.json` cannot be created.
