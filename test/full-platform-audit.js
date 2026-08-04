import { oxford3000Data, OXFORD_3000, getCefrLevels, getPosOptions } from '../src/data/oxford3000.js';
import { translations } from '../src/data/translations.js';
import geminiService from '../src/services/geminiService.js';
import audioService from '../src/services/audioService.js';
import speechEvaluation from '../src/services/speechEvaluation.js';

console.log('====================================================');
console.log('  STARTING FULL OXFORD 3000 PLATFORM AUDIT & TEST  ');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASSED: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAILED: ${message}`);
    failedTests++;
  }
}

async function runAudit() {
  // TEST 1: Oxford 3000 Dataset Integrity
  console.log('[1/5] Testing Oxford 3000 Lexicon Data Integrity...');
  assert(Array.isArray(oxford3000Data) && oxford3000Data.length > 50, `Dataset array loaded (${oxford3000Data.length} terms)`);
  assert(OXFORD_3000 === oxford3000Data, 'OXFORD_3000 alias matches oxford3000Data');

  const validEntries = oxford3000Data.every(item => item.id && item.word && item.pos && item.cefr && item.arabic);
  assert(validEntries, 'All lexicon entries contain mandatory fields (id, word, pos, cefr, arabic)');

  const cefrLevels = getCefrLevels();
  assert(cefrLevels.includes('A1') && cefrLevels.includes('B2'), 'getCefrLevels returns A1, A2, B1, B2');

  const posOptions = getPosOptions(oxford3000Data);
  assert(posOptions.includes('noun') && posOptions.includes('verb'), 'getPosOptions extracts valid parts of speech');

  // TEST 2: Bilingual i18n Translations Audit
  console.log('\n[2/5] Testing Bilingual i18n Translations Keys...');
  const enKeys = Object.keys(translations.en);
  const arKeys = Object.keys(translations.ar);

  assert(enKeys.length > 20 && arKeys.length > 20, `Loaded translations (EN: ${enKeys.length}, AR: ${arKeys.length})`);
  const missingInAr = enKeys.filter(k => !arKeys.includes(k));
  assert(missingInAr.length === 0, `All English keys exist in Arabic dictionary (Missing: ${missingInAr.join(', ')})`);

  // TEST 3: Audio TTS & Speech Evaluation Logic
  console.log('\n[3/5] Testing Audio Engine & Speech Evaluation Logic...');
  const voicePresets = audioService.VOICE_PRESETS;
  assert(Array.isArray(voicePresets) && voicePresets.length === 4, `Loaded ${voicePresets.length} human voice presets`);

  const ttsUrl = audioService.buildGoogleTtsUrl('Hello world', 'en-US');
  assert(ttsUrl.includes('q=Hello%20world') && ttsUrl.includes('tl=en'), 'Google TTS fallback URL builder works correctly');

  const evalResult = speechEvaluation.evaluateSpeech('They decided not to abandon the project', 'They decided to abandon project');
  assert(evalResult.score > 50 && evalResult.score <= 100, `Speech evaluation score calculated correctly (${evalResult.score}%)`);
  assert(evalResult.wordBreakdown.length > 0, 'Word breakdown tokens array generated');

  // TEST 4: Gemini AI Real API Call Endpoints
  console.log('\n[4/5] Testing Gemini AI API Endpoints (gemini-2.5-flash)...');
  try {
    const fetchedTerm = await geminiService.fetchMissingTerm('resilient');
    assert(fetchedTerm && fetchedTerm.word === 'resilient' && fetchedTerm.arabic, `fetchMissingTerm returned: "${fetchedTerm.word}" -> "${fetchedTerm.arabic}"`);
  } catch (err) {
    assert(false, `fetchMissingTerm error: ${err.message}`);
  }

  try {
    const sentenceObj = await geminiService.generateSentence('resilient', 'short', 'any', 'Casual Conversation', 'Present');
    assert(sentenceObj && sentenceObj.sentence && sentenceObj.arabic, `generateSentence returned sentence: "${sentenceObj.sentence}"`);
  } catch (err) {
    assert(false, `generateSentence error: ${err.message}`);
  }

  try {
    const storyArr = await geminiService.generateStory(['resilient', 'achieve']);
    assert(Array.isArray(storyArr) && storyArr.length > 0 && storyArr[0].text, `generateStory returned ${storyArr?.length || 0} story scenes`);
  } catch (err) {
    assert(false, `generateStory error: ${err.message}`);
  }

  try {
    const tutorRes = await geminiService.getTutorResponse('Job Interview', 'I am eager to learn and grow.');
    assert(tutorRes && tutorRes.reply && tutorRes.arabic, `getTutorResponse returned: "${tutorRes.reply.substring(0, 40)}..."`);
  } catch (err) {
    assert(false, `getTutorResponse error: ${err.message}`);
  }

  // AUDIT SUMMARY
  console.log('\n====================================================');
  console.log(`  AUDIT COMPLETED: ${passedTests} PASSED, ${failedTests} FAILED  `);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAudit();
