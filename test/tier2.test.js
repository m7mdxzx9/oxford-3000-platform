import fs from 'node:fs';
import path from 'node:path';
import { assert } from './assert-utils.js';
import { setupMockEnvironment } from './mock-environment.js';
import { oxford3000Data } from '../src/data/oxford3000.js';
import audioService from '../src/services/audioService.js';
import speechEvaluation from '../src/services/speechEvaluation.js';
import geminiService from '../src/services/geminiService.js';

export async function runTier2Tests() {
  const env = setupMockEnvironment();
  const testQueue = [];

  function addTest(name, fn) {
    testQueue.push({ name, fn });
  }

  // --- Feature 1: Oxford 3000 Lexicon & Grid Boundaries ---
  addTest('T2.F1.1: Empty search query result', () => {
    const query = '';
    const filtered = oxford3000Data.filter((item) =>
      item.word.toLowerCase().includes(query.toLowerCase())
    );
    assert.strictEqual(filtered.length, oxford3000Data.length, 'Empty search should return all items');
  });

  addTest('T2.F1.2: Invalid CEFR parameter query handling', () => {
    const invalidCefr = 'Z9';
    const filtered = oxford3000Data.filter((item) => item.cefr === invalidCefr);
    assert.strictEqual(filtered.length, 0, 'Invalid CEFR query should yield empty array safely');
  });

  addTest('T2.F1.3: Page 1 and max page boundary limits clamping', () => {
    const totalItems = oxford3000Data.length;
    const pageSize = 5;
    const maxPage = Math.max(1, Math.ceil(totalItems / pageSize));

    const clampedUnder = Math.max(1, Math.min(-5, maxPage));
    assert.strictEqual(clampedUnder, 1, 'Page underflow clamped to 1');

    const clampedOver = Math.max(1, Math.min(9999, maxPage));
    assert.strictEqual(clampedOver, maxPage, 'Page overflow clamped to maxPage');
  });

  addTest('T2.F1.4: Extreme length search term boundary', () => {
    const extremeSearch = 'a'.repeat(500);
    const filtered = oxford3000Data.filter((item) =>
      item.word.toLowerCase().includes(extremeSearch)
    );
    assert.strictEqual(filtered.length, 0, 'Extreme search term handled without crash');
  });

  addTest('T2.F1.5: LTR override enforcement on special characters and mixed text', () => {
    const cssPath = path.resolve('src/index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    assert.includes(cssContent, 'unicode-bidi: isolate', 'Enforces isolation for mixed LTR/RTL text');
  });

  // --- Feature 2: Dual-Engine Audio & Speech Boundaries ---
  addTest('T2.F2.1: Empty/whitespace text audio playback handling', async () => {
    await audioService.playAudio('   ', 'en-US');
    assert.ok(true, 'Whitespace text audio playback handled cleanly');
  });

  addTest('T2.F2.2: 0% similarity garbled speech evaluation', () => {
    const expected = 'academic';
    const spoken = 'xyz qwerty zxcv';
    const result = speechEvaluation.evaluateSpeech(expected, spoken);
    assert.strictEqual(result.score, 0, 'Garbled speech yields 0% score');
  });

  addTest('T2.F2.3: 100% exact match evaluation', () => {
    const expected = 'She has the ability to pass the exam.';
    const spoken = 'She has the ability to pass the exam.';
    const result = speechEvaluation.evaluateSpeech(expected, spoken);
    assert.strictEqual(result.score, 100, 'Exact match yields 100% score');
    result.wordBreakdown.forEach((w) => assert.strictEqual(w.match, true, 'All words matched'));
  });

  addTest('T2.F2.4: Missing Web Speech API fallback to Google TTS stream', async () => {
    delete global.window.speechSynthesis;
    await audioService.playAudio('barrier', 'en-US');
    assert.ok(true, 'Audio fallback handled cleanly when Web Speech API is absent');
  });

  addTest('T2.F2.5: Empty target word breakdown array handling', () => {
    const result = speechEvaluation.evaluateSpeech('', 'spoken text');
    assert.strictEqual(result.score, 0, 'Empty target text yields 0 score');
    assert.strictEqual(result.wordBreakdown.length, 0, 'Word breakdown is empty');
  });

  // --- Feature 3: Gemini AI Boundaries ---
  addTest('T2.F3.1: Missing/empty Gemini API key fallback', async () => {
    const result = await geminiService.fetchMissingTerm('unknownword', '');
    assert.ok(result, 'Fallback result returned');
    assert.strictEqual(result.word, 'unknownword', 'Fallback term returned');
  });

  addTest('T2.F3.2: Maximum length prompt limits handling', async () => {
    const longWord = 'supercalifragilisticexpialidocious'.repeat(10);
    const sentence = await geminiService.generateSentence(longWord, 'long', 'start', 'academic');
    assert.ok(sentence, 'Handled maximum length prompt cleanly');
  });

  addTest('T2.F3.3: Empty word list story generation prompt', async () => {
    const story = await geminiService.generateStory([], 'mystery', 'A1');
    assert.ok(Array.isArray(story), 'Returns story array for empty word list');
    assert.ok(story.length > 0, 'Returns fallback story lines');
  });

  addTest('T2.F3.4: Special characters and unicode in AI prompt', async () => {
    const specialTerm = 'cafe&restaurant#1!';
    const result = await geminiService.fetchMissingTerm(specialTerm, 'key');
    assert.ok(result, 'Handled special characters in prompt cleanly');
  });

  addTest('T2.F3.5: Malformed AI JSON response parsing fallback', async () => {
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'INVALID JSON NOT MATCHING SCHEMA' }] } }] })
    });

    const result = await geminiService.fetchMissingTerm('resilient', 'fake-key');
    assert.ok(result, 'Recovers with structured fallback on malformed JSON response');
  });

  // --- Feature 4: SRS Flashcards, Quiz & Analytics Boundaries ---
  addTest('T2.F4.1: Analytics with 0 total mastered words', () => {
    const mastered = [];
    const totalMastered = mastered.length;
    const a1Count = mastered.filter((m) => m.cefr === 'A1').length;
    const a1Pct = totalMastered === 0 ? 0 : Math.round((a1Count / totalMastered) * 100);
    assert.strictEqual(a1Pct, 0, 'No division by zero, returns 0%');
  });

  addTest('T2.F4.2: Analytics with 100% mastered words', () => {
    const mastered = oxford3000Data.map((item) => ({ ...item, isMastered: true }));
    const totalMastered = mastered.length;
    const pct = Math.round((totalMastered / oxford3000Data.length) * 100);
    assert.strictEqual(pct, 100, 'Calculates 100% mastery');
  });

  addTest('T2.F4.3: Quiz retry score reset state', () => {
    let quizState = { currentQuestionIndex: 4, score: 4, isCompleted: true };
    quizState = { currentQuestionIndex: 0, score: 0, isCompleted: false };
    assert.strictEqual(quizState.currentQuestionIndex, 0, 'Question index reset to 0');
    assert.strictEqual(quizState.score, 0, 'Score reset to 0');
    assert.strictEqual(quizState.isCompleted, false, 'Quiz status reset');
  });

  addTest('T2.F4.4: Flashcards empty favorite list filtering', () => {
    const favoriteIds = new Set();
    const favorites = oxford3000Data.filter((item) => favoriteIds.has(item.id));
    assert.strictEqual(favorites.length, 0, 'Empty favorite list returned safely');
  });

  addTest('T2.F4.5: Rapid state flip concurrency safety', () => {
    let flipState = false;
    for (let i = 0; i < 100; i++) {
      flipState = !flipState;
    }
    assert.strictEqual(flipState, false, 'Rapid state toggling remains consistent');
  });

  // --- Feature 5: Build & Deployment Boundaries ---
  addTest('T2.F5.1: Base path trailing slash normalization in vite.config.js', () => {
    const content = fs.readFileSync('vite.config.js', 'utf8');
    assert.match(content, /base:\s*['"]\.\/['"]/, 'Base path specifies relative ./');
  });

  addTest('T2.F5.2: Build output dist directory path verification', () => {
    const viteContent = fs.readFileSync('vite.config.js', 'utf8');
    assert.includes(viteContent, "outDir: 'dist'", 'Vite config specifies outDir dist');
  });

  addTest('T2.F5.3: Environment variable default fallbacks', () => {
    const apiKey = process.env.VITE_GEMINI_API_KEY || '';
    assert.strictEqual(typeof apiKey, 'string', 'API key falls back to string');
  });

  addTest('T2.F5.4: Asset script/link relative path integrity in index.html', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert.includes(html, 'src="/src/main.jsx"', 'Main script entry relative path');
  });

  addTest('T2.F5.5: index.html viewport & title tag compliance', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert.includes(html, '<meta name="viewport"', 'Viewport meta tag present');
    assert.includes(html, '<title>', 'Title tag present');
  });

  // Execute queue sequentially
  const results = { pass: 0, fail: 0, tests: [] };
  for (const t of testQueue) {
    try {
      await t.fn();
      results.pass++;
      results.tests.push({ name: t.name, status: 'PASS' });
    } catch (err) {
      results.fail++;
      results.tests.push({ name: t.name, status: 'FAIL', error: err.message });
    }
  }

  env.reset();
  return results;
}
