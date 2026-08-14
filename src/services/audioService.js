/**
 * Oxford 3000 CEFR Lexicon Application - Bulletproof Universal Audio TTS Engine
 * Mobile & Desktop Compliant: SpeechSynthesis API + Google/Youdao Stream Fallback
 */

let currentAudioElement = null;
let isPlaying = false;
let currentResolve = null;
let cachedVoices = [];
let speechHeartbeatTimer = null;
let globalAudioSessionId = 0;

export const VOICE_PRESETS = [
  { id: 'us-female', name: 'US English - Natural Female (Samantha / Zira)', lang: 'en-US', gender: 'female', type: 2 },
  { id: 'us-male', name: 'US English - Natural Male (Guy / Alex)', lang: 'en-US', gender: 'male', type: 2 },
  { id: 'uk-female', name: 'UK English - Natural Female (Fiona / Victoria)', lang: 'en-GB', gender: 'female', type: 1 },
  { id: 'uk-male', name: 'UK English - Natural Male (Oliver / Daniel)', lang: 'en-GB', gender: 'male', type: 1 }
];

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

export const getAvailableVoices = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  if (!cachedVoices || cachedVoices.length === 0) {
    try {
      cachedVoices = window.speechSynthesis.getVoices() || [];
    } catch (e) {}
  }
  return cachedVoices.filter((v) => v && v.lang && v.lang.toLowerCase().startsWith('en'));
};

const getVoiceByPreset = (presetId = 'us-female') => {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  const preset = VOICE_PRESETS.find((p) => p.id === presetId) || VOICE_PRESETS[0];
  const targetLang = preset.lang.toLowerCase().replace('_', '-');

  const langMatch = voices.filter((v) => v.lang.toLowerCase().replace('_', '-') === targetLang);
  const pool = langMatch.length > 0 ? langMatch : voices;

  if (preset.gender === 'female') {
    const female = pool.find((v) => /female|samantha|zira|karen|victoria|fiona|siri|google us english|natural/i.test(v.name));
    if (female) return female;
  } else if (preset.gender === 'male') {
    const male = pool.find((v) => /male|guy|alex|david|george|daniel|oliver|google uk english male/i.test(v.name));
    if (male) return male;
  }

  return pool[0] || voices[0] || null;
};

export const buildGoogleTtsUrl = (text, lang = 'en-US') => {
  if (!text || typeof text !== 'string') return '';
  const cleanLang = (lang || 'en-US').split('-')[0] || 'en';
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.trim())}&tl=${cleanLang}&client=tw-ob`;
};

export const buildYoudaoTtsUrl = (text, type = 2) => {
  if (!text || typeof text !== 'string') return '';
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text.trim())}&type=${type}`;
};

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

  const preset = VOICE_PRESETS.find((p) => p.id === presetId) || VOICE_PRESETS[0];
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
    const url = wordCount < 6 ? buildYoudaoTtsUrl(chunkText, preset.type) : buildGoogleTtsUrl(chunkText, preset.lang);

    try {
      currentAudioElement = new Audio(url);
      if (typeof speed === 'number' && speed > 0) {
        currentAudioElement.playbackRate = speed;
      }

      currentAudioElement.onended = playNextChunk;
      currentAudioElement.onerror = () => {
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
 * Bulletproof Universal Audio Player with Session Mutex Lock
 */
export const playAudio = async (text, options = {}) => {
  stopAudio();

  const currentSessionId = ++globalAudioSessionId;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return Promise.resolve();
  }

  const { presetId = 'us-female', speed = 0.9, pitch = 1.0, lang = 'en-US' } = typeof options === 'object' ? options : { speed: options };

  const trimmed = text.trim();
  isPlaying = true;

  await new Promise((r) => setTimeout(r, 40));
  if (currentSessionId !== globalAudioSessionId) return Promise.resolve();

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
          // Safe heartbeat: ONLY call resume() if paused; NEVER call pause() on mobile!
          if (speechHeartbeatTimer) clearInterval(speechHeartbeatTimer);
          speechHeartbeatTimer = setInterval(() => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
              if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
              }
            } else {
              if (speechHeartbeatTimer) clearInterval(speechHeartbeatTimer);
            }
          }, 3000);
        };

        utterance.onend = () => {
          if (!isEnded) {
            isEnded = true;
            cleanup();
          }
        };

        utterance.onerror = (evt) => {
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

        const estimatedDuration = Math.max(3000, (trimmed.length / 8) * 1000);
        setTimeout(() => {
          if (!isEnded && isPlaying) {
            isEnded = true;
            cleanup();
          }
        }, estimatedDuration + 2500);

        return;
      } catch (err) {
        console.warn('SpeechSynthesis exception, falling back to Audio Stream:', err);
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
      currentAudioElement.src = '';
    } catch (e) {}
    currentAudioElement = null;
  }

  isPlaying = false;
  if (currentResolve) {
    currentResolve();
    currentResolve = null;
  }
};

export const isAudioPlaying = () => isPlaying;

/**
 * Universal helper alias for playing single word or sentence audio
 */
export const playWordAudio = (text, options = {}) => {
  const presetId = options.preset || options.presetId || 'us-female';
  const speed = options.speed !== undefined ? options.speed : 1.0;
  return playAudio(text, { presetId, speed });
};

export default {
  playAudio,
  playWordAudio,
  stopAudio,
  buildGoogleTtsUrl,
  buildYoudaoTtsUrl,
  getAvailableVoices,
  isAudioPlaying,
  VOICE_PRESETS,
};
