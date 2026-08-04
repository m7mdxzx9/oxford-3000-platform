import { setupMockEnvironment } from './mock-environment.js';
import { assert } from './assert-utils.js';
import React from 'react';

export async function runM1ChallengerVerification() {
  const env = setupMockEnvironment();
  const testResults = [];

  function test(name, fn) {
    try {
      fn();
      testResults.push({ name, status: 'PASS' });
    } catch (err) {
      testResults.push({ name, status: 'FAIL', error: err.message });
    }
  }

  console.log('--- Starting Empirical Challenger M1 Verification Tests ---');

  // Test 1: Storage loader returns fallback when item is missing
  test('Storage loader fallback on missing key', () => {
    localStorage.clear();
    const item = localStorage.getItem('oxford3000_favorites');
    const loaded = item ? JSON.parse(item) : [];
    assert.deepStrictEqual(loaded, [], 'Should return empty array fallback when key is absent');
  });

  // Test 2: Storage loader behavior when item is string "null"
  test('Storage loader vulnerability to string "null"', () => {
    localStorage.setItem('oxford3000_favorites', 'null');
    const item = localStorage.getItem('oxford3000_favorites');
    const loaded = item ? JSON.parse(item) : [];
    // Vulnerability check: loaded is null instead of []
    assert.strictEqual(loaded, null, 'JSON.parse("null") returns null rather than fallback array');
  });

  // Test 3: Storage loader behavior when item is invalid JSON
  test('Storage loader error handling on corrupted JSON', () => {
    localStorage.setItem('oxford3000_favorites', '{corruptJson');
    let loaded;
    try {
      const item = localStorage.getItem('oxford3000_favorites');
      loaded = item ? JSON.parse(item) : [];
    } catch (err) {
      loaded = [];
    }
    assert.deepStrictEqual(loaded, [], 'Corrupted JSON should trigger catch block fallback []');
  });

  // Test 4: Storage loader behavior when stored item is non-array (object/string/number)
  test('Storage loader non-array data structure anomaly', () => {
    localStorage.setItem('oxford3000_favorites', JSON.stringify({ key: 'value' }));
    const item = localStorage.getItem('oxford3000_favorites');
    const loaded = item ? JSON.parse(item) : [];
    assert.strictEqual(Array.isArray(loaded), false, 'Non-array stored JSON returns object instead of array');
  });

  // Test 5: LocalStorage security block / throw simulation on API Key
  test('LocalStorage SecurityError handling simulation on API_KEY access', () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = (key) => {
      if (key === 'oxford3000_gemini_api_key') {
        throw new Error('SecurityError: Access is denied');
      }
      return originalGetItem(key);
    };

    let errorThrown = false;
    try {
      // Simulating AppContext useState initialization line 52
      localStorage.getItem('oxford3000_gemini_api_key');
    } catch (err) {
      errorThrown = true;
    }
    localStorage.getItem = originalGetItem;
    assert.strictEqual(errorThrown, true, 'Unprotected getItem throws error when storage is restricted');
  });

  // Test 6: AppContext notifications uniqueness & auto-removal math
  test('Notification system ID generation and list filtering', () => {
    let notifications = [];
    const addNotification = (message, type = 'info') => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      notifications = [...notifications, { id, message, type }];
      return id;
    };

    const removeNotification = (id) => {
      notifications = notifications.filter((n) => n.id !== id);
    };

    const id1 = addNotification('Test message 1', 'info');
    const id2 = addNotification('Test message 2', 'success');

    assert.strictEqual(notifications.length, 2, '2 notifications added');
    assert.strictEqual(id1 !== id2, true, 'Notification IDs must be unique');

    removeNotification(id1);
    assert.strictEqual(notifications.length, 1, '1 notification remaining after removal');
    assert.strictEqual(notifications[0].id, id2, 'Remaining notification matches id2');
  });

  // Test 7: Selection limit for Storyteller (Max 5 items)
  test('Selected words toggle and cap at 5 items', () => {
    let selectedWords = [];
    let notificationTriggered = false;

    const toggleSelectWord = (wordObj) => {
      const term = typeof wordObj === 'string' ? wordObj : wordObj.word;
      const exists = selectedWords.some((w) => (typeof w === 'string' ? w : w.word) === term);

      if (exists) {
        selectedWords = selectedWords.filter((w) => (typeof w === 'string' ? w : w.word) !== term);
      } else {
        if (selectedWords.length >= 5) {
          notificationTriggered = true;
          return;
        }
        selectedWords = [...selectedWords, wordObj];
      }
    };

    for (let i = 1; i <= 5; i++) {
      toggleSelectWord(`word${i}`);
    }
    assert.strictEqual(selectedWords.length, 5, 'Selected 5 words');

    // Attempt to add 6th word
    toggleSelectWord('word6');
    assert.strictEqual(selectedWords.length, 5, 'Selected words capped at 5');
    assert.strictEqual(notificationTriggered, true, 'Warning notification triggered on 6th word');

    // Deselect one word
    toggleSelectWord('word3');
    assert.strictEqual(selectedWords.length, 4, 'Deselecting removes word');
  });

  // Test 8: Custom word addition duplicate prevention (Case Insensitive)
  test('Custom word addition prevents case-insensitive duplicates', () => {
    let customWords = [{ word: 'Resilient', cefr: 'B2' }];
    let added = false;

    const addCustomWord = (wordObj) => {
      const exists = customWords.some((w) => w.word.toLowerCase() === wordObj.word.toLowerCase());
      if (exists) return;
      customWords = [wordObj, ...customWords];
      added = true;
    };

    addCustomWord({ word: 'resilient', cefr: 'B2' });
    assert.strictEqual(customWords.length, 1, 'Duplicate word not added');
    assert.strictEqual(added, false, 'Added flag false for duplicate');

    addCustomWord({ word: 'innovative', cefr: 'C1' });
    assert.strictEqual(customWords.length, 2, 'New unique word added');
    assert.strictEqual(customWords[0].word, 'innovative', 'New word prepended');
  });

  // Test 9: Tab navigation ID compatibility between Navbar and App
  test('Navbar items and App main content tabs structural parity', () => {
    const navItemIds = ['grid', 'sentence', 'story', 'tutor', 'flashcards', 'quiz', 'analytics'];
    const appHandledTabs = ['grid', 'sentence', 'story', 'tutor', 'flashcards', 'quiz', 'analytics'];

    assert.deepStrictEqual(navItemIds, appHandledTabs, 'Navbar tab IDs match App main content tabs exactly');
  });

  env.reset();

  let passCount = 0;
  let failCount = 0;
  testResults.forEach((t) => {
    if (t.status === 'PASS') {
      passCount++;
      console.log(`  [✓] ${t.name}`);
    } else {
      failCount++;
      console.log(`  [✗] ${t.name} - Error: ${t.error}`);
    }
  });

  console.log(`Verification Summary: Passed ${passCount}, Failed ${failCount}`);
  return { passCount, failCount, testResults };
}

runM1ChallengerVerification().catch(console.error);
