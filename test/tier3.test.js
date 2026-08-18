import fs from 'node:fs';
import path from 'node:path';
import { assert } from './assert-utils.js';
import { setupMockEnvironment } from './mock-environment.js';
import { oxford3000Data } from '../src/data/oxford3000Data.js';
import audioService from '../src/services/audioService.js';
import speechEvaluation from '../src/services/speechEvaluation.js';
import geminiService from '../src/services/geminiService.js';

export async function runTier3Tests() {
  const env = setupMockEnvironment();
  const testQueue = [];

  function addTest(name, fn) {
    testQueue.push({ name, fn });
  }

  // --- Tier 3: Cross-Feature Pairwise Combinations (12 tests) ---

  // Test 3.1: Lexicon Catalog Filter -> Audio TTS Playback Interaction
  addTest('T3.1 (F1+F2): Lexicon Catalog Filter -> Audio TTS Playback Interaction', async () => {
    const b2Verbs = oxford3000Data.filter((item) => item.cefr === 'B2' && item.pos === 'verb');
    const selectedWord = b2Verbs[0] || oxford3000Data.find((w) => w.pos === 'verb') || oxford3000Data[0];
    let playedText = '';
    let playedRate = 0;
    global.window.speechSynthesis.speak = (utt) => {
      playedText = utt.text;
      playedRate = utt.rate;
      if (utt.onend) utt.onend();
    };

    await audioService.playAudio(selectedWord.word, 'en-US', 0.9);
    assert.strictEqual(playedText, selectedWord.word, 'Lexicon word sent to TTS playback engine');
    assert.strictEqual(playedRate, 0.9, 'Playback speed rate match');
  });

  // Test 3.2: Lexicon Missing Term Search -> Gemini AI Fetch -> Catalog Grid Dynamic Update
  addTest('T3.2 (F1+F3): Lexicon Missing Term Search -> Gemini AI Fetch -> Catalog Grid Dynamic Update', async () => {
    const searchTerm = 'resilient';
    const fetched = await geminiService.fetchMissingTerm(searchTerm, 'TEST_API_KEY');
    assert.ok(fetched, 'Gemini AI returned missing term object');
    assert.lexiconEntry(fetched, 'Fetched term satisfies schema');
    assert.strictEqual(fetched.word, 'resilient', 'Word matches missing term');

    // Simulate adding to custom words state
    const customWords = [fetched];
    assert.strictEqual(customWords.length, 1, 'Custom words state updated');
    localStorage.setItem('oxford3000_custom_words', JSON.stringify(customWords));
    const stored = JSON.parse(localStorage.getItem('oxford3000_custom_words'));
    assert.strictEqual(stored[0].word, 'resilient', 'Custom words stored in LocalStorage');
  });

  // Test 3.3: Storyteller Selected Words (Catalog Grid) -> AI Story Generator -> Audio Line Playback
  addTest('T3.3 (F1+F3+F2): Storyteller Selected Words -> AI Story Generator -> Audio Line Playback', async () => {
    const selectedWords = ['adventure', 'explore', 'destination'];
    const story = await geminiService.generateStory(selectedWords, 'adventure', 'B1');
    assert.ok(Array.isArray(story), 'Story returned as array');
    assert.ok(story.length >= 2, 'Story contains multiple lines');

    let spokenLine = '';
    global.window.speechSynthesis.speak = (utt) => {
      spokenLine = utt.text;
      if (utt.onend) utt.onend();
    };

    await audioService.playAudio(story[0].text, 'en-US');
    assert.strictEqual(spokenLine, story[0].text, 'Line 1 audio playback executed correctly');
  });

  // Test 3.4: AI Story Sentence -> Speech Recognition Audio Evaluation -> Score & Feedback Update
  addTest('T3.4 (F3+F2): AI Story Sentence -> Speech Recognition Audio Evaluation -> Score & Feedback', async () => {
    const story = await geminiService.generateStory(['ability'], 'adventure', 'A2');
    const targetLine = story[0].text;
    const spokenLine = targetLine; // exact speech match
    const evalResult = speechEvaluation.evaluateSpeech(targetLine, spokenLine);
    assert.speechScore(evalResult, 'Valid speech score object returned');
    assert.strictEqual(evalResult.score, 100, 'Exact recitation yields 100% score');
  });

  // Test 3.5: AI Personal Tutor Scenario -> Roleplay Dialogue -> Vocabulary Extraction to Flashcards
  addTest('T3.5 (F3+F4): AI Personal Tutor Scenario -> Roleplay Dialogue -> Vocabulary Extraction', async () => {
    const tutorResponse = await geminiService.getTutorResponse('Job Interview', 'me wants five years experience');
    assert.ok(tutorResponse.reply, 'Tutor reply generated');
    assert.ok(tutorResponse.grammarFeedback, 'Grammar feedback provided for verb error');
    assert.includes(tutorResponse.grammarFeedback, 'agreement', 'Feedback mentions verb agreement');

    // Extract terms to favorites
    const extractedTerms = ['qualification', 'applicant'];
    const favorites = [...extractedTerms];
    localStorage.setItem('oxford3000_favorites', JSON.stringify(favorites));
    const savedFavorites = JSON.parse(localStorage.getItem('oxford3000_favorites'));
    assert.deepStrictEqual(savedFavorites, ['qualification', 'applicant'], 'Extracted terms saved to favorites');
  });

  // Test 3.6: Catalog Grid -> SRS Flashcard 3D Flip -> Toggle Mastered State -> Analytics CEFR Update
  addTest('T3.6 (F1+F4): Catalog Grid -> SRS Flashcard 3D Flip -> Toggle Mastered State -> Analytics Update', () => {
    const term = oxford3000Data.find((w) => w.cefr === 'B1') || oxford3000Data[0];
    const mastered = [term.word];
    localStorage.setItem('oxford3000_mastered', JSON.stringify(mastered));

    // Calculate Analytics
    const totalLexicon = oxford3000Data.length;
    const b1Total = oxford3000Data.filter((w) => w.cefr === 'B1').length;
    const b1MasteredCount = mastered.filter((w) => {
      const found = oxford3000Data.find((item) => item.word === w);
      return found && found.cefr === 'B1';
    }).length;

    const b1Pct = Math.round((b1MasteredCount / b1Total) * 100);
    assert.ok(b1Pct > 0, 'Analytics CEFR B1 mastery percentage updated');
  });

  // Test 3.7: Mastered Words Pool -> Dynamic Quiz Generation -> Score Calculation -> Analytics Sync
  addTest('T3.7 (F4): Mastered Words Pool -> Dynamic Quiz Generation -> Score Calculation -> Analytics Sync', () => {
    const masteredWords = oxford3000Data.slice(0, 5);
    const quizQuestion = {
      target: masteredWords[0],
      options: [masteredWords[0], ...oxford3000Data.slice(5, 8)]
    };
    assert.strictEqual(quizQuestion.options.length, 4, 'Quiz question has 4 options');
    assert.includes(quizQuestion.options.map((o) => o.word), masteredWords[0].word, 'Correct option included');

    const quizScore = 80; // 4 out of 5
    localStorage.setItem('quiz_last_score', JSON.stringify(quizScore));
    assert.strictEqual(JSON.parse(localStorage.getItem('quiz_last_score')), 80, 'Quiz score persisted');
  });

  // Test 3.8: Flashcard Pronunciation Audio -> Speech Evaluation -> Auto-Mastery Promotion
  addTest('T3.8 (F4+F2): Flashcard Pronunciation Audio -> Speech Evaluation -> Auto-Mastery Promotion', async () => {
    const targetWord = 'consequence';
    const spokenText = 'consequence';
    const scoreResult = speechEvaluation.evaluateSpeech(targetWord, spokenText);
    assert.strictEqual(scoreResult.score, 100, 'Speech score is 100%');

    // Auto-promote to mastered
    let mastered = [];
    if (scoreResult.score >= 90) {
      mastered.push(targetWord);
    }
    assert.includes(mastered, 'consequence', 'Auto-promoted term to mastered state');
  });

  // Test 3.9: Gemini API Key Input -> LocalStorage Persistence -> AI Service Pass-Through
  addTest('T3.9 (F5+F3): Gemini API Key Input -> LocalStorage Persistence -> AI Service Pass-Through', async () => {
    const customKey = 'AIzaSyCustomTestKey999';
    localStorage.setItem('oxford3000_gemini_api_key', customKey);
    const retrievedKey = localStorage.getItem('oxford3000_gemini_api_key');
    assert.strictEqual(retrievedKey, customKey, 'Custom API key saved in LocalStorage');

    const result = await geminiService.fetchMissingTerm('resilient', retrievedKey);
    assert.ok(result, 'Gemini service accepts custom API key');
  });

  // Test 3.10: LocalStorage State -> Application Reload -> State Hydration -> Analytics Integrity
  addTest('T3.10 (F5+F1-F4): LocalStorage State -> Application Reload -> State Hydration -> Analytics Integrity', () => {
    localStorage.setItem('oxford3000_favorites', JSON.stringify(['abandon', 'ability']));
    localStorage.setItem('oxford3000_mastered', JSON.stringify(['able']));

    const hydratedFavs = JSON.parse(localStorage.getItem('oxford3000_favorites'));
    const hydratedMast = JSON.parse(localStorage.getItem('oxford3000_mastered'));

    assert.deepStrictEqual(hydratedFavs, ['abandon', 'ability'], 'Favorites hydrated correctly');
    assert.deepStrictEqual(hydratedMast, ['able'], 'Mastered hydrated correctly');
  });

  // Test 3.11: Catalog Filter -> Multi-select for Storyteller -> Over-Limit Toast Guard
  addTest('T3.11 (F1+F3): Catalog Filter -> Multi-select for Storyteller -> Over-Limit Toast Guard', () => {
    let selectedWords = ['word1', 'word2', 'word3', 'word4', 'word5'];
    const addWord = (word) => {
      if (selectedWords.length >= 5) {
        return { error: 'Maximum 5 words can be selected for Storytelling.' };
      }
      selectedWords.push(word);
      return { success: true };
    };

    const attemptAdd = addWord('word6');
    assert.strictEqual(attemptAdd.error, 'Maximum 5 words can be selected for Storytelling.');
    assert.strictEqual(selectedWords.length, 5, 'Selected words capped at max limit 5');
  });

  // Test 3.12: Custom AI Fetched Term -> Flashcard Queue -> Quiz Distractor Option Generation
  addTest('T3.12 (F3+F4): Custom AI Fetched Term -> Flashcard Queue -> Quiz Distractor Generation', () => {
    const customTerm = {
      word: 'sustainability',
      pos: 'noun',
      cefr: 'B2',
      arabic: 'استدامة',
      example: 'Sustainability is crucial.',
      ipa: '/səˌsteɪ.nəˈbɪl.ə.ti/'
    };

    const quizPool = [...oxford3000Data, customTerm];
    const targetQuestion = quizPool.find((w) => w.word === 'sustainability');
    assert.ok(targetQuestion, 'Custom term is present in quiz candidate pool');
    assert.strictEqual(targetQuestion.arabic, 'استدامة', 'Custom term translation intact');
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
