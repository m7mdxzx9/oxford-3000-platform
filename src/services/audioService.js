/**
 * Oxford 3000 CEFR Lexicon Application - Universal Audio Service (Facade)
 * Delegates to the unified singleton AudioEngine
 */

import { audioEngine, VOICE_PRESETS } from './audioEngine.js';

export { VOICE_PRESETS };

export const getAvailableVoices = () => audioEngine.getAvailableVoices();
export const buildGoogleTtsUrl = (text, lang) => audioEngine.buildGoogleTtsUrl(text, lang);
export const buildYoudaoTtsUrl = (text, type) => audioEngine.buildYoudaoTtsUrl(text, type);
export const playAudio = (text, options) => audioEngine.playAudio(text, options);
export const stopAudio = () => audioEngine.stopAudio();
export const isAudioPlaying = () => audioEngine.isAudioPlaying();
export const playWordAudio = (text, options) => audioEngine.playWordAudio(text, options);

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
