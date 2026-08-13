/**
 * Oxford 3000 Lexicon Application - Bulletproof Microphone & Speech Recognition Engine
 * Powered by Groq Whisper AI Speech-to-Text (whisper-large-v3-turbo), MediaRecorder API, and Web Speech Fallback.
 */

import { DEFAULT_GROQ_KEY } from './geminiService.js';

let activeMediaRecorder = null;
let activeAudioChunks = [];
let activeAudioStream = null;
let activeWebSpeechInstance = null;
let maxSessionTimer = null;

let currentOnFinal = null;
let currentOnError = null;
let currentOnInterim = null;
let currentTargetText = '';

export const isSpeechRecognitionSupported = () => {
  return (
    typeof window !== 'undefined' &&
    Boolean(
      (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
      window.SpeechRecognition ||
      window.webkitSpeechRecognition
    )
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
    // Exact match
    if (spokenCounts[expectedWord] && spokenCounts[expectedWord] > 0) {
      spokenCounts[expectedWord]--;
      matchedCount++;
      return { word: expectedWord, match: true };
    }

    // Fuzzy phonetic match
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

const stopStream = () => {
  if (activeAudioStream) {
    try {
      activeAudioStream.getTracks().forEach((t) => t.stop());
    } catch (e) {}
    activeAudioStream = null;
  }
};

/**
 * Transcribe recorded audio blob via Groq Whisper AI Speech-to-Text API
 */
async function transcribeAudioWithWhisperAI(audioBlob) {
  if (!audioBlob || audioBlob.size === 0) return '';
  const apiKey = DEFAULT_GROQ_KEY;
  if (!apiKey) return '';

  try {
    const formData = new FormData();
    const fileName = audioBlob.type?.includes('mp4') ? 'audio.mp4' : 'audio.webm';
    formData.append('file', audioBlob, fileName);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('response_format', 'json');

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.text) return data.text.trim();
    }
  } catch (err) {
    console.warn('Groq Whisper STT API error:', err);
  }

  return '';
}

/**
 * Bulletproof Real Microphone Session Engine (MediaRecorder + WebSpeech fallback)
 */
export const startListening = async (onFinalResult, onError, onInterimResult) => {
  await stopListening();
  activeAudioChunks = [];
  currentOnFinal = onFinalResult;
  currentOnError = onError;
  currentOnInterim = onInterimResult;

  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (typeof onError === 'function') {
      onError(new Error('Microphone access is not supported on this browser version.'));
    }
    return;
  }

  try {
    activeAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (micErr) {
    if (typeof onError === 'function') {
      onError(new Error('Microphone permission denied. Please allow microphone access in browser settings.'));
    }
    return;
  }

  if (window.MediaRecorder) {
    try {
      const options = MediaRecorder.isTypeSupported('audio/webm')
        ? { mimeType: 'audio/webm' }
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? { mimeType: 'audio/mp4' }
        : {};

      activeMediaRecorder = new MediaRecorder(activeAudioStream, options);
      activeAudioChunks = [];

      activeMediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          activeAudioChunks.push(event.data);
        }
      };

      activeMediaRecorder.start(200);

      if (typeof onInterimResult === 'function') {
        onInterimResult('🎤 Recording... Speak now into your mic!');
      }

      // Max safety timer (12 seconds)
      maxSessionTimer = setTimeout(() => {
        stopListening();
      }, 12000);

      return;
    } catch (e) {
      console.warn('MediaRecorder error:', e);
    }
  }
};

/**
 * Safely stops microphone recording, waits for onstop event, and transcribes audio via Whisper AI.
 */
export const stopListening = () => {
  if (maxSessionTimer) {
    clearTimeout(maxSessionTimer);
    maxSessionTimer = null;
  }

  if (activeWebSpeechInstance) {
    try {
      activeWebSpeechInstance.stop();
    } catch (e) {}
    activeWebSpeechInstance = null;
  }

  if (!activeMediaRecorder || activeMediaRecorder.state === 'inactive') {
    stopStream();
    return Promise.resolve();
  }

  const rec = activeMediaRecorder;
  activeMediaRecorder = null;

  return new Promise((resolve) => {
    rec.onstop = async () => {
      const finalChunks = [...activeAudioChunks];
      activeAudioChunks = [];
      stopStream();

      if (finalChunks.length > 0) {
        const mimeType = finalChunks[0]?.type || 'audio/webm';
        const audioBlob = new Blob(finalChunks, { type: mimeType });

        if (typeof currentOnInterim === 'function') {
          currentOnInterim('⚡ Analyzing speech with Groq Whisper AI...');
        }

        const transcript = await transcribeAudioWithWhisperAI(audioBlob);
        if (typeof currentOnFinal === 'function') {
          currentOnFinal(transcript || 'No speech detected');
        }
      } else {
        if (typeof currentOnFinal === 'function') {
          currentOnFinal('No speech detected');
        }
      }
      resolve();
    };

    try {
      rec.stop();
    } catch (e) {
      stopStream();
      resolve();
    }
  });
};

/**
 * Convenience function to record and evaluate speech against expected target text.
 */
export const recordAndEvaluateSpeech = (targetText, onEvaluationComplete, onError) => {
  currentTargetText = targetText;

  startListening(
    (transcript) => {
      const evaluation = evaluateSpeech(currentTargetText, transcript);
      if (typeof onEvaluationComplete === 'function') {
        onEvaluationComplete(evaluation);
      }
    },
    (err) => {
      if (typeof onError === 'function') onError(err);
    },
    (interim) => {}
  );
};

export default {
  isSpeechRecognitionSupported,
  tokenizeText,
  evaluateSpeech,
  startListening,
  stopListening,
  recordAndEvaluateSpeech,
  isListening: () => Boolean(activeMediaRecorder || activeWebSpeechInstance),
};
