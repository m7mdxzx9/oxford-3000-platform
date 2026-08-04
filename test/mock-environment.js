/**
 * Hermetic Web & Browser API Mocks for Oxford 3000 CEFR Lexicon Application
 * Polyfills for Web Speech API, Speech Recognition, Fetch, LocalStorage, and Audio.
 */

export function setupMockEnvironment() {
  const store = new Map();

  // 1. LocalStorage Polyfill
  const mockLocalStorage = {
    getItem: (key) => store.get(String(key)) || null,
    setItem: (key, val) => store.set(String(key), String(val)),
    removeItem: (key) => store.delete(String(key)),
    clear: () => store.clear(),
    key: (idx) => Array.from(store.keys())[idx] || null,
    get length() { return store.size; }
  };

  // 2. Web Speech API Utterance & Synthesis Polyfill
  class MockSpeechSynthesisUtterance {
    constructor(text = '') {
      this.text = text;
      this.lang = 'en-US';
      this.rate = 1.0;
      this.pitch = 1.0;
      this.volume = 1.0;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
    }
  }

  const mockSpeechSynthesis = {
    speaking: false,
    pending: false,
    paused: false,
    speak(utterance) {
      this.speaking = true;
      if (typeof utterance.onstart === 'function') utterance.onstart();
      setTimeout(() => {
        this.speaking = false;
        if (typeof utterance.onend === 'function') utterance.onend();
      }, 5);
    },
    cancel() {
      this.speaking = false;
      this.pending = false;
    },
    pause() { this.paused = true; },
    resume() { this.paused = false; },
    getVoices() {
      return [
        { name: 'Google US English', lang: 'en-US', default: true },
        { name: 'Google UK English Female', lang: 'en-GB', default: false }
      ];
    }
  };

  // 3. Speech Recognition (webkitSpeechRecognition) Polyfill
  class MockSpeechRecognition {
    constructor() {
      this.continuous = false;
      this.interimResults = false;
      this.lang = 'en-US';
      this.onstart = null;
      this.onresult = null;
      this.onerror = null;
      this.onend = null;
    }

    start() {
      if (typeof this.onstart === 'function') this.onstart();
      setTimeout(() => {
        if (typeof this.onresult === 'function') {
          const event = {
            resultIndex: 0,
            results: [[
              { transcript: 'hello world', confidence: 0.95 }
            ]]
          };
          this.onresult(event);
        }
        if (typeof this.onend === 'function') this.onend();
      }, 5);
    }

    stop() {
      if (typeof this.onend === 'function') this.onend();
    }

    abort() {
      if (typeof this.onend === 'function') this.onend();
    }
  }

  // 4. Offline Fetch Interceptor
  const mockFetch = async (url, options = {}) => {
    const urlStr = String(url);

    // Gemini API Interceptor
    if (urlStr.includes('generativelanguage.googleapis.com')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  word: 'resilient',
                  pos: 'adjective',
                  cefr: 'B2',
                  arabic: 'مرن / قادِر على التعافي',
                  example: 'She is resilient in the face of adversity.',
                  ipa: '/rɪˈzɪl.jənt/'
                })
              }]
            }
          }]
        })
      };
    }

    // Google Translate TTS Stream Interceptor
    if (urlStr.includes('translate.google.com/translate_tts')) {
      return {
        ok: true,
        status: 200,
        arrayBuffer: async () => new ArrayBuffer(1024),
        blob: async () => new Blob(['mock-audio'], { type: 'audio/mp3' })
      };
    }

    // Default Interceptor Response
    return {
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok' }),
      text: async () => 'OK'
    };
  };

  // 5. Audio Element Polyfill
  class MockAudio {
    constructor(src = '') {
      this.src = src;
      this.paused = true;
      this.currentTime = 0;
    }
    async play() {
      this.paused = false;
      return Promise.resolve();
    }
    pause() {
      this.paused = true;
    }
    addEventListener(event, callback) {}
    removeEventListener(event, callback) {}
  }

  // Global Scope Attachments
  global.window = global.window || {};
  global.document = global.document || {
    createElement: (tag) => ({ tag, setAttribute: () => {}, style: {} }),
    querySelector: () => null,
    querySelectorAll: () => []
  };

  try {
    if (!global.navigator) {
      Object.defineProperty(global, 'navigator', {
        value: { userAgent: 'node' },
        writable: true,
        configurable: true
      });
    }
  } catch (e) {}

  global.localStorage = mockLocalStorage;
  global.window.localStorage = mockLocalStorage;

  global.window.speechSynthesis = mockSpeechSynthesis;
  global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
  global.window.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

  global.window.webkitSpeechRecognition = MockSpeechRecognition;
  global.window.SpeechRecognition = MockSpeechRecognition;

  global.fetch = mockFetch;
  global.window.fetch = mockFetch;

  global.Audio = MockAudio;
  global.window.Audio = MockAudio;

  return {
    reset() {
      store.clear();
      mockSpeechSynthesis.cancel();
      global.window.speechSynthesis = mockSpeechSynthesis;
      global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
      global.window.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
      global.window.webkitSpeechRecognition = MockSpeechRecognition;
      global.window.SpeechRecognition = MockSpeechRecognition;
      global.fetch = mockFetch;
      global.window.fetch = mockFetch;
    }
  };
}

export default setupMockEnvironment;
