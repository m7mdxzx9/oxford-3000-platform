import { oxford3000Data, OXFORD_3000, getCefrLevels, getPosOptions } from '../src/data/oxford3000.js';
import normalizedOxford3000 from '../src/data/oxford3000Data.js';
import { translations } from '../src/data/translations.js';
import geminiService from '../src/services/geminiService.js';
import imagenService from '../src/services/imagenService.js';
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
  // TEST 1: Oxford 3000 Dataset Integrity & Normalized Module
  console.log('[1/6] Testing Oxford 3000 Lexicon Data Integrity & oxford3000Data.js...');
  assert(Array.isArray(oxford3000Data) && oxford3000Data.length > 50, `Dataset loaded (${oxford3000Data.length} terms)`);
  assert(Array.isArray(normalizedOxford3000) && normalizedOxford3000.length > 50, `Normalized dataset loaded (${normalizedOxford3000.length} terms)`);

  const validNormalized = normalizedOxford3000.every(item => item.id && item.word && item.level && item.translation && item.phonetic);
  assert(validNormalized, 'All normalized entries contain mandatory fields (id, word, level, translation, phonetic)');

  // TEST 2: Bilingual i18n Translations Audit
  console.log('\n[2/6] Testing Bilingual i18n Translations Keys...');
  const enKeys = Object.keys(translations.en);
  const arKeys = Object.keys(translations.ar);
  assert(enKeys.length > 20 && arKeys.length > 20, `Loaded translations (EN: ${enKeys.length}, AR: ${arKeys.length})`);
  assert(enKeys.includes('navPronunciation'), 'navPronunciation key exists in English dictionary');

  // TEST 3: Audio TTS & Speech Evaluation Logic
  console.log('\n[3/6] Testing Audio Engine & Speech Evaluation Logic...');
  const voicePresets = audioService.VOICE_PRESETS;
  assert(Array.isArray(voicePresets) && voicePresets.length === 4, `Loaded ${voicePresets.length} human voice presets`);

  const evalResult = speechEvaluation.evaluateSpeech('They decided not to abandon the project', 'They decided to abandon project');
  assert(evalResult.score > 50 && evalResult.score <= 100, `Speech evaluation score calculated correctly (${evalResult.score}%)`);

  // TEST 4: Gemini AI Real API Call Endpoints (gemini-2.5-flash)
  console.log('\n[4/6] Testing Gemini AI API Endpoints (gemini-2.5-flash)...');
  try {
    const fetchedTerm = await geminiService.fetchMissingTerm('resilient');
    assert(fetchedTerm && fetchedTerm.word === 'resilient' && fetchedTerm.arabic, `fetchMissingTerm returned: "${fetchedTerm.word}" -> "${fetchedTerm.arabic}"`);
  } catch (err) {
    assert(false, `fetchMissingTerm error: ${err.message}`);
  }

  // TEST 5: Imagen 4.0 Visual Illustration Generation
  console.log('\n[5/6] Testing Imagen 4.0 Visual Concept Illustration...');
  try {
    const illustration = await imagenService.generateVisualIllustration('abandon', 'snowstorm');
    assert(typeof illustration === 'string' && illustration.length > 50, 'Imagen 4.0 illustration URL/SVG generated successfully');
  } catch (err) {
    assert(false, `imagenService error: ${err.message}`);
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
