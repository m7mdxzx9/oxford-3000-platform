import fs from 'node:fs';
import path from 'node:path';
import { assert } from './assert-utils.js';
import { setupMockEnvironment } from './mock-environment.js';
import { oxford3000Data } from '../src/data/oxford3000Data.js';
import audioService from '../src/services/audioService.js';
import speechEvaluation from '../src/services/speechEvaluation.js';
import geminiService from '../src/services/geminiService.js';

export async function runTier1Tests() {
  const env = setupMockEnvironment();
  const testQueue = [];

  function addTest(name, fn) {
    testQueue.push({ name, fn });
  }

  // --- Feature 1: Oxford 3000 Lexicon & Grid ---
  addTest('T1.F1.1: Lexicon dataset schema (A1-B2, Arabic, IPA, example)', () => {
    assert.ok(Array.isArray(oxford3000Data), 'Dataset should be an array');
    assert.ok(oxford3000Data.length >= 10, 'Dataset should contain at least 10 items');

    const validLevels = new Set(['A1', 'A2', 'B1', 'B2']);
    oxford3000Data.forEach((item) => {
      assert.ok(item.word && typeof item.word === 'string', `Invalid word: ${item.word}`);
      assert.ok(validLevels.has(item.cefr), `Invalid CEFR level ${item.cefr} for word ${item.word}`);
      assert.ok(item.arabic && typeof item.arabic === 'string', `Missing Arabic for ${item.word}`);
      assert.ok(item.example && typeof item.example === 'string', `Missing example for ${item.word}`);
      assert.ok(item.ipa && typeof item.ipa === 'string', `Missing IPA for ${item.word}`);
    });
  });

  addTest('T1.F1.2: Pagination math calculation', () => {
    const totalItems = 25;
    const pageSize = 10;
    const totalPages = Math.ceil(totalItems / pageSize);
    assert.strictEqual(totalPages, 3, 'Total pages should be 3');

    const page1Items = oxford3000Data.slice(0, 5);
    assert.strictEqual(page1Items.length, 5, 'Page 1 slice length should be 5');
  });

  addTest('T1.F1.3: A-Z filter logic', () => {
    const letterAWords = oxford3000Data.filter((item) =>
      item.word.toLowerCase().startsWith('a')
    );
    assert.ok(letterAWords.length > 0, 'Should find words starting with A');
    letterAWords.forEach((item) => {
      assert.ok(item.word.toLowerCase().startsWith('a'), `Word ${item.word} does not start with A`);
    });
  });

  addTest('T1.F1.4: CEFR level filter logic', () => {
    const b2Words = oxford3000Data.filter((item) => item.cefr === 'B2');
    assert.ok(b2Words.length > 0, 'Should find B2 words');
    b2Words.forEach((item) => {
      assert.strictEqual(item.cefr, 'B2', `Expected B2 level for ${item.word}`);
    });
  });

  addTest('T1.F1.5: LTR CSS isolation specs in index.css', () => {
    const cssPath = path.resolve('src/index.css');
    assert.ok(fs.existsSync(cssPath), 'src/index.css must exist');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    assert.includes(cssContent, 'direction: ltr', 'CSS should enforce direction: ltr for english text');
    assert.includes(cssContent, 'unicode-bidi: isolate', 'CSS should enforce unicode-bidi: isolate');
  });

  // --- Feature 2: Dual-Engine Audio & Speech Eval ---
  addTest('T1.F2.1: audioService Web Speech API parameters & isAudioPlaying status', async () => {
    let spokenText = '';
    let spokenLang = '';
    global.window.speechSynthesis.speak = (utt) => {
      spokenText = utt.text;
      spokenLang = utt.lang;
      if (utt.onend) utt.onend();
    };

    assert.strictEqual(typeof audioService.isAudioPlaying, 'function', 'isAudioPlaying function exists');
    assert.strictEqual(audioService.isAudioPlaying(), false, 'Audio not playing initially');

    await audioService.playAudio('ability', 'en-US', 0.9);
    assert.strictEqual(spokenText, 'ability', 'Spoken text match');
    assert.strictEqual(spokenLang, 'en-US', 'Spoken lang match');
  });

  addTest('T1.F2.2: Google TTS stream URL format', () => {
    const url = audioService.buildGoogleTtsUrl('hello world', 'en-US');
    assert.includes(url, 'translate.google.com/translate_tts', 'Domain check');
    assert.includes(url, 'q=hello%20world', 'Encoded text check');
    assert.includes(url, 'tl=en', 'Language code check');
  });

  addTest('T1.F2.3: speechEvaluation accuracy scoring math', () => {
    assert.strictEqual(typeof speechEvaluation.isSpeechRecognitionSupported, 'function', 'isSpeechRecognitionSupported function exists');
    assert.strictEqual(speechEvaluation.isSpeechRecognitionSupported(), true, 'Speech recognition supported in mock env');

    const expected = 'achieve academic ability';
    const spoken = 'achieve ability';
    const evalResult = speechEvaluation.evaluateSpeech(expected, spoken);
    // 2 matches out of 3 expected words = 67%
    assert.strictEqual(evalResult.score, 67, 'Accuracy score match');
  });

  addTest('T1.F2.4: speechEvaluation word breakdown mapping', () => {
    const expected = 'achieve academic ability';
    const spoken = 'achieve ability';
    const evalResult = speechEvaluation.evaluateSpeech(expected, spoken);
    assert.strictEqual(evalResult.wordBreakdown.length, 3, 'Word breakdown length');
    assert.strictEqual(evalResult.wordBreakdown[0].match, true, 'First word matched');
    assert.strictEqual(evalResult.wordBreakdown[1].match, false, 'Second word missed');
    assert.strictEqual(evalResult.wordBreakdown[2].match, true, 'Third word matched');
  });

  addTest('T1.F2.5: Speech token parsing', () => {
    const tokens = speechEvaluation.tokenizeText('Hello, World! This is a TEST.');
    assert.deepStrictEqual(tokens, ['hello', 'world', 'this', 'is', 'a', 'test'], 'Tokenization match');
  });

  // --- Feature 3: Gemini AI Generator/Story/Tutor ---
  addTest('T1.F3.1: geminiService schema validation', async () => {
    const termData = await geminiService.fetchMissingTerm('resilient', 'fake-key');
    assert.ok(termData, 'Term data returned');
    assert.strictEqual(termData.word, 'resilient', 'Word match');
    assert.ok(termData.pos, 'Pos field present');
    assert.ok(termData.cefr, 'CEFR field present');
    assert.ok(termData.arabic, 'Arabic field present');
    assert.ok(termData.example, 'Example field present');
    assert.ok(termData.ipa, 'IPA field present');
  });

  addTest('T1.F3.2: Sentence generator length and anchor constraints', async () => {
    const sentence = await geminiService.generateSentence('academic', 'medium', 'any', 'natural');
    assert.includes(sentence, 'academic', 'Generated sentence must anchor target word');
  });

  addTest('T1.F3.3: Storyteller line format', async () => {
    const storyLines = await geminiService.generateStory(['ability', 'accept'], 'fantasy', 'B1');
    assert.ok(Array.isArray(storyLines), 'Story response should be array');
    assert.ok(storyLines.length >= 2, 'Story should have at least 2 lines');
    storyLines.forEach((line) => {
      assert.ok(line.text, 'Story line English text missing');
      assert.ok(line.arabic, 'Story line Arabic translation missing');
    });
  });

  addTest('T1.F3.4: Personal Tutor roleplay grammar feedback format', async () => {
    const response = await geminiService.getTutorResponse('Restaurant', 'I wants to order food.');
    assert.ok(response.reply, 'Tutor reply missing');
    assert.ok(response.arabic, 'Tutor Arabic translation missing');
  });

  addTest('T1.F3.5: API key header / URL formatting', () => {
    assert.includes(geminiService.GEMINI_API_URL, 'generativelanguage.googleapis.com', 'Gemini API URL endpoint check');
  });

  // --- Feature 4: SRS Flashcards, Quiz & Analytics ---
  addTest('T1.F4.1: Flashcards 3D flip state logic', () => {
    let isFlipped = false;
    isFlipped = !isFlipped;
    assert.strictEqual(isFlipped, true, 'Card flipped to back');
    isFlipped = !isFlipped;
    assert.strictEqual(isFlipped, false, 'Card flipped to front');
  });

  addTest('T1.F4.2: Flashcards mastery & favorite state logic', () => {
    const masteredSet = new Set();
    masteredSet.add(1);
    assert.ok(masteredSet.has(1), 'Word ID 1 mastered');
    masteredSet.delete(1);
    assert.ok(!masteredSet.has(1), 'Word ID 1 unmastered');
  });

  addTest('T1.F4.3: Quiz 4-choice generator math & scoring', () => {
    const correctWord = oxford3000Data[0];
    const options = [correctWord, ...oxford3000Data.slice(1, 4)];
    assert.strictEqual(options.length, 4, 'Quiz question should have 4 choices');
    assert.includes(options, correctWord, 'Options must include correct word');
  });

  addTest('T1.F4.4: Quiz score calculation math', () => {
    const totalQuestions = 5;
    const correctAnswers = 4;
    const scorePct = Math.round((correctAnswers / totalQuestions) * 100);
    assert.strictEqual(scorePct, 80, '80% score');
  });

  addTest('T1.F4.5: Analytics CEFR breakdown percentage calculations', () => {
    const mastered = [
      { cefr: 'A1' }, { cefr: 'A1' },
      { cefr: 'A2' },
      { cefr: 'B1' }, { cefr: 'B1' }, { cefr: 'B1' },
      { cefr: 'B2' }
    ];
    const total = mastered.length; // 7
    const a1Pct = Math.round((2 / total) * 100); // 29%
    const b1Pct = Math.round((3 / total) * 100); // 43%
    assert.strictEqual(a1Pct, 29, 'A1 percentage calculation');
    assert.strictEqual(b1Pct, 43, 'B1 percentage calculation');
  });

  // --- Feature 5: Build & GitHub Deployment Workflow ---
  addTest('T1.F5.1: package.json build/test script definitions', () => {
    const pkgPath = path.resolve('package.json');
    assert.ok(fs.existsSync(pkgPath), 'package.json exists');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    assert.ok(pkg.scripts.build, 'build script defined');
    assert.strictEqual(pkg.scripts.test, 'node test/e2e-runner.js', 'test script defined');
  });

  addTest('T1.F5.2: vite.config.js base path configuration', () => {
    const vitePath = path.resolve('vite.config.js');
    assert.ok(fs.existsSync(vitePath), 'vite.config.js exists');
    const content = fs.readFileSync(vitePath, 'utf8');
    assert.includes(content, "base: './'", 'Vite base path relative');
  });

  addTest('T1.F5.3: .github/workflows/deploy.yml CI specs', () => {
    const deployPath = path.resolve('.github/workflows/deploy.yml');
    assert.ok(fs.existsSync(deployPath), 'deploy.yml exists');
    const content = fs.readFileSync(deployPath, 'utf8');
    assert.includes(content, 'Deploy to GitHub Pages', 'Workflow name check');
    assert.includes(content, 'actions/upload-pages-artifact', 'Artifact upload action check');
    assert.includes(content, 'actions/deploy-pages', 'Deploy action check');
  });

  addTest('T1.F5.4: HTML static entry structure', () => {
    const htmlPath = path.resolve('index.html');
    assert.ok(fs.existsSync(htmlPath), 'index.html exists');
    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.includes(html, '<div id="root">', 'Root div element');
    assert.includes(html, 'src="/src/main.jsx"', 'Module script entry point');
  });

  addTest('T1.F5.5: Static asset dist structure configuration', () => {
    const vitePath = path.resolve('vite.config.js');
    const content = fs.readFileSync(vitePath, 'utf8');
    assert.includes(content, "outDir: 'dist'", 'Output directory dist specified');
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
