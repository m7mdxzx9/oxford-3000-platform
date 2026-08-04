/**
 * Oxford 3000 Lexicon Application - Speech Evaluation & Recognition Service
 * Module: src/services/speechEvaluation.js
 */

let activeRecognition = null;

/**
 * Checks if the current environment supports Web Speech Recognition API.
 * @returns {boolean}
 */
export const isSpeechRecognitionSupported = () => {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
};

/**
 * Normalizes input text by removing punctuation (preserving single apostrophes),
 * lowercasing, and splitting into clean word tokens.
 * 
 * @param {string} text - Raw input string
 * @returns {string[]} Array of normalized word tokens
 */
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
 * Evaluates spoken text against expected target text and returns an accuracy score (0-100)
 * along with a word-by-word match breakdown.
 * 
 * @param {string} expectedText - The target text the user was supposed to speak
 * @param {string} spokenText - The transcribed speech recognized from user audio
 * @returns {{ score: number, wordBreakdown: Array<{ word: string, match: boolean }> }}
 */
export const evaluateSpeech = (expectedText = '', spokenText = '') => {
  const expectedTokens = tokenizeText(expectedText);
  const spokenTokens = tokenizeText(spokenText);

  // If no expected text was provided, return 0 score and empty breakdown
  if (expectedTokens.length === 0) {
    return {
      score: 0,
      wordBreakdown: []
    };
  }

  // If spoken speech is empty or whitespace-only
  if (spokenTokens.length === 0) {
    return {
      score: 0,
      wordBreakdown: expectedTokens.map((word) => ({ word, match: false }))
    };
  }

  // Frequency map for spoken tokens to handle duplicate target words accurately
  const spokenCounts = {};
  for (const token of spokenTokens) {
    spokenCounts[token] = (spokenCounts[token] || 0) + 1;
  }

  let matchedCount = 0;
  const wordBreakdown = expectedTokens.map((word) => {
    if (spokenCounts[word] && spokenCounts[word] > 0) {
      spokenCounts[word]--;
      matchedCount++;
      return { word, match: true };
    }
    return { word, match: false };
  });

  const rawScore = Math.round((matchedCount / expectedTokens.length) * 100);
  const score = Math.max(0, Math.min(100, rawScore));

  return {
    score,
    wordBreakdown
  };
};

/**
 * Starts continuous browser speech recognition session.
 * 
 * @param {function(string): void} onResult - Callback invoked with final transcript text
 * @param {function(Error): void} onError - Callback invoked with error object on failure
 */
export const startListening = (onResult, onError) => {
  // Always stop existing recognition sessions first
  stopListening();

  if (!isSpeechRecognitionSupported()) {
    if (typeof onError === 'function') {
      onError(new Error('Speech recognition not supported in this browser environment.'));
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
          errorMessage = 'Microphone access denied. Please allow microphone permissions in browser settings.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone detected. Please check your audio input device.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please speak clearly into your microphone.';
          break;
        case 'network':
          errorMessage = 'Network error occurred during speech recognition.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition session was aborted.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service is blocked by the browser.';
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
 * Stops any currently active speech recognition session.
 */
export const stopListening = () => {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch (e) {
      // Ignore errors if recognition was already stopped
    }
    activeRecognition = null;
  }
};

export default {
  evaluateSpeech,
  startListening,
  stopListening,
  tokenizeText,
  isSpeechRecognitionSupported
};
