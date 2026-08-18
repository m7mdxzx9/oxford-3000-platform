/**
 * ============================================================================
 * File: src/workers/searchWorker.js
 * Purpose: Web Worker for Fuse.js Fuzzy Search & Filter Offloading
 * Connected To: useVirtualSearch.js, LexiconGrid.jsx
 * Description:
 *   Runs heavy fuzzy searching and multi-attribute filtering in a background
 *   thread to guarantee 60 FPS smooth rendering on the main UI thread.
 * ============================================================================
 */

import Fuse from 'fuse.js';

let fuseInstance = null;
let rawDataset = [];

const FUSE_OPTIONS = {
  keys: [
    { name: 'word', weight: 0.5 },
    { name: 'arabic', weight: 0.3 },
    { name: 'definitions', weight: 0.1 },
    { name: 'examples', weight: 0.1 },
    { name: 'pos', weight: 0.05 },
    { name: 'cefr', weight: 0.05 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 1,
  shouldSort: true,
};

self.onmessage = (event) => {
  const { type, payload } = event.data;

  if (type === 'INIT_DATA') {
    rawDataset = payload || [];
    fuseInstance = new Fuse(rawDataset, FUSE_OPTIONS);
    console.log(`⚡ Search Web Worker initialized with ${rawDataset.length} items.`);
    self.postMessage({ type: 'INIT_COMPLETE' });
  } else if (type === 'SEARCH') {
    const {
      query = '',
      selectedLetter = 'ALL',
      selectedLevel = 'ALL',
      selectedPos = 'ALL',
      filterMode = 'all',
      favorites = [],
      mastered = [],
      dueWordIds = [],
    } = payload;

    const favoritesSet = new Set(favorites);
    const masteredSet = new Set(mastered);
    const dueSet = new Set(dueWordIds);

    let candidates = rawDataset;

    // 1. Fuzzy Search if query is present
    if (query && query.trim() && fuseInstance) {
      const results = fuseInstance.search(query.trim());
      candidates = results.map((r) => r.item);
    }

    // 2. Multi-Criteria Filtering
    const filtered = candidates.filter((item) => {
      // Level Filter
      if (selectedLevel !== 'ALL' && item.cefr !== selectedLevel) return false;

      // Letter Filter
      if (selectedLetter !== 'ALL') {
        const firstLetter = (item.word || '').charAt(0).toUpperCase();
        if (firstLetter !== selectedLetter.toUpperCase()) return false;
      }

      // POS Filter
      if (selectedPos !== 'ALL' && item.pos !== selectedPos) return false;

      // Mode Filter
      if (filterMode === 'favorites' && !favoritesSet.has(item.word)) return false;
      if (filterMode === 'mastered' && !masteredSet.has(item.word)) return false;
      if (filterMode === 'due' && !dueSet.has(item.id)) return false;

      return true;
    });

    self.postMessage({
      type: 'SEARCH_RESULTS',
      payload: {
        results: filtered,
        totalCount: filtered.length,
      },
    });
  }
};
