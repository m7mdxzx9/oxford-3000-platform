/**
 * Oxford 3000 CEFR Lexicon Application - Asynchronous IndexedDB Storage Layer
 * High-performance, quota-free storage for user profiles, voice recordings, and SRS logs.
 */

const DB_NAME = 'Oxford3000_IndexedDB';
const DB_VERSION = 1;

const STORES = {
  USER_PROFILES: 'user_profiles',
  VOICE_RECORDINGS: 'voice_recordings',
  SRS_ITEMS: 'srs_items',
  CUSTOM_TERMS: 'custom_terms',
};

let dbInstance = null;

/**
 * Initializes and opens the IndexedDB database instance.
 */
export const openDatabase = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }
    if (typeof window === 'undefined' || !window.indexedDB) {
      return resolve(null); // Fallback gracefully if indexedDB is unavailable
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORES.USER_PROFILES)) {
        db.createObjectStore(STORES.USER_PROFILES, { keyPath: 'username' });
      }
      if (!db.objectStoreNames.contains(STORES.VOICE_RECORDINGS)) {
        const voiceStore = db.createObjectStore(STORES.VOICE_RECORDINGS, { keyPath: 'id' });
        voiceStore.createIndex('by_word', 'word', { unique: false });
        voiceStore.createIndex('by_timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.SRS_ITEMS)) {
        const srsStore = db.createObjectStore(STORES.SRS_ITEMS, { keyPath: 'id' });
        srsStore.createIndex('by_user', 'username', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.CUSTOM_TERMS)) {
        db.createObjectStore(STORES.CUSTOM_TERMS, { keyPath: 'word' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.warn('IndexedDB open error:', event.target.error);
      resolve(null);
    };
  });
};

/**
 * Executes a transaction on an object store safely.
 */
const runTransaction = async (storeName, mode, callback) => {
  const db = await openDatabase();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const result = callback(store);

      transaction.oncomplete = () => resolve(result);
      transaction.onerror = (e) => {
        console.warn(`IndexedDB transaction error in ${storeName}:`, e.target.error);
        resolve(null);
      };
    } catch (err) {
      console.warn(`IndexedDB error:`, err);
      resolve(null);
    }
  });
};

// ============================================================================
// 1. VOICE RECORDINGS STORAGE (Unlimited Blobs)
// ============================================================================

export const saveVoiceRecording = async (recording) => {
  const item = {
    id: recording.id || Date.now().toString() + Math.random().toString(36).substring(2, 6),
    word: recording.word || '',
    arabic: recording.arabic || '',
    audioBlob: recording.audioBlob || null,
    audioDataUrl: recording.audioDataUrl || null,
    score: recording.score || 0,
    timestamp: recording.timestamp || Date.now(),
    dateStr: recording.dateStr || new Date().toLocaleDateString('ar-SA'),
  };

  await runTransaction(STORES.VOICE_RECORDINGS, 'readwrite', (store) => {
    store.put(item);
  });

  return item;
};

export const getAllVoiceRecordings = async () => {
  const db = await openDatabase();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORES.VOICE_RECORDINGS, 'readonly');
      const store = transaction.objectStore(STORES.VOICE_RECORDINGS);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = request.result || [];
        records.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        resolve(records);
      };
      request.onerror = () => resolve([]);
    } catch (e) {
      resolve([]);
    }
  });
};

export const deleteVoiceRecording = async (id) => {
  return runTransaction(STORES.VOICE_RECORDINGS, 'readwrite', (store) => {
    store.delete(id);
  });
};

export const clearAllVoiceRecordings = async () => {
  return runTransaction(STORES.VOICE_RECORDINGS, 'readwrite', (store) => {
    store.clear();
  });
};

// ============================================================================
// 2. USER PROFILE & SRS STORAGE
// ============================================================================

export const saveUserProfileToDb = async (username, data) => {
  const safeUser = username ? username.trim() : 'guest';
  const profile = {
    username: safeUser,
    ...data,
    updatedAt: Date.now(),
  };

  return runTransaction(STORES.USER_PROFILES, 'readwrite', (store) => {
    store.put(profile);
  });
};

export const getUserProfileFromDb = async (username) => {
  const safeUser = username ? username.trim() : 'guest';
  const db = await openDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORES.USER_PROFILES, 'readonly');
      const store = transaction.objectStore(STORES.USER_PROFILES);
      const request = store.get(safeUser);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
};

// ============================================================================
// 3. AUTOMATIC SEAMLESS MIGRATION FROM LOCALSTORAGE
// ============================================================================

export const autoMigrateLocalStorageToIndexedDB = async () => {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const isMigrated = localStorage.getItem('oxford3000_idb_migrated');
    if (isMigrated === 'true') return;

    // Migrate voice recordings if present
    const savedAudio = localStorage.getItem('oxford3000_voice_archive');
    if (savedAudio) {
      try {
        const audioList = JSON.parse(savedAudio);
        if (Array.isArray(audioList)) {
          for (const item of audioList) {
            await saveVoiceRecording(item);
          }
        }
      } catch (e) {}
    }

    // Migrate profiles (محمد and ريوف)
    const users = ['محمد', 'ريوف', 'guest'];
    for (const u of users) {
      const safeKey = encodeURIComponent(u);
      const mastered = localStorage.getItem(`oxford3000_user_${safeKey}_mastered_words`);
      const favorites = localStorage.getItem(`oxford3000_user_${safeKey}_favorite_words`);
      const srsData = localStorage.getItem(`oxford3000_user_${safeKey}_srs_records`);
      const xp = localStorage.getItem(`oxford3000_user_${safeKey}_xp`);

      if (mastered || favorites || srsData || xp) {
        await saveUserProfileToDb(u, {
          mastered: mastered ? JSON.parse(mastered) : [],
          favorites: favorites ? JSON.parse(favorites) : [],
          srs: srsData ? JSON.parse(srsData) : {},
          xp: xp ? parseInt(xp, 10) : 0,
        });
      }
    }

    localStorage.setItem('oxford3000_idb_migrated', 'true');
  } catch (err) {
    console.warn('Auto migration notice:', err);
  }
};

export default {
  openDatabase,
  saveVoiceRecording,
  getAllVoiceRecordings,
  deleteVoiceRecording,
  clearAllVoiceRecordings,
  saveUserProfileToDb,
  getUserProfileFromDb,
  autoMigrateLocalStorageToIndexedDB,
};
