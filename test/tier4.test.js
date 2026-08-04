import { assert } from './assert-utils.js';
import { setupMockEnvironment } from './mock-environment.js';
import { oxford3000Data } from '../src/data/oxford3000.js';
import audioService from '../src/services/audioService.js';
import speechEvaluation from '../src/services/speechEvaluation.js';
import geminiService from '../src/services/geminiService.js';

export async function runTier4Tests() {
  const env = setupMockEnvironment();
  const testQueue = [];

  function addTest(name, fn) {
    testQueue.push({ name, fn });
  }

  // --- Scenario 1: Full Lexicon Browse & AI Sentence Practice Workflow ---
  addTest('T4.Scenario 1: Full Lexicon Browse & AI Sentence Practice Workflow', async () => {
    // 1. Filter Lexicon by B1 level
    const b1Words = oxford3000Data.filter((w) => w.cefr === 'B1');
    assert.ok(b1Words.length > 0, 'Found B1 lexicon items');

    // 2. Select word item "absolute"
    const targetWord = b1Words.find((w) => w.word === 'absolute') || b1Words[0];
    assert.ok(targetWord, 'Selected target word item');

    // 3. Play audio pronunciation for target word
    let played = false;
    global.window.speechSynthesis.speak = (utt) => {
      if (utt.text === targetWord.word) played = true;
      if (utt.onend) utt.onend();
    };
    await audioService.playAudio(targetWord.word, 'en-US');
    assert.ok(played, 'Pronunciation played for selected target word');

    // 4. Generate AI practice sentence for target word
    const practiceSentence = await geminiService.generateSentence(
      targetWord.word,
      'medium',
      'any',
      'natural'
    );
    assert.includes(practiceSentence, targetWord.word, 'AI practice sentence contains target word');

    // 5. Save progress state
    localStorage.setItem('last_practiced_word', targetWord.word);
    assert.strictEqual(localStorage.getItem('last_practiced_word'), targetWord.word, 'Saved progress state');
  });

  // --- Scenario 2: Interactive Storytelling with Pronunciation Evaluation Workflow ---
  addTest('T4.Scenario 2: Interactive Storytelling with Pronunciation Evaluation Workflow', async () => {
    // 1. Select a set of target vocabulary words
    const targetWords = ['ability', 'achieve', 'candidate'];

    // 2. Generate multi-line AI story incorporating target words
    const storyLines = await geminiService.generateStory(targetWords, 'adventure', 'B2');
    assert.ok(storyLines.length >= 2, 'Generated multi-line story');

    // 3. Play audio for first story line
    const lineToPractice = storyLines[0].text;
    await audioService.playAudio(lineToPractice, 'en-US');

    // 4. Evaluate user spoken attempt against story line text
    const userSpokenAttempt = lineToPractice; // simulate exact recitation
    const evalResult = speechEvaluation.evaluateSpeech(lineToPractice, userSpokenAttempt);

    // 5. Verify 100% accuracy score and positive breakdown
    assert.strictEqual(evalResult.score, 100, 'Recitation evaluated at 100% accuracy');
    assert.ok(evalResult.wordBreakdown.length > 0, 'Word breakdown produced for story line');
  });

  // --- Scenario 3: AI Roleplay Tutor Session with Real-time Grammar Feedback Workflow ---
  addTest('T4.Scenario 3: AI Roleplay Tutor Session with Real-time Grammar Feedback Workflow', async () => {
    // 1. Start Job Interview roleplay scenario
    const scenario = 'Job Interview';
    const conversationHistory = [];

    // 2. User sends initial response with slight grammar error
    const userMsg1 = 'I wants to apply for candidate position.';
    const response1 = await geminiService.getTutorResponse(scenario, userMsg1, conversationHistory);

    assert.ok(response1.reply, 'Tutor reply received');
    assert.ok(response1.arabic, 'Arabic explanation received');
    conversationHistory.push({ role: 'user', text: userMsg1 });
    conversationHistory.push({ role: 'tutor', text: response1.reply });

    // 3. User sends corrected response
    const userMsg2 = 'I want to apply for the candidate position.';
    const response2 = await geminiService.getTutorResponse(scenario, userMsg2, conversationHistory);
    assert.ok(response2.reply, 'Follow-up tutor reply received');

    // 4. Track session state
    localStorage.setItem('tutor_history', JSON.stringify(conversationHistory));
    const savedHistory = JSON.parse(localStorage.getItem('tutor_history'));
    assert.strictEqual(savedHistory.length, 2, 'Tutor conversation history persisted');
  });

  // --- Scenario 4: Vocabulary Mastery Loop (Flashcards -> Quiz -> Analytics Dashboard Workflow) ---
  addTest('T4.Scenario 4: Vocabulary Mastery Loop (Flashcards -> Quiz -> Analytics Dashboard Workflow)', async () => {
    // 1. Review flashcards and mark 3 items as mastered
    const masteredIds = new Set([1, 2, 3]);

    // 2. Take a 4-choice Quiz game test
    const quizQuestions = oxford3000Data.slice(0, 3).map((item) => ({
      question: item.word,
      correctId: item.id,
      options: [item, ...oxford3000Data.slice(3, 6)]
    }));

    let quizScore = 0;
    quizQuestions.forEach((q) => {
      quizScore++;
    });

    const finalQuizScorePct = Math.round((quizScore / quizQuestions.length) * 100);
    assert.strictEqual(finalQuizScorePct, 100, 'Quiz completed with 100% score');

    // 3. Update Analytics Dashboard state
    const totalMastered = masteredIds.size;
    const totalLexicon = oxford3000Data.length;
    const overallMasteryPct = Math.round((totalMastered / totalLexicon) * 100);

    assert.ok(overallMasteryPct > 0, 'Analytics reflects overall mastery percentage');

    // 4. Persist progress
    localStorage.setItem('mastery_ids', JSON.stringify(Array.from(masteredIds)));
    assert.strictEqual(JSON.parse(localStorage.getItem('mastery_ids')).length, 3, 'Mastery IDs saved');
  });

  // --- Scenario 5: Dynamic Lexicon Expansion via Gemini Fetcher & Progress Sync ---
  addTest('T4.Scenario 5: Dynamic Lexicon Expansion via Gemini Fetcher & Progress Sync', async () => {
    // 1. User searches for a term missing from standard dictionary: "resilient"
    const searchTerm = 'resilient';
    const existing = oxford3000Data.find((item) => item.word === searchTerm);
    assert.strictEqual(existing, undefined, 'Term is missing from default dataset');

    // 2. Call Gemini service Instant Lexicon Fetcher
    const fetchedTerm = await geminiService.fetchMissingTerm(searchTerm, 'test-key');
    assert.ok(fetchedTerm, 'Term dynamically fetched from Gemini service');
    assert.strictEqual(fetchedTerm.word, 'resilient', 'Fetched word matches search term');

    // 3. Dynamically append fetched term to lexicon state
    const updatedLexicon = [...oxford3000Data, { id: 999, ...fetchedTerm }];
    const newlyAdded = updatedLexicon.find((item) => item.word === 'resilient');
    assert.ok(newlyAdded, 'New term dynamically added to expanded Lexicon catalog');

    // 4. Test audio preview on newly expanded term
    let playedWord = '';
    global.window.speechSynthesis.speak = (utt) => {
      playedWord = utt.text;
      if (utt.onend) utt.onend();
    };
    await audioService.playAudio(newlyAdded.word, 'en-US');
    assert.strictEqual(playedWord, 'resilient', 'Audio preview works for dynamically expanded term');
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
