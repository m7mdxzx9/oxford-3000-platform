/**
 * Oxford 3000 CEFR Lexicon Application - Bulletproof Audio TTS Engine Service
 * Supports Web Speech API (US/UK Male/Female), dynamic voice loading, state reset, and multi-stream audio fallbacks.
 */

let currentAudioElement = null;
let isPlaying = false;
let currentResolve = null;
let cachedVoices = [];
let speechHeartbeatTimer = null;

export const VOICE_PRESETS = [
  { id: 'us-female', name: 'US English - Natural Female (Samantha / Zira)', lang: 'en-US', gender: 'female', type: 2 },
  { id: 'us-male', name: 'US English - Natural Male (Guy / Alex)', lang: 'en-US', gender: 'male', type: 2 },
  { id: 'uk-female', name: 'UK English - Natural Female (Fiona / Victoria)', lang: 'en-GB', gender: 'female', type: 1 },
  { id: 'uk-male', name: 'UK English - Natural Male (Oliver / Daniel)', lang: 'en-GB', gender: 'male', type: 1 }
];

// Initialize and cache voices dynamically
const initVoices = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
    try {
      cachedVoices = window.speechSynthesis.getVoices() || [];
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          try {
            cachedVoices = window.speechSynthesis.getVoices() || [];
          } catch (e) {}
        };
      }
    } catch (e) {}
  }
};

initVoices();

/**
 * Returns available Web Speech API voices filtered for English.
 */
export const getAvailableVoices = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  if (!cachedVoices || cachedVoices.length === 0) {
    try {
      cachedVoices = window.speechSynthesis.getVoices() || [];
    } catch (e) {}
  }
  return cachedVoices.filter(v => v && v.lang && v.lang.toLowerCase().startsWith('en'));
};

/**
 * Helper to select specific voice preset.
 */
const getVoiceByPreset = (presetId = 'us-female') => {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  const preset = VOICE_PRESETS.find(p => p.id === presetId) || VOICE_PRESETS[0];
  const targetLang = preset.lang.toLowerCase().replace('_', '-');

  // Search by exact locale first
  const langMatch = voices.filter(v => v.lang.toLowerCase().replace('_', '-') === targetLang);
  const pool = langMatch.length > 0 ? langMatch : voices;

  if (preset.gender === 'female') {
    const female = pool.find(v => /female|samantha|zira|karen|victoria|fiona|siri|google us english|natural/i.test(v.name));
    if (female) return female;
  } else if (preset.gender === 'male') {
    const male = pool.find(v => /male|guy|alex|david|george|daniel|oliver|google uk english male/i.test(v.name));
    if (male) return male;
  }

  return pool[0] || voices[0] || null;
};

/**
 * Build Google Translate TTS stream URL
 */
export const buildGoogleTtsUrl = (text, lang = 'en-US') => {
  if (!text || typeof text !== 'string') return '';
  const cleanLang = (lang || 'en-US').split('-')[0] || 'en';
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.trim())}&tl=${cleanLang}&client=tw-ob`;
};

/**
 * Build Youdao Dictionary TTS stream URL (Reliable for words & short phrases)
 */
export const buildYoudaoTtsUrl = (text, type = 2) => {
  if (!text || typeof text !== 'string') return '';
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text.trim())}&type=${type}`;
};

/**
 * Helper to chunk text into short sentences/phrases under 150 chars for clean stream playback
 */
const chunkTextForAudio = (text) => {
  if (!text) return [];
  const rawSentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];

  for (const s of rawSentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if (trimmed.length <= 150) {
      chunks.push(trimmed);
    } else {
      // Split long sentence by commas or spaces into ~120 char chunks
      const parts = trimmed.split(/,\s*/);
      let current = '';
      for (const part of parts) {
        if ((current + ' ' + part).length <= 150) {
          current = (current + ' ' + part).trim();
        } else {
          if (current) chunks.push(current);
          current = part.trim();
        }
      }
      if (current) chunks.push(current);
    }
  }

  return chunks.length > 0 ? chunks : [text.trim()];
};

/**
 * Secondary Engine: Multi-Stream Audio Fallback (Youdao & Google TTS) with Chaining
 */
const playAudioStreamFallback = (text, presetId, speed, onComplete) => {
  if (typeof Audio === 'undefined') {
    if (onComplete) onComplete();
    return;
  }

  const preset = VOICE_PRESETS.find(p => p.id === presetId) || VOICE_PRESETS[0];
  const chunks = chunkTextForAudio(text);

  let currentChunkIndex = 0;

  const playNextChunk = () => {
    if (currentChunkIndex >= chunks.length) {
      currentAudioElement = null;
      if (onComplete) onComplete();
      return;
    }

    const chunkText = chunks[currentChunkIndex];
    currentChunkIndex++;

    const wordCount = chunkText.trim().split(/\s+/).length;
    const url = wordCount < 6 
      ? buildYoudaoTtsUrl(chunkText, preset.type) 
      : buildGoogleTtsUrl(chunkText, preset.lang);

    try {
      currentAudioElement = new Audio(url);
      if (typeof speed === 'number' && speed > 0) {
        currentAudioElement.playbackRate = speed;
      }

      currentAudioElement.onended = playNextChunk;
      currentAudioElement.onerror = () => {
        // Fallback to Google TTS if Youdao fails
        if (wordCount < 6) {
          try {
            const secondaryUrl = buildGoogleTtsUrl(chunkText, preset.lang);
            currentAudioElement = new Audio(secondaryUrl);
            currentAudioElement.onended = playNextChunk;
            currentAudioElement.onerror = playNextChunk;
            currentAudioElement.play().catch(playNextChunk);
            return;
          } catch (e) {}
        }
        playNextChunk();
      };

      const playPromise = currentAudioElement.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {}).catch(playNextChunk);
      } else {
        playNextChunk();
      }
    } catch (e) {
      playNextChunk();
    }
  };

  playNextChunk();
};

/**
 * Bulletproof Audio Player using Web Speech API with Chrome Keep-Alive Heartbeat & multi-stream fallback.
 */
export const playAudio = async (text, options = {}) => {
  stopAudio();

  if (!text || typeof text !== 'string' || !text.trim()) {
    return Promise.resolve();
  }

  const {
    presetId = 'us-female',
    speed = 0.9,
    pitch = 1.0,
    lang = 'en-US'
  } = typeof options === 'object' ? options : { speed: options };

  const trimmed = text.trim();
  isPlaying = true;

  // Short delay after cancellation to prevent Chrome SpeechSynthesis lockup
  await new Promise(r => setTimeout(r, 80));

  return new Promise((resolve) => {
    currentResolve = resolve;

    const cleanup = () => {
      if (speechHeartbeatTimer) {
        clearInterval(speechHeartbeatTimer);
        speechHeartbeatTimer = null;
      }
      isPlaying = false;
      if (currentResolve === resolve) {
        currentResolve = null;
      }
      resolve();
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        const utterance = new SpeechSynthesisUtterance(trimmed);
        utterance.lang = lang;
        utterance.rate = typeof speed === 'number' ? speed : 0.9;
        utterance.pitch = typeof pitch === 'number' ? pitch : 1.0;

        const selectedVoice = getVoiceByPreset(presetId);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        let isEnded = false;

        utterance.onstart = () => {
          // Chrome SpeechSynthesis Keep-Alive Heartbeat (prevents browser from stopping speech midway)
          if (speechHeartbeatTimer) clearInterval(speechHeartbeatTimer);
          speechHeartbeatTimer = setInterval(() => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
              if (window.speechSynthesis.speaking) {
                window.speechSynthesis.pause();
                window.speechSynthesis.resume();
              } else {
                clearInterval(speechHeartbeatTimer);
                speechHeartbeatTimer = null;
              }
            }
          }, 3500);
        };

        utterance.onend = () => {
          if (!isEnded) {
            isEnded = true;
            cleanup();
          }
        };

        utterance.onerror = (evt) => {
          console.warn('Web Speech API error, switching to Audio Stream Fallback:', evt);
          if (!isEnded) {
            isEnded = true;
            if (speechHeartbeatTimer) {
              clearInterval(speechHeartbeatTimer);
              speechHeartbeatTimer = null;
            }
            playAudioStreamFallback(trimmed, presetId, speed, cleanup);
          }
        };

        window.speechSynthesis.speak(utterance);
        window.speechSynthesis.resume();

        // Safety timeout if browser SpeechSynthesis hangs without firing onend
        const estimatedDuration = Math.max(3000, (trimmed.length / 8) * 1000);
        setTimeout(() => {
          if (!isEnded && isPlaying) {
            isEnded = true;
            cleanup();
          }
        }, estimatedDuration + 2000);

        return;
      } catch (err) {
        console.warn('SpeechSynthesis exception:', err);
      }
    }

    playAudioStreamFallback(trimmed, presetId, speed, cleanup);
  });
};

/**
 * Stops any active audio immediately.
 */
export const stopAudio = () => {
  if (speechHeartbeatTimer) {
    clearInterval(speechHeartbeatTimer);
    speechHeartbeatTimer = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }

  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch (e) {}
    currentAudioElement = null;
  }

  if (currentResolve) {
    const resolve = currentResolve;
    currentResolve = null;
    resolve();
  }

  isPlaying = false;
};

export const isAudioPlaying = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
    if (window.speechSynthesis.speaking) return true;
  }
  if (currentAudioElement && !currentAudioElement.paused) return true;
  return isPlaying;
};

export default {
  playAudio,
  stopAudio,
  isAudioPlaying,
  getAvailableVoices,
  VOICE_PRESETS,
  buildGoogleTtsUrl,
  buildYoudaoTtsUrl,
};

