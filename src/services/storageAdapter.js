/**
 * Oxford 3000 CEFR Platform - Resilient Storage Adapter
 * Provides fail-safe persistence with corruption recovery, in-memory fallback,
 * and user-scoped data isolation.
 */

class InMemoryStorage {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

// Fallback in-memory store if localStorage is disabled or throws QuotaExceededError
const memoryStore = new InMemoryStorage();

const getRawStorage = () => {
  if (typeof window === 'undefined') return memoryStore;
  try {
    const testKey = '__oxford_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (e) {
    console.warn('LocalStorage unavailable or restricted. Operating with in-memory storage fallback.');
    return memoryStore;
  }
};

export const STORAGE_KEYS = {
  SCHEMA_VERSION: 'oxford3000_schema_version',
  AUTH_USER: 'oxford3000_auth_user',
  THEME: 'oxford3000_theme',
  COLOR_PALETTE: 'oxford3000_color_palette',
  CUSTOM_THEME_COLORS: 'oxford3000_custom_theme_colors',
  MODE: 'oxford3000_mode',
  LANGUAGE: 'oxford3000_language',
  VOICE_PRESET: 'oxford3000_voice_preset',
  AUDIO_SPEED: 'oxford3000_audio_speed',
  API_KEY: 'oxford3000_gemini_api_key',
  GROQ_API_KEY: 'oxford3000_groq_api_key',
  NVIDIA_API_KEY: 'oxford3000_nvidia_api_key',
  PEXELS_API_KEY: 'oxford3000_pexels_api_key',
  USER_SESSION: 'oxford3000_user_session',
  SIBLING_STATS: 'oxford3000_sibling_stats',
  IDB_MIGRATED: 'oxford3000_idb_migrated',
};

export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Returns a user-scoped key to ensure complete data isolation between accounts
 */
export const getUserKey = (username, key) => {
  const safeUser = username ? encodeURIComponent(String(username).trim()) : 'guest';
  return `oxford3000_user_${safeUser}_${key}`;
};

export class StorageAdapter {
  static getItem(key, fallback = null) {
    const storage = getRawStorage();
    try {
      const raw = storage.getItem(key);
      if (raw === null || raw === undefined || raw === 'undefined') {
        return fallback;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`StorageAdapter: Corrupted data for key "${key}". Resetting to fallback default.`, err);
      // Auto-heal corrupted storage key
      try {
        storage.setItem(key, JSON.stringify(fallback));
      } catch (writeErr) {}
      return fallback;
    }
  }

  static setItem(key, value) {
    const storage = getRawStorage();
    try {
      const serialized = JSON.stringify(value);
      storage.setItem(key, serialized);
      return true;
    } catch (err) {
      console.error(`StorageAdapter: Failed to persist key "${key}".`, err);
      try {
        memoryStore.setItem(key, JSON.stringify(value));
      } catch (memErr) {}
      return false;
    }
  }

  static removeItem(key) {
    const storage = getRawStorage();
    try {
      storage.removeItem(key);
      memoryStore.removeItem(key);
      return true;
    } catch (err) {
      return false;
    }
  }

  static getString(key, fallback = '') {
    const storage = getRawStorage();
    try {
      const val = storage.getItem(key);
      return val !== null && val !== undefined ? String(val) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  static setString(key, value) {
    const storage = getRawStorage();
    try {
      storage.setItem(key, String(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  // User-scoped convenience helpers
  static getUserItem(username, key, fallback = null) {
    return this.getItem(getUserKey(username, key), fallback);
  }

  static setUserItem(username, key, value) {
    return this.setItem(getUserKey(username, key), value);
  }

  static removeUserItem(username, key) {
    return this.removeItem(getUserKey(username, key));
  }
}

export default StorageAdapter;
