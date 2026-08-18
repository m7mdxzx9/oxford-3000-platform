/**
 * Sound Effects Engine using Web Audio API (Facade)
 * Delegates to the unified singleton AudioEngine
 */

import { audioEngine } from './audioEngine.js';

export const playTabSwitchSound = () => audioEngine.playTabSwitchSound();
export const playSuccessChime = () => audioEngine.playSuccessChime();
export const playButtonClickSound = () => audioEngine.playButtonClickSound();
export const playErrorBeep = () => audioEngine.playErrorBeep();

export default {
  playTabSwitchSound,
  playSuccessChime,
  playButtonClickSound,
  playErrorBeep,
};
