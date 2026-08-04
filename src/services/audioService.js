/**
 * Oxford 3000 CEFR Lexicon Application - Advanced Audio TTS Engine Service
 * Supports multiple human-like voices (US Female, US Male, UK Female, UK Male), pitch, rate, and fallback.
 */

let currentAudioElement = null;
let isPlaying = false;
let currentResolve = null;

export const VOICE_PRESETS = [
  { id: 'us-female', name: 'US English - Natural Female (Karen / Samantha)', lang: 'en-US', gender: 'female' },
  { id: 'us-male', name: 'US English - Natural Male (Guy / Alex)', lang: 'en-US', gender: 'male' },
  { id: 'uk-female', name: 'UK English - Natural Female (Fiona / Victoria)', lang: 'en-GB', gender: 'female' },
  { id: 'uk-male', name: 'UK English - Natural Male (Oliver / Daniel)', lang: 'en-GB', gender: 'male' }
];

/**
 * Returns available Web Speech API voices filtered for English.
 */
export const getAvailableVoices = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis.getVoices) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices() || [];
  return voices.filter(v => v && v.lang && v.lang.toLowerCase().startsWith('en'));
};

/**
 * Helper to select specific voice preset.
 */
const getVoiceByPreset = (presetId = 'us-female') => {
  const voices = getAvailableVoices();
  if (!voices || voices.length === 0) return null;

  const preset = VOICE_PRESETS.find(p => p.id === presetId) || VOICE_PRESETS[0];

  // Search by exact locale first
  const langMatch = voices.filter(v => v.lang.toLowerCase().replace('_', '-') === preset.lang.toLowerCase());

  if (preset.gender === 'female') {
    const female = langMatch.find(v => /female|samantha|zira|karen|victoria|fiona|google us english|natural/i.test(v.name));
    if (female) return female;
  } else if (preset.gender === 'male') {
    const male = langMatch.find(v => /male|guy|alex|david|george|daniel|oliver|google uk english male/i.test(v.name));
    if (male) return male;
  }

  return langMatch[0] || voices.find(v => v.default) || voices[0] || null;
};

/**
 * Build Google Translate TTS fallback stream URL
 */
export const buildGoogleTtsUrl = (text, lang = 'en-US') => {
  if (!text || typeof text !== 'string') return '';
  const cleanLang = (lang || 'en-US').split('-')[0] || 'en';
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.trim())}&tl=${cleanLang}&client=tw-ob`;
};

/**
 * Secondary Engine: Google Translate TTS Stream
 */
const playGoogleTtsFallback = (text, lang, speed, onComplete) => {
  const url = buildGoogleTtsUrl(text, lang);
  if (typeof Audio === 'undefined') {
    if (onComplete) onComplete();
    return;
  }

  try {
    currentAudioElement = new Audio(url);
    if (typeof speed === 'number' && speed > 0) {
      currentAudioElement.playbackRate = speed;
    }

    let completed = false;
    const finish = () => {
      if (!completed) {
        completed = true;
        currentAudioElement = null;
        if (onComplete) onComplete();
      }
    };

    currentAudioElement.onended = finish;
    currentAudioElement.onerror = (err) => {
      console.warn('Google TTS stream error:', err);
      finish();
    };

    const playPromise = currentAudioElement.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {}).catch(() => finish());
    } else {
      finish();
    }
  } catch (e) {
    currentAudioElement = null;
    if (onComplete) onComplete();
  }
};

/**
 * Plays audio using Web Speech API or Google Translate TTS.
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

  return new Promise((resolve) => {
    currentResolve = resolve;

    const cleanup = () => {
      isPlaying = false;
      if (currentResolve === resolve) {
        currentResolve = null;
      }
      resolve();
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        const utterance = new SpeechSynthesisUtterance(trimmed);
        utterance.lang = lang;
        utterance.rate = typeof speed === 'number' ? speed : 0.9;
        utterance.pitch = typeof pitch === 'number' ? pitch : 1.0;

        const voice = getVoiceByPreset(presetId);
        if (voice) {
          utterance.voice = voice;
        }

        utterance.onend = cleanup;
        utterance.onerror = (evt) => {
          console.warn('Web Speech API error, falling back to Google TTS:', evt);
          playGoogleTtsFallback(trimmed, lang, speed, cleanup);
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('SpeechSynthesis error:', err);
      }
    }

    playGoogleTtsFallback(trimmed, lang, speed, cleanup);
  });
};

/**
 * Stops any active audio.
 */
export const stopAudio = () => {
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
};
