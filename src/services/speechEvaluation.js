/**
 * Oxford 3000 Lexicon Application - 100% Real Speech Recognition & Evaluation Service
 * Module: src/services/speechEvaluation.js
 * Strictly evaluates ACTUAL microphone speech transcriptions with ZERO dummy or fabricated results.
 */

let activeRecognition = null;
let activeAudioStream = null;

export const isSpeechRecognitionSupported = () => {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition || (navigator.mediaDevices && navigator.mediaDevices.getUserMedia))
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
 * Evaluates ACTUAL spoken text against expected target text.
 * Strictly calculates score based ONLY on real spoken words.
 */
export const evaluateSpeech = (expectedText = '', spokenText = '') => {
  const expectedTokens = tokenizeText(expectedText);
  const spokenTokens = tokenizeText(spokenText);

  // If no actual speech was detected or spoken text is empty/placeholder
  if (spokenTokens.length === 0 || spokenText.includes('No speech detected') || spokenText.includes('لم يتم التقاط')) {
    return {
      score: 0,
      transcript: spokenText || '(لم يتم التقاط نطق صوتي من الميكروفون / No speech detected)',
      wordBreakdown: expectedTokens.map((word) => ({ word, match: false })),
      missingWords: expectedTokens,
    };
  }

  if (expectedTokens.length === 0) {
    return {
      score: 0,
      transcript: spokenText,
      wordBreakdown: [],
      missingWords: [],
    };
  }

  const spokenCounts = {};
  for (const token of spokenTokens) {
    spokenCounts[token] = (spokenCounts[token] || 0) + 1;
  }

  let matchedCount = 0;
  const wordBreakdown = expectedTokens.map((expectedWord) => {
    // 1. Exact match
    if (spokenCounts[expectedWord] && spokenCounts[expectedWord] > 0) {
      spokenCounts[expectedWord]--;
      matchedCount++;
      return { word: expectedWord, match: true };
    }

    // 2. Fuzzy phonetic match (allow 1 character difference for words >= 4 chars)
    const fuzzyMatch = spokenTokens.find((sp) => {
      if (Math.abs(sp.length - expectedWord.length) <= 1 && expectedWord.length >= 4) {
        return levenshteinDistance(sp, expectedWord) <= 1;
      }
      return false;
    });

    if (fuzzyMatch) {
      matchedCount += 0.85;
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
 * Real Speech Recognition Session with Explicit Microphone Access Request.
 */
export const startListening = async (onFinalResult, onError, onInterimResult) => {
  stopListening();

  // First request browser microphone permission explicitly
  if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      activeAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (micErr) {
      console.warn('Microphone permission denied:', micErr);
      if (typeof onError === 'function') {
        onError(new Error('Microphone permission denied. Please allow microphone access in your browser bar.'));
      }
      return;
    }
  }

  const SpeechRecognitionClass = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  if (!SpeechRecognitionClass) {
    if (typeof onError === 'function') {
      onError(new Error('Web Speech API is not supported on this browser version. You can type spoken text directly in the box!'));
    }
    return;
  }

  try {
    activeRecognition = new SpeechRecognitionClass();
    activeRecognition.continuous = true;
    activeRecognition.interimResults = true;
    activeRecognition.lang = 'en-US';

    let lastLiveTranscript = '';

    activeRecognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res && res[0]) {
          if (res.isFinal) {
            finalTranscript += res[0].transcript + ' ';
          } else {
            interimTranscript += res[0].transcript;
          }
        }
      }

      const combined = (finalTranscript + interimTranscript).trim();
      if (combined) {
        lastLiveTranscript = combined;
        if (typeof onInterimResult === 'function') {
          onInterimResult(combined);
        }
        if (typeof onFinalResult === 'function') {
          onFinalResult(combined);
        }
      }
    };

    activeRecognition.onerror = (event) => {
      const errCode = event && (event.error || event);
      console.warn('SpeechRecognition error:', errCode);

      if (lastLiveTranscript) {
        if (typeof onFinalResult === 'function') onFinalResult(lastLiveTranscript);
        return;
      }

      let userMsg = 'No speech detected. Please speak clearly into your microphone.';
      if (errCode === 'not-allowed' || errCode === 'permission-denied') {
        userMsg = 'Microphone access denied by browser.';
      } else if (errCode === 'audio-capture') {
        userMsg = 'No active microphone hardware found.';
      }

      if (typeof onError === 'function') {
        onError(new Error(userMsg));
      }
    };

    activeRecognition.onend = () => {
      stopAudioStreamTracks();
      activeRecognition = null;
    };

    activeRecognition.start();
  } catch (err) {
    stopAudioStreamTracks();
    if (typeof onError === 'function') {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
};

const stopAudioStreamTracks = () => {
  if (activeAudioStream) {
    try {
      activeAudioStream.getTracks().forEach(track => track.stop());
    } catch (e) {}
    activeAudioStream = null;
  }
};

/**
 * Records microphone audio AND evaluates REAL speech against target text with ZERO fake results.
 */
export const recordAndEvaluateSpeech = (targetText = '', onComplete, onError, onLiveTranscript) => {
  let realTranscript = '';

  startListening(
    (transcript) => {
      realTranscript = transcript;
      if (typeof onLiveTranscript === 'function') {
        onLiveTranscript(transcript);
      }
      const evaluation = evaluateSpeech(targetText, transcript);
      if (typeof onComplete === 'function') {
        onComplete(evaluation);
      }
    },
    (err) => {
      if (realTranscript) {
        if (typeof onComplete === 'function') {
          onComplete(evaluateSpeech(targetText, realTranscript));
        }
      } else if (typeof onError === 'function') {
        onError(err);
      }
    },
    (interim) => {
      realTranscript = interim;
      if (typeof onLiveTranscript === 'function') {
        onLiveTranscript(interim);
      }
    }
  );
};

export const stopListening = () => {
  if (activeRecognition) {
    try {
      activeRecognition.abort();
    } catch (e) {}
    activeRecognition = null;
  }
  stopAudioStreamTracks();
};

export default {
  evaluateSpeech,
  startListening,
  stopListening,
  recordAndEvaluateSpeech,
  tokenizeText,
  isSpeechRecognitionSupported,
};
