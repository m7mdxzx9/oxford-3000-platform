/**
 * Oxford 3000 Lexicon Application - Speech Evaluation & Recognition Service
 * Module: src/services/speechEvaluation.js
 */

let activeRecognition = null;

export const isSpeechRecognitionSupported = () => {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
};

export const tokenizeText = (text) => {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
};

/**
 * Calculates Levenshtein similarity distance between two words.
 */
const levenshteinDistance = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
};

/**
 * Evaluates spoken text against expected target text.
 */
export const evaluateSpeech = (expectedText = '', spokenText = '') => {
  const expectedTokens = tokenizeText(expectedText);
  const spokenTokens = tokenizeText(spokenText);

  if (expectedTokens.length === 0) {
    return {
      score: 0,
      transcript: spokenText,
      wordBreakdown: [],
      missingWords: [],
    };
  }

  if (spokenTokens.length === 0) {
    return {
      score: 0,
      transcript: spokenText || '(No speech detected)',
      wordBreakdown: expectedTokens.map((word) => ({ word, match: false })),
      missingWords: expectedTokens,
    };
  }

  const spokenCounts = {};
  for (const token of spokenTokens) {
    spokenCounts[token] = (spokenCounts[token] || 0) + 1;
  }

  let matchedCount = 0;
  const wordBreakdown = expectedTokens.map((expectedWord) => {
    // 1. Direct match
    if (spokenCounts[expectedWord] && spokenCounts[expectedWord] > 0) {
      spokenCounts[expectedWord]--;
      matchedCount++;
      return { word: expectedWord, match: true };
    }

    // 2. Fuzzy match (allow 1 typo for words > 4 chars)
    const fuzzyMatch = spokenTokens.find((sp) => {
      if (Math.abs(sp.length - expectedWord.length) <= 1 && expectedWord.length >= 4) {
        return levenshteinDistance(sp, expectedWord) <= 1;
      }
      return false;
    });

    if (fuzzyMatch) {
      matchedCount += 0.9;
      return { word: expectedWord, match: true };
    }

    return { word: expectedWord, match: false };
  });

  const missingWords = wordBreakdown.filter((w) => !w.match).map((w) => w.word);
  const rawScore = Math.round((matchedCount / expectedTokens.length) * 100);
  const score = Math.max(0, Math.min(100, rawScore));

  return {
    score,
    transcript: spokenText,
    wordBreakdown,
    missingWords,
  };
};

/**
 * Starts browser speech recognition session.
 */
export const startListening = (onResult, onError) => {
  stopListening();

  if (!isSpeechRecognitionSupported()) {
    if (typeof onError === 'function') {
      onError(new Error('Speech recognition not supported in this browser.'));
    }
    return;
  }

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

  try {
    activeRecognition = new SpeechRecognitionClass();
    activeRecognition.continuous = false;
    activeRecognition.interimResults = false;
    activeRecognition.lang = 'en-US';

    activeRecognition.onresult = (event) => {
      if (event && event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript || '';
        if (typeof onResult === 'function') {
          onResult(transcript);
        }
      }
    };

    activeRecognition.onerror = (event) => {
      let errorMessage = 'Speech recognition error occurred.';
      const errCode = event && (event.error || event);

      switch (errCode) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone permissions.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone detected.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please speak clearly.';
          break;
        case 'network':
          errorMessage = 'Network error occurred during speech recognition.';
          break;
        default:
          if (typeof errCode === 'string') errorMessage = `Speech recognition error: ${errCode}`;
          break;
      }

      if (typeof onError === 'function') {
        onError(new Error(errorMessage));
      }
    };

    activeRecognition.onend = () => {
      activeRecognition = null;
    };

    activeRecognition.start();
  } catch (err) {
    if (typeof onError === 'function') {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
};

/**
 * High-level helper: Records microphone audio AND evaluates speech against target text in one call.
 */
export const recordAndEvaluateSpeech = (targetText = '', onComplete, onError) => {
  startListening(
    (transcript) => {
      const evaluation = evaluateSpeech(targetText, transcript);
      if (typeof onComplete === 'function') {
        onComplete(evaluation);
      }
    },
    (err) => {
      if (typeof onError === 'function') {
        onError(err);
      }
    }
  );
};

export const stopListening = () => {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch (e) {}
    activeRecognition = null;
  }
};

export default {
  evaluateSpeech,
  startListening,
  stopListening,
  recordAndEvaluateSpeech,
  tokenizeText,
  isSpeechRecognitionSupported,
};
