/**
 * ============================================================================
 * File: src/services/backupService.js
 * Purpose: Full IndexedDB Backup & Restore Engine
 * Connected To: db.js, BackupRestoreModal.jsx, AppContext.jsx
 * Description:
 *   Enables users to export their entire IndexedDB database (`words` and `progress`
 *   tables) along with user statistics as a single JSON file, and restore it
 *   seamlessly with atomic transaction rollback safety and data validation.
 * ============================================================================
 */

import { db, getAllWords, getAllProgress, seedWordsIfEmpty } from './db';

/**
 * Export the complete IndexedDB database and metadata to a downloadable JSON file
 */
export async function exportDatabaseToJson() {
  try {
    console.log('📦 Generating full IndexedDB backup JSON...');
    const words = await getAllWords();
    const progress = await getAllProgress();

    const backupPayload = {
      meta: {
        app: 'Oxford 3000 Vocabulary Trainer',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        totalWords: words.length,
        totalProgressRecords: progress.length,
      },
      userState: {
        streak: localStorage.getItem('oxford_streak_count') || '0',
        xp: localStorage.getItem('oxford_total_xp') || '0',
        theme: localStorage.getItem('oxford_app_theme') || 'brutalism',
        mode: localStorage.getItem('oxford_theme_mode') || 'dark',
      },
      tables: {
        words,
        progress,
      },
    };

    const jsonString = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const filename = `oxford-3000-backup-${new Date().toISOString().split('T')[0]}.json`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`✅ Database backup saved successfully as "${filename}"`);
    return { success: true, filename, wordsCount: words.length, progressCount: progress.length };
  } catch (error) {
    console.error('❌ Failed to export IndexedDB database:', error);
    throw new Error(`Export failed: ${error.message}`);
  }
}

/**
 * Import and restore database from a JSON string or parsed JSON object
 * @param {string|Object} rawData
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function importDatabaseFromJson(rawData) {
  try {
    console.log('🔄 Parsing backup payload for IndexedDB restoration...');
    let payload;
    if (typeof rawData === 'string') {
      payload = JSON.parse(rawData);
    } else {
      payload = rawData;
    }

    if (!payload || !payload.tables) {
      throw new Error('Invalid backup file format: missing "tables" property.');
    }

    const rawWords = Array.isArray(payload.tables.words) ? payload.tables.words : [];
    const rawProgress = Array.isArray(payload.tables.progress) ? payload.tables.progress : [];

    // Sanitize and validate words records
    const sanitizedWords = rawWords
      .filter((w) => w && typeof w === 'object' && typeof w.word === 'string' && w.word.trim())
      .map((w, idx) => ({
        id: typeof w.id === 'number' || typeof w.id === 'string' ? w.id : idx + 1,
        word: String(w.word).slice(0, 100).trim(),
        ipa: typeof w.ipa === 'string' ? w.ipa.slice(0, 100) : (typeof w.phonetic === 'string' ? w.phonetic.slice(0, 100) : ''),
        pos: typeof w.pos === 'string' ? w.pos.slice(0, 50) : 'word',
        cefr: typeof w.cefr === 'string' ? w.cefr.slice(0, 10) : 'B1',
        audio_us: typeof w.audio_us === 'string' ? w.audio_us.slice(0, 500) : '',
        audio_uk: typeof w.audio_uk === 'string' ? w.audio_uk.slice(0, 500) : '',
        definitions: Array.isArray(w.definitions) ? w.definitions.map(d => String(d).slice(0, 500)) : (typeof w.meaning === 'string' ? [w.meaning.slice(0, 500)] : []),
        examples: Array.isArray(w.examples) ? w.examples.map(e => String(e).slice(0, 500)) : (typeof w.example === 'string' ? [w.example.slice(0, 500)] : []),
        arabic: typeof w.arabic === 'string' ? w.arabic.slice(0, 200) : (typeof w.translation === 'string' ? w.translation.slice(0, 200) : ''),
        topic: typeof w.topic === 'string' ? w.topic.slice(0, 50) : 'General',
      }));

    // Sanitize and validate progress records
    const sanitizedProgress = rawProgress
      .filter((p) => p && typeof p === 'object' && (p.wordId !== undefined && p.wordId !== null))
      .map((p) => ({
        wordId: p.wordId,
        nextReview: typeof p.nextReview === 'number' ? p.nextReview : Date.now(),
        state: typeof p.state === 'number' ? p.state : 0,
        repetitions: typeof p.repetitions === 'number' ? Math.max(0, p.repetitions) : 0,
        stability: typeof p.stability === 'number' ? Math.max(0, p.stability) : 0,
        difficulty: typeof p.difficulty === 'number' ? Math.max(0, p.difficulty) : 0,
        lastReview: typeof p.lastReview === 'number' ? p.lastReview : Date.now(),
      }));

    // Execute atomic replacement in Dexie transaction
    await db.transaction('rw', db.words, db.progress, async () => {
      if (sanitizedWords.length > 0) {
        await db.words.clear();
        await db.words.bulkPut(sanitizedWords);
      }
      if (sanitizedProgress.length > 0) {
        await db.progress.clear();
        await db.progress.bulkPut(sanitizedProgress);
      }
    });

    // Restore user settings if present with strict whitelist validation
    if (payload.userState && typeof payload.userState === 'object') {
      if (payload.userState.streak && !isNaN(Number(payload.userState.streak))) {
        localStorage.setItem('oxford_streak_count', String(Math.max(0, parseInt(payload.userState.streak, 10))));
      }
      if (payload.userState.xp && !isNaN(Number(payload.userState.xp))) {
        localStorage.setItem('oxford_total_xp', String(Math.max(0, parseInt(payload.userState.xp, 10))));
      }
      if (typeof payload.userState.theme === 'string') {
        const cleanTheme = payload.userState.theme.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
        if (cleanTheme) localStorage.setItem('oxford_app_theme', cleanTheme);
      }
      if (payload.userState.mode === 'light' || payload.userState.mode === 'dark') {
        localStorage.setItem('oxford_theme_mode', payload.userState.mode);
      }
    }

    console.log(`✅ Database successfully restored: ${words.length} words and ${progress.length} progress records.`);
    return {
      success: true,
      restoredWords: words.length,
      restoredProgress: progress.length,
      message: 'Database imported successfully!',
    };
  } catch (error) {
    console.error('❌ Failed to import IndexedDB backup:', error);
    throw new Error(`Import failed: ${error.message}`);
  }
}
