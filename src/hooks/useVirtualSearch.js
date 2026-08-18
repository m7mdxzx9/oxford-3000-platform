/**
 * ============================================================================
 * File: src/hooks/useVirtualSearch.js
 * Purpose: Reactive Hook bridging Fuse.js Search Worker with React State
 * Connected To: searchWorker.js, LexiconGrid.jsx, VirtualLexiconGrid.jsx
 * Description:
 *   Manages background Web Worker communication, debouncing user search inputs,
 *   and providing instant 60 FPS fuzzy search results across 3000 words.
 * ============================================================================
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';

export function useVirtualSearch(dataset, searchParams) {
  const [results, setResults] = useState(dataset);
  const [isSearching, setIsSearching] = useState(false);
  const workerRef = useRef(null);

  const {
    searchQuery = '',
    selectedLetter = 'ALL',
    selectedLevel = 'ALL',
    selectedPos = 'ALL',
    filterMode = 'all',
    favorites = [],
    mastered = [],
    dueWordIds = [],
  } = searchParams;

  // Initialize Web Worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../workers/searchWorker.js', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'SEARCH_RESULTS') {
          setResults(payload.results);
          setIsSearching(false);
        }
      };

      // Feed initial dataset to worker
      if (Array.isArray(dataset) && dataset.length > 0) {
        workerRef.current.postMessage({
          type: 'INIT_DATA',
          payload: dataset,
        });
      }
    } catch (err) {
      console.warn('⚠️ Web Worker initialization fallback to main thread:', err);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [dataset]);

  // Dispatch search requests with 80ms debounce
  useEffect(() => {
    setIsSearching(true);

    const debounceTimer = setTimeout(() => {
      if (workerRef.current) {
        workerRef.current.postMessage({
          type: 'SEARCH',
          payload: {
            query: searchQuery,
            selectedLetter,
            selectedLevel,
            selectedPos,
            filterMode,
            favorites,
            mastered,
            dueWordIds,
          },
        });
      } else {
        // Fallback synchronous search if Worker is not available
        let filtered = dataset;
        if (searchQuery.trim()) {
          const fuse = new Fuse(dataset, {
            keys: ['word', 'arabic', 'definitions', 'examples'],
            threshold: 0.35,
          });
          filtered = fuse.search(searchQuery.trim()).map((r) => r.item);
        }

        const favSet = new Set(favorites);
        const masSet = new Set(mastered);
        const dueSet = new Set(dueWordIds);

        const finalResults = filtered.filter((item) => {
          if (selectedLevel !== 'ALL' && item.cefr !== selectedLevel) return false;
          if (selectedLetter !== 'ALL' && !item.word?.toUpperCase().startsWith(selectedLetter)) return false;
          if (filterMode === 'favorites' && !favSet.has(item.word)) return false;
          if (filterMode === 'mastered' && !masSet.has(item.word)) return false;
          if (filterMode === 'due' && !dueSet.has(item.id)) return false;
          return true;
        });

        setResults(finalResults);
        setIsSearching(false);
      }
    }, 80);

    return () => clearTimeout(debounceTimer);
  }, [
    searchQuery,
    selectedLetter,
    selectedLevel,
    selectedPos,
    filterMode,
    favorites,
    mastered,
    dueWordIds,
    dataset,
  ]);

  return {
    results,
    isSearching,
    totalCount: results.length,
  };
}
