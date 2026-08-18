/**
 * Oxford 3000 Lexicon Application - Bulletproof Microphone & Speech Recognition Engine
 * Powered by Groq Whisper AI Speech-to-Text (whisper-large-v3-turbo), MediaRecorder API, and Web Speech Fallback.
 * Relaxed Voice Activity Detection (VAD) to give learners ample time to read calmly without cutting off prematurely.
 */

import { DEFAULT_GROQ_KEY } from './geminiService.js';

let activeMediaRecorder = null;
let activeAudioChunks = [];
let activeAudioStream = null;
let activeWebSpeechInstance = null;
let maxSessionTimer = null;
let activeAudioContext = null;
let activeVadTimer = null;

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
 * Evaluates spoken text against expected target text with detailed word-by-word analysis.
 */
export const evaluateSpeech = (expectedText = '', spokenText = '') => {
  const expectedTokens = tokenizeText(expectedText);
  const spokenTokens = tokenizeText(spokenText);

  if (spokenTokens.length === 0 || spokenText.includes('No speech detected') || spokenText.includes('لم يتم التقاط')) {
    return {
      score: 0,
      transcript: spokenText || '(لم يتم التقاط نطق صوتي من الميكروفون / No speech detected)',
      wordBreakdown: expectedTokens.map((word) => ({ word, match: false, status: 'missed' })),
      missingWords: expectedTokens,
      correctWords: [],
    };
  }

  if (expectedTokens.length === 0) {
    return {
      score: 0,
      transcript: spokenText,
      wordBreakdown: [],
      missingWords: [],
      correctWords: [],
    };
  }

  const spokenCounts = {};
  for (const token of spokenTokens) {
    spokenCounts[token] = (spokenCounts[token] || 0) + 1;
  }

  let matchedScore = 0;
  const correctWords = [];
  const missingWords = [];

  const wordBreakdown = expectedTokens.map((expectedWord) => {
    // 1. Exact match
    if (spokenCounts[expectedWord] && spokenCounts[expectedWord] > 0) {
      spokenCounts[expectedWord] -= 1;
      matchedScore += 1;
      correctWords.push(expectedWord);
      return { word: expectedWord, match: true, close: false, status: 'correct' };
    }

    // 2. Phonetic / Levenshtein close match (1 distance)
    const closeToken = Object.keys(spokenCounts).find(
      (token) => spokenCounts[token] > 0 && levenshteinDistance(expectedWord, token) <= 1
    );

    if (closeToken) {
      spokenCounts[closeToken] -= 1;
      matchedScore += 0.85;
      correctWords.push(expectedWord);
      return { word: expectedWord, match: true, close: true, recognizedAs: closeToken, status: 'close' };
    }

    missingWords.push(expectedWord);
    return { word: expectedWord, match: false, close: false, status: 'missed' };
  });

  const accuracy = Math.round((matchedScore / expectedTokens.length) * 100);
  const finalScore = Math.min(100, Math.max(0, accuracy));

  return {
    score: finalScore,
    transcript: spokenText,
    wordBreakdown,
    missingWords,
    correctWords,
  };
};

const stopStream = () => {
  if (activeAudioStream) {
    try {
      activeAudioStream.getTracks().forEach((t) => t.stop());
    } catch (e) {}
    activeAudioStream = null;
  }
  if (activeAudioContext) {
    try {
      activeAudioContext.close();
    } catch (e) {}
    activeAudioContext = null;
  }
  if (activeVadTimer) {
    clearInterval(activeVadTimer);
    activeVadTimer = null;
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
    console.warn('Groq Whisper STT API notice:', err);
  }

  return '';
}

/**
 * Setup Voice Activity Detection (VAD) with generous 4.5-second silence tolerance.
 */
function setupVoiceActivityDetection(stream, onSilenceCutoff) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    activeAudioContext = new AudioCtx();
    const source = activeAudioContext.createMediaStreamSource(stream);
    const analyser = activeAudioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let speechDurationMs = 0;
    let silenceDurationMs = 0;
    const checkIntervalMs = 150;
    const silenceThresholdMs = 4500; // 4.5 seconds of sustained silence gives learner plenty of time!

    activeVadTimer = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avgVolume = sum / bufferLength;

      if (avgVolume > 20) {
        speechDurationMs += checkIntervalMs;
        silenceDurationMs = 0;
      } else if (speechDurationMs > 600) {
        // Only start silence timer after the user has actively spoken for at least 0.6s
        silenceDurationMs += checkIntervalMs;
        if (silenceDurationMs >= silenceThresholdMs) {
          clearInterval(activeVadTimer);
          activeVadTimer = null;
          if (typeof onSilenceCutoff === 'function') {
            onSilenceCutoff();
          }
        }
      }
    }, checkIntervalMs);
  } catch (e) {
    // VAD fallback
  }
}

/**
 * Real Microphone Session Engine (MediaRecorder + WebSpeech fallback)
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
    activeAudioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  } catch (micErr) {
    if (typeof onError === 'function') {
      onError(new Error('Microphone permission denied. Please allow microphone access in browser settings.'));
    }
    return;
  }

  // Setup Voice Activity Detection with 4.5s threshold
  setupVoiceActivityDetection(activeAudioStream, () => {
    stopListening();
  });

  let webSpeechAccumulatedText = '';

  // Start MediaRecorder for Whisper AI
  try {
    const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
    let selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

    activeMediaRecorder = selectedMime
      ? new MediaRecorder(activeAudioStream, { mimeType: selectedMime })
      : new MediaRecorder(activeAudioStream);

    activeMediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        activeAudioChunks.push(e.data);
      }
    };

    activeMediaRecorder.onstop = async () => {
      const audioBlob = new Blob(activeAudioChunks, { type: activeMediaRecorder?.mimeType || 'audio/webm' });
      activeAudioChunks = [];

      // 1. Try Whisper AI Speech Transcription first
      let transcript = await transcribeAudioWithWhisperAI(audioBlob);

      if (transcript && typeof currentOnFinal === 'function') {
        currentOnFinal(transcript);
        return;
      }

      // 2. Fallback to Web Speech accumulated transcript if Whisper returned empty
      if (webSpeechAccumulatedText && typeof currentOnFinal === 'function') {
        currentOnFinal(webSpeechAccumulatedText);
        return;
      }

      if (typeof currentOnFinal === 'function') {
        currentOnFinal(transcript || webSpeechAccumulatedText || '');
      }
    };

    activeMediaRecorder.start(250);
  } catch (recorderErr) {
    console.warn('MediaRecorder error, falling back to Web Speech:', recorderErr);
  }

  // Web Speech API for real-time live preview
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRec) {
    try {
      activeWebSpeechInstance = new SpeechRec();
      activeWebSpeechInstance.lang = 'en-US';
      activeWebSpeechInstance.continuous = true; // Stay listening through pauses
      activeWebSpeechInstance.interimResults = true;

      activeWebSpeechInstance.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += ' ' + event.results[i][0].transcript;
          } else {
            interim += ' ' + event.results[i][0].transcript;
          }
        }

        webSpeechAccumulatedText = (final + ' ' + interim).trim();

        if (interim && typeof currentOnInterim === 'function') {
          currentOnInterim(interim.trim());
        }
      };

      activeWebSpeechInstance.onerror = (e) => {
        if (e.error !== 'no-speech' && typeof currentOnError === 'function') {
          currentOnError(e);
        }
      };

      activeWebSpeechInstance.start();
    } catch (e) {}
  }

  // Generous 30 seconds session limit to read calmly
  maxSessionTimer = setTimeout(() => {
    stopListening();
  }, 30000);
};

export const stopListening = async () => {
  if (maxSessionTimer) {
    clearTimeout(maxSessionTimer);
    maxSessionTimer = null;
  }

  if (activeVadTimer) {
    clearInterval(activeVadTimer);
    activeVadTimer = null;
  }

  if (activeWebSpeechInstance) {
    try {
      activeWebSpeechInstance.stop();
    } catch (e) {}
    activeWebSpeechInstance = null;
  }

  if (activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
    try {
      activeMediaRecorder.stop();
    } catch (e) {}
  }
  activeMediaRecorder = null;

  stopStream();
};

export const recordAndEvaluateSpeech = async (targetSentence, onEvaluated, onError) => {
  currentTargetText = targetSentence;
  await startListening(
    (spoken) => {
      const evaluation = evaluateSpeech(currentTargetText, spoken);
      if (typeof onEvaluated === 'function') {
        onEvaluated(evaluation);
      }
    },
    onError,
    (interim) => {}
  );
};

export default {
  isSpeechRecognitionSupported,
  evaluateSpeech,
  startListening,
  stopListening,
  recordAndEvaluateSpeech,
};
