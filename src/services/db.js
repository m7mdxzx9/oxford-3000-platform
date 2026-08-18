/**
 * ============================================================================
 * File: src/services/db.js
 * Purpose: Enterprise IndexedDB Layer powered by Dexie.js
 * Connected To: AppContext.jsx, Flashcards.jsx, VirtualLexiconGrid.jsx, backupService.js
 * Description:
 *   Replaces legacy localStorage data persistence with a robust, asynchronous
 *   IndexedDB database ('Oxford3000DB'). Manages two primary tables:
 *     1. `words`: Complete 3000-word lexicon dataset.
 *     2. `progress`: FSRS spaced repetition user progress and history.
 * ============================================================================
 */

import Dexie from 'dexie';

// 1. Initialize Dexie Database
export const db = new Dexie('Oxford3000DB');

// 2. Define Database Schema and Versions
db.version(1).stores({
  words: '++id, word, cefr, pos, ipa',
  progress: 'wordId, nextReview, state, repetitions, stability, difficulty, lastReview',
});

console.log('📦 Dexie database initialized: Oxford3000DB');

/**
 * Seed words into IndexedDB if table is empty
 * @param {Array} lexiconDataset
 */
export async function seedWordsIfEmpty(lexiconDataset) {
  try {
    const count = await db.words.count();
    if (count === 0 && Array.isArray(lexiconDataset) && lexiconDataset.length > 0) {
      console.log(`🌱 Seeding ${lexiconDataset.length} words into IndexedDB...`);
      const normalizedWords = lexiconDataset.map((item, index) => ({
        id: item.id || index + 1,
        word: item.word || '',
        ipa: item.ipa || item.phonetic || '',
        pos: item.pos || 'word',
        cefr: item.cefr || item.level || 'B1',
        audio_us: item.audio_us || item.audio || '',
        audio_uk: item.audio_uk || '',
        definitions: Array.isArray(item.definitions) ? item.definitions : [item.meaning || item.definition || ''],
        examples: Array.isArray(item.examples) ? item.examples : [item.example || ''],
        collocations: Array.isArray(item.collocations) ? item.collocations : [],
        arabic: item.arabic || item.translation || '',
        topic: item.topic || 'General',
      }));

      await db.words.bulkPut(normalizedWords);
      console.log('✅ IndexedDB word seeding completed successfully.');
    }
  } catch (error) {
    console.error('❌ Failed to seed IndexedDB words table:', error);
  }
}

/**
 * Add or update a single word in the words table
 * @param {Object} wordObj
 */
export async function addWord(wordObj) {
  try {
    const id = await db.words.put(wordObj);
    console.log(`📝 Word saved to IndexedDB: ${wordObj.word} (ID: ${id})`);
    return id;
  } catch (error) {
    console.error(`❌ Error in addWord for "${wordObj?.word}":`, error);
    throw error;
  }
}

/**
 * Retrieve all words from the words table
 * @returns {Promise<Array>}
 */
export async function getAllWords() {
  try {
    return await db.words.toArray();
  } catch (error) {
    console.error('❌ Error fetching all words from IndexedDB:', error);
    return [];
  }
}

/**
 * Retrieve a specific word by its numerical or string ID
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
export async function getWordById(id) {
  try {
    return await db.words.get(Number(id));
  } catch (error) {
    console.error(`❌ Error in getWordById for ID ${id}:`, error);
    return null;
  }
}

/**
 * Retrieve a word by exact text match (case-insensitive)
 * @param {string} word
 * @returns {Promise<Object|null>}
 */
export async function getWordByText(word) {
  try {
    if (!word) return null;
    return await db.words.where('word').equalsIgnoreCase(word.trim()).first();
  } catch (error) {
    console.error(`❌ Error in getWordByText for "${word}":`, error);
    return null;
  }
}

/**
 * Update user progress for a specific word
 * @param {number|string} wordId
 * @param {Object} progressData
 */
export async function updateProgress(wordId, progressData) {
  try {
    const normalizedWordId = Number(wordId);
    const existing = (await db.progress.get(normalizedWordId)) || {};

    const updatedRecord = {
      wordId: normalizedWordId,
      lastReview: progressData.lastReview || Date.now(),
      nextReview: progressData.nextReview || Date.now() + 86400000,
      easeFactor: progressData.easeFactor ?? existing.easeFactor ?? 2.5,
      interval: progressData.interval ?? existing.interval ?? 1,
      repetitions: (existing.repetitions || 0) + 1,
      stability: progressData.stability ?? existing.stability ?? 1.0,
      difficulty: progressData.difficulty ?? existing.difficulty ?? 5.0,
      state: progressData.state ?? existing.state ?? 1, // 0: New, 1: Learning, 2: Review, 3: Relearning
      retrievability: progressData.retrievability ?? 1.0,
      isFavorite: progressData.isFavorite !== undefined ? progressData.isFavorite : existing.isFavorite || false,
      isMastered: progressData.isMastered !== undefined ? progressData.isMastered : existing.isMastered || false,
    };

    await db.progress.put(updatedRecord);
    return updatedRecord;
  } catch (error) {
    console.error(`❌ Error in updateProgress for wordId ${wordId}:`, error);
    throw error;
  }
}

/**
 * Get all progress records
 * @returns {Promise<Array>}
 */
export async function getAllProgress() {
  try {
    return await db.progress.toArray();
  } catch (error) {
    console.error('❌ Error fetching all progress records:', error);
    return [];
  }
}

/**
 * Get progress for a single word
 * @param {number|string} wordId
 * @returns {Promise<Object|null>}
 */
export async function getProgressByWordId(wordId) {
  try {
    return await db.progress.get(Number(wordId));
  } catch (error) {
    console.error(`❌ Error in getProgressByWordId for ${wordId}:`, error);
    return null;
  }
}

/**
 * Retrieve due words for FSRS spaced repetition review
 * (Words where nextReview <= current timestamp or unreviewed)
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getDueWords(limit = 50) {
  try {
    const now = Date.now();
    // 1. Get due progress entries
    const dueProgress = await db.progress
      .where('nextReview')
      .belowOrEqual(now)
      .sortBy('nextReview');

    const dueWordIds = new Set(dueProgress.map((p) => p.wordId));

    // 2. Fetch corresponding word objects
    const dueWords = [];
    for (const p of dueProgress.slice(0, limit)) {
      const wordObj = await db.words.get(p.wordId);
      if (wordObj) {
        dueWords.push({ ...wordObj, fsrsProgress: p });
      }
    }

    // 3. If due queue is small, pull fresh/new words
    if (dueWords.length < limit) {
      const allWords = await db.words.limit(limit * 2).toArray();
      for (const w of allWords) {
        if (dueWords.length >= limit) break;
        if (!dueWordIds.has(w.id)) {
          const prog = await db.progress.get(w.id);
          if (!prog) {
            dueWords.push({
              ...w,
              fsrsProgress: {
                wordId: w.id,
                state: 0,
                stability: 0,
                difficulty: 5.0,
                nextReview: now,
                repetitions: 0,
              },
            });
          }
        }
      }
    }

    console.log(`🎯 FSRS getDueWords: found ${dueWords.length} cards scheduled for review.`);
    return dueWords;
  } catch (error) {
    console.error('❌ Error querying due words from IndexedDB:', error);
    return [];
  }
}

/**
 * Migrate legacy progress data from localStorage to IndexedDB
 */
export async function migrateFromLocalStorage() {
  try {
    const migratedFlag = localStorage.getItem('oxford_migrated_to_idb_v1');
    if (migratedFlag) return;

    console.log('🔄 Checking for legacy localStorage data migration...');
    const legacyFavorites = JSON.parse(localStorage.getItem('oxford_favorites') || '[]');
    const legacyMastered = JSON.parse(localStorage.getItem('oxford_mastered') || '[]');
    const legacySRS = JSON.parse(localStorage.getItem('oxford_srs_state') || '{}');

    let migratedCount = 0;

    // Migrate favorites
    for (const wordText of legacyFavorites) {
      const wordObj = await getWordByText(wordText);
      if (wordObj) {
        await updateProgress(wordObj.id, { isFavorite: true });
        migratedCount++;
      }
    }

    // Migrate mastered
    for (const wordText of legacyMastered) {
      const wordObj = await getWordByText(wordText);
      if (wordObj) {
        await updateProgress(wordObj.id, { isMastered: true });
        migratedCount++;
      }
    }

    // Migrate SRS records
    for (const [wordText, srsData] of Object.entries(legacySRS)) {
      const wordObj = await getWordByText(wordText);
      if (wordObj) {
        await updateProgress(wordObj.id, {
          nextReview: srsData.nextReview || Date.now(),
          interval: srsData.interval || 1,
          repetitions: srsData.reviewsCount || 1,
          easeFactor: srsData.easeFactor || 2.5,
        });
        migratedCount++;
      }
    }

    localStorage.setItem('oxford_migrated_to_idb_v1', 'true');
    console.log(`✅ Legacy migration complete: ${migratedCount} records migrated to IndexedDB.`);
  } catch (error) {
    console.warn('⚠️ Non-critical warning during legacy localStorage migration:', error);
  }
}
