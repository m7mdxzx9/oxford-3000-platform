/**
 * Oxford 3000 CEFR Lexicon Application - Bulletproof Universal Audio Engine
 * Unified Singleton Architecture for TTS, Procedural SFX & MediaStream Management
 */

export const VOICE_PRESETS = [
  { id: 'us-female', name: 'US English - Natural Female (Samantha / Zira)', lang: 'en-US', gender: 'female', type: 2 },
  { id: 'us-male', name: 'US English - Natural Male (Guy / Alex)', lang: 'en-US', gender: 'male', type: 2 },
  { id: 'uk-female', name: 'UK English - Natural Female (Fiona / Victoria)', lang: 'en-GB', gender: 'female', type: 1 },
  { id: 'uk-male', name: 'UK English - Natural Male (Oliver / Daniel)', lang: 'en-GB', gender: 'male', type: 1 }
];

export class AudioEngine {
  static instance = null;

  constructor() {
    this.currentAudioElement = null;
    this.isPlaying = false;
    this.currentResolve = null;
    this.cachedVoices = [];
    this.speechHeartbeatTimer = null;
    this.globalAudioSessionId = 0;
    this.audioContext = null;
    this.activeStreams = new Set();

    this.initVoices();
  }

  static getInstance() {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        this.cachedVoices = window.speechSynthesis.getVoices() || [];
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => {
            try {
              this.cachedVoices = window.speechSynthesis.getVoices() || [];
            } catch (e) {}
          };
        }
      } catch (e) {}
    }
  }

  getAudioContext() {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
        }
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
      return this.audioContext;
    } catch (e) {
      return null;
    }
  }

  getAvailableVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [];
    }
    if (!this.cachedVoices || this.cachedVoices.length === 0) {
      try {
        this.cachedVoices = window.speechSynthesis.getVoices() || [];
      } catch (e) {}
    }
    return this.cachedVoices.filter((v) => v && v.lang && v.lang.toLowerCase().startsWith('en'));
  }

  getVoiceByPreset(presetId = 'us-female') {
    const voices = this.getAvailableVoices();
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
  }

  buildGoogleTtsUrl(text, lang = 'en-US') {
    if (!text || typeof text !== 'string') return '';
    const cleanLang = (lang || 'en-US').split('-')[0] || 'en';
    return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.trim())}&tl=${cleanLang}&client=tw-ob`;
  }

  buildYoudaoTtsUrl(text, type = 2) {
    if (!text || typeof text !== 'string') return '';
    return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text.trim())}&type=${type}`;
  }

  chunkTextForAudio(text) {
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
  }

  playAudioStreamFallback(text, presetId, speed, onComplete) {
    if (typeof Audio === 'undefined') {
      if (onComplete) onComplete();
      return;
    }

    const preset = VOICE_PRESETS.find((p) => p.id === presetId) || VOICE_PRESETS[0];
    const chunks = this.chunkTextForAudio(text);

    let currentChunkIndex = 0;

    const playNextChunk = () => {
      if (currentChunkIndex >= chunks.length) {
        this.currentAudioElement = null;
        if (onComplete) onComplete();
        return;
      }

      const chunkText = chunks[currentChunkIndex];
      currentChunkIndex++;

      const wordCount = chunkText.trim().split(/\s+/).length;
      const url = wordCount < 6 ? this.buildYoudaoTtsUrl(chunkText, preset.type) : this.buildGoogleTtsUrl(chunkText, preset.lang);

      try {
        this.currentAudioElement = new Audio(url);
        if (typeof speed === 'number' && speed > 0) {
          this.currentAudioElement.playbackRate = speed;
        }

        this.currentAudioElement.onended = playNextChunk;
        this.currentAudioElement.onerror = () => {
          if (wordCount < 6) {
            try {
              const secondaryUrl = this.buildGoogleTtsUrl(chunkText, preset.lang);
              this.currentAudioElement = new Audio(secondaryUrl);
              this.currentAudioElement.onended = playNextChunk;
              this.currentAudioElement.onerror = playNextChunk;
              this.currentAudioElement.play().catch(playNextChunk);
              return;
            } catch (e) {}
          }
          playNextChunk();
        };

        const playPromise = this.currentAudioElement.play();
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
  }

  async playAudio(text, options = {}) {
    this.stopAudio();

    const currentSessionId = ++this.globalAudioSessionId;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return Promise.resolve();
    }

    const { presetId = 'us-female', speed = 0.9, pitch = 1.0, lang = 'en-US' } =
      typeof options === 'object' ? options : { speed: options };

    const trimmed = text.trim();
    this.isPlaying = true;

    await new Promise((r) => setTimeout(r, 40));
    if (currentSessionId !== this.globalAudioSessionId) return Promise.resolve();

    return new Promise((resolve) => {
      this.currentResolve = resolve;

      const cleanup = () => {
        if (this.speechHeartbeatTimer) {
          clearInterval(this.speechHeartbeatTimer);
          this.speechHeartbeatTimer = null;
        }
        this.isPlaying = false;
        if (this.currentResolve === resolve) {
          this.currentResolve = null;
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

          const selectedVoice = this.getVoiceByPreset(presetId);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }

          let isEnded = false;

          utterance.onstart = () => {
            if (this.speechHeartbeatTimer) clearInterval(this.speechHeartbeatTimer);
            this.speechHeartbeatTimer = setInterval(() => {
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                if (window.speechSynthesis.paused) {
                  window.speechSynthesis.resume();
                }
              } else {
                if (this.speechHeartbeatTimer) clearInterval(this.speechHeartbeatTimer);
              }
            }, 3000);
          };

          utterance.onend = () => {
            if (!isEnded) {
              isEnded = true;
              cleanup();
            }
          };

          utterance.onerror = () => {
            if (!isEnded) {
              isEnded = true;
              if (this.speechHeartbeatTimer) {
                clearInterval(this.speechHeartbeatTimer);
                this.speechHeartbeatTimer = null;
              }
              this.playAudioStreamFallback(trimmed, presetId, speed, cleanup);
            }
          };

          window.speechSynthesis.speak(utterance);

          const estimatedDuration = Math.max(3000, (trimmed.length / 8) * 1000);
          setTimeout(() => {
            if (!isEnded && this.isPlaying) {
              isEnded = true;
              cleanup();
            }
          }, estimatedDuration + 2500);

          return;
        } catch (err) {
          console.warn('SpeechSynthesis exception, falling back to Audio Stream:', err);
        }
      }

      this.playAudioStreamFallback(trimmed, presetId, speed, cleanup);
    });
  }

  stopAudio() {
    if (this.speechHeartbeatTimer) {
      clearInterval(this.speechHeartbeatTimer);
      this.speechHeartbeatTimer = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
        this.currentAudioElement.src = '';
      } catch (e) {}
      this.currentAudioElement = null;
    }

    this.isPlaying = false;
    if (this.currentResolve) {
      this.currentResolve();
      this.currentResolve = null;
    }
  }

  playWordAudio(text, options = {}) {
    const presetId = options.preset || options.presetId || 'us-female';
    const speed = options.speed !== undefined ? options.speed : 1.0;
    return this.playAudio(text, { presetId, speed });
  }

  isAudioPlaying() {
    return this.isPlaying;
  }

  // --- Microphone & MediaStream Lifecycle Management ---
  registerMediaStream(stream) {
    if (stream && typeof stream.getTracks === 'function') {
      this.activeStreams.add(stream);
    }
  }

  releaseMediaStream(stream) {
    if (stream && typeof stream.getTracks === 'function') {
      try {
        stream.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      this.activeStreams.delete(stream);
    }
  }

  releaseAllMediaStreams() {
    this.activeStreams.forEach((stream) => {
      try {
        stream.getTracks().forEach((track) => track.stop());
      } catch (e) {}
    });
    this.activeStreams.clear();
  }

  // --- Procedural Sound Effects ---
  playTabSwitchSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;

      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  playSuccessChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime + idx * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch (e) {}
  }

  playButtonClickSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  playErrorBeep() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(180, now + 0.1);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }
}

export const audioEngine = AudioEngine.getInstance();
export default audioEngine;
