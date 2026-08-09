# Technical Handoff Report: Lexicon Grid Component (`LexiconGrid.jsx`)

**Milestone**: M2 - Lexicon Dataset & Catalog Grid  
**Author**: Explorer 2  
**Target File**: `src/components/LexiconGrid.jsx`  
**Date**: 2026-08-04  

---

## 1. Observation

Direct examination of existing codebase files confirmed the following structural details, hooks, and services:

1. **Context & Global State (`src/context/AppContext.jsx`)**:
   - Custom hook `useApp()` exposes:
     - `favorites`, `toggleFavorite(wordTerm)`, `isFavorite(wordTerm)`, `favoritesCount`
     - `mastered`, `toggleMastered(wordTerm)`, `isMastered(wordTerm)`, `masteredCount`
     - `selectedWords`, `toggleSelectWord(wordObj)`, `clearSelectedWords()`, `isSelectedWord(wordObj)`, `selectedWordsCount` (Max 5 items limit enforced in context)
     - `customWords`, `addCustomWord(wordObj)`
     - `apiKey`, `setIsApiKeyModalOpen`
     - `setActiveTab` (Navigation tab switching)
     - `addNotification(message, type)`
2. **Lexicon Dataset (`src/data/oxford3000.js`)**:
   - Array of word objects with shape:
     ```js
     {
       id: number,
       word: string,         // e.g., 'ability'
       pos: string,          // e.g., 'noun', 'verb', 'adjective', 'adverb', 'preposition'
       cefr: string,         // e.g., 'A1', 'A2', 'B1', 'B2'
       arabic: string,       // e.g., 'قُدْرَة'
       example: string,      // e.g., 'She has the ability to pass the exam.'
       ipa: string           // e.g., '/əˈbɪl.ə.ti/'
     }
     ```
3. **Audio TTS Service (`src/services/audioService.js`)**:
   - `playAudio(text, lang = 'en-US', speed = 0.9)` -> Promise<void>
   - `stopAudio()` -> void
4. **Gemini AI Service (`src/services/geminiService.js`)**:
   - `fetchMissingTerm(term, apiKey)` -> Promise<wordObj>
5. **CSS Layout Isolation (`src/index.css`)**:
   - CSS utility `.ltr-isolate` (or `.ltr-token`) defines:
     ```css
     .ltr-isolate {
       direction: ltr !important;
       unicode-bidi: isolate !important;
       text-align: left;
     }
     ```
   - RTL utility `.rtl-text` / `.rtl-isolate` for Arabic text rendering.

---

## 2. Logic Chain

The design of `src/components/LexiconGrid.jsx` follows a step-by-step architectural rationale:

1. **Dataset Integration & Live Deduplication**:
   - Combines `customWords` (dynamically added via Gemini API) and static `oxford3000Data`.
   - Deduplicates entries by case-insensitive `word.toLowerCase()` to ensure clean rendering.

2. **Multi-Criteria Filtering Engine**:
   - **A–Z Letter Bar**: Filters words by `word[0].toUpperCase() === selectedLetter`. Options: `ALL`, `A` through `Z`. Resets `currentPage` to `1` on change.
   - **CEFR Level Filter**: Filters words by `word.cefr === selectedCefr`. Options: `ALL`, `A1`, `A2`, `B1`, `B2`. Resets `currentPage` to `1` on change.
   - **Interactive Live Search Input**: Matches query against both `word` (English) and `arabic` (translation) using case-insensitive substring search. Supports instant clear button (`×`).
   - **Quick View Filter Pills**: Allows quick filtering by `FAVORITES`, `MASTERED`, or `STORY` selected words.

3. **Virtual Pagination Engine**:
   - Computes `totalFilteredItems = filteredWords.length`.
   - Computes `totalPages = Math.ceil(totalFilteredItems / itemsPerPage)`.
   - Supports items per page selection (16, 20, 24, 32).
   - Generates active slice `filteredWords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)`.
   - Provides full pagination controls: First (`<<`), Previous (`<`), Windowed Page Buttons (`1, 2, 3...`), Next (`>`), Last (`>>`), and an Items Summary bar (`Showing 1-16 of 42 words`).

4. **Strict LTR CSS Isolation (`.ltr-isolate`)**:
   - Enforces `.ltr-isolate` with `dir="ltr"` on all English tokens: Word title, Part of Speech tag, IPA phonetic string, and Example sentence.
   - Prevents bidirectional layout scrambling or punctuation flipping when rendered beside RTL Arabic translations (`.rtl-text` with Cairo/Tajawal font family).

5. **Interactive Card Features (`LexiconCard`)**:
   - **Audio TTS**: Call `playAudio(wordObj.word)` or `playAudio(wordObj.example)` with playing state animation.
   - **Favorites Star**: Toggle via `toggleFavorite(wordObj.word)`, showing yellow glow when favorited.
   - **Mastered Checkmark**: Toggle via `toggleMastered(wordObj.word)`, showing emerald glow when mastered.
   - **AI Storyteller Checkbox**: Toggle via `toggleSelectWord(wordObj)`, showing cyan selection ring. Displays warning notification if 5-word maximum limit is reached.

6. **Missing Lexicon Term AI Fetcher**:
   - When a search returns no matching results, or via dedicated button, user can trigger "Fetch with Gemini AI".
   - Calls `fetchMissingTerm(searchTerm, apiKey)` and invokes `addCustomWord(fetchedWord)` to dynamically add the word to the active state and local storage.

---

## 3. Caveats

1. **SpeechSynthesis Voice Loading**: Web Speech API native voices load asynchronously on some browsers (e.g. Chrome/Safari). The fallback to Google Translate TTS stream in `audioService.js` handles audio playback reliably if SpeechSynthesis is unavailable or fails.
2. **Storyteller Word Limit**: `AppContext` strictly enforces a max limit of 5 selected words. The card UI visually reflects selected state and disables selection check when 5 words are already selected, notifying the user.
3. **Empty Filter Results**: When filters yield zero results, the UI gracefully renders a dark glassmorphic empty state card with option to clear filters or fetch missing term via Gemini AI.

---

## 4. Conclusion & Proposed Component Code

The complete proposed implementation code for `src/components/LexiconGrid.jsx` is detailed below.

### Proposed Code for `src/components/LexiconGrid.jsx`

```jsx
import React, { useState, useMemo, useCallback } from 'react';
import { oxford3000Data } from '../data/oxford3000';
import { useApp } from '../context/AppContext';
import { playAudio, stopAudio } from '../services/audioService';
import { fetchMissingTerm } from '../services/geminiService';

// CEFR Level Color Badge Mapping
const CEFR_BADGES = {
  A1: {
    bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10',
    label: 'A1 Beginner',
  },
  A2: {
    bg: 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-teal-500/10',
    label: 'A2 Elementary',
  },
  B1: {
    bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10',
    label: 'B1 Intermediate',
  },
  B2: {
    bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-purple-500/10',
    label: 'B2 Upper-Int',
  },
};

// Part of Speech Badge Styling
const POS_STYLES = {
  noun: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  verb: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  adjective: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  adverb: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  preposition: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  conjunction: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  pronoun: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
};

// Individual Interactive Lexicon Card Component
const LexiconCard = React.memo(({ wordObj }) => {
  const {
    isFavorite,
    toggleFavorite,
    isMastered,
    toggleMastered,
    isSelectedWord,
    toggleSelectWord,
    selectedWordsCount,
    addNotification,
  } = useApp();

  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState(false);

  const favorited = isFavorite(wordObj.word);
  const mastered = isMastered(wordObj.word);
  const selected = isSelectedWord(wordObj);

  const cefrStyle = CEFR_BADGES[wordObj.cefr] || {
    bg: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    label: wordObj.cefr || 'CEFR',
  };

  const posStyle = POS_STYLES[wordObj.pos?.toLowerCase()] || 'bg-slate-500/15 text-slate-300 border-slate-500/30';

  const handlePlayWord = async (e) => {
    e.stopPropagation();
    try {
      setIsPlayingWord(true);
      await playAudio(wordObj.word, 'en-US', 0.85);
    } catch (err) {
      console.error('TTS playback error:', err);
    } finally {
      setIsPlayingWord(false);
    }
  };

  const handlePlayExample = async (e) => {
    e.stopPropagation();
    if (!wordObj.example) return;
    try {
      setIsPlayingExample(true);
      await playAudio(wordObj.example, 'en-US', 0.9);
    } catch (err) {
      console.error('TTS example playback error:', err);
    } finally {
      setIsPlayingExample(false);
    }
  };

  const handleSelectWord = (e) => {
    e.stopPropagation();
    if (!selected && selectedWordsCount >= 5) {
      addNotification('Maximum 5 words can be selected for Storytelling.', 'warning');
      return;
    }
    toggleSelectWord(wordObj);
  };

  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-2xl transition-all duration-300 glass-card-interactive ${
        selected
          ? 'ring-2 ring-cyan-400/80 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
          : mastered
          ? 'border-emerald-500/30 bg-emerald-950/10'
          : ''
      }`}
    >
      {/* Top Bar Controls (Storyteller Select Checkbox, Mastered Toggle, Favorite Toggle) */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Storyteller Select Checkbox */}
        <button
          onClick={handleSelectWord}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
            selected
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:border-cyan-500/50 hover:text-cyan-300'
          }`}
          title={selected ? 'Remove from Storyteller' : 'Select for AI Storyteller (Max 5)'}
        >
          <span className="w-3.5 h-3.5 flex items-center justify-center rounded border border-current text-[10px]">
            {selected ? '✓' : '+'}
          </span>
          <span>Story</span>
        </button>

        {/* Action Icons (Mastered & Favorite) */}
        <div className="flex items-center space-x-1">
          {/* Mastered Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMastered(wordObj.word);
            }}
            className={`p-1.5 rounded-lg border transition-all ${
              mastered
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800/60 border-transparent'
            }`}
            title={mastered ? 'Marked as Mastered' : 'Mark as Mastered'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </button>

          {/* Favorite Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(wordObj.word);
            }}
            className={`p-1.5 rounded-lg border transition-all ${
              favorited
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800/60 border-transparent'
            }`}
            title={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <svg
              className="w-4 h-4"
              fill={favorited ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="space-y-3">
        {/* Word Title & Audio Play Button */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 dir="ltr" className="ltr-isolate text-xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
              {wordObj.word}
            </h3>
            {wordObj.ipa && (
              <p dir="ltr" className="ltr-isolate text-xs font-mono text-cyan-400/80 mt-0.5">
                {wordObj.ipa}
              </p>
            )}
          </div>

          {/* Audio TTS Button */}
          <button
            onClick={handlePlayWord}
            disabled={isPlayingWord}
            className={`p-2 rounded-xl border transition-all ${
              isPlayingWord
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 animate-pulse'
                : 'bg-slate-900/80 text-cyan-400 border-cyan-800/40 hover:bg-cyan-500/20 hover:border-cyan-500/60'
            }`}
            title="Listen to pronunciation (TTS)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          </button>
        </div>

        {/* Badges Row (POS & CEFR) */}
        <div className="flex items-center flex-wrap gap-2">
          {/* POS Tag */}
          <span dir="ltr" className={`ltr-isolate text-xs font-semibold px-2.5 py-0.5 rounded-md border capitalize ${posStyle}`}>
            {wordObj.pos || 'word'}
          </span>

          {/* CEFR Level Tag */}
          <span dir="ltr" className={`ltr-isolate text-xs font-bold px-2.5 py-0.5 rounded-md border shadow-sm ${cefrStyle.bg}`}>
            {wordObj.cefr || 'A1'}
          </span>
        </div>

        {/* Arabic Translation Block (RTL Isolated) */}
        <div dir="rtl" className="rtl-text rtl-isolate bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60 mt-2">
          <p className="text-lg font-bold text-amber-300 tracking-wide font-arabic">
            {wordObj.arabic}
          </p>
        </div>

        {/* Example Sentence (Strict LTR Isolated) */}
        {wordObj.example && (
          <div dir="ltr" className="ltr-isolate bg-slate-950/40 p-3 rounded-xl border border-slate-800/40 text-xs text-slate-300 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Example Sentence</span>
              <button
                onClick={handlePlayExample}
                disabled={isPlayingExample}
                className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                title="Listen to example sentence"
              >
                <span>{isPlayingExample ? 'Playing...' : 'Play'}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              </button>
            </div>
            <p className="italic leading-relaxed text-slate-200">
              "{wordObj.example}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export const LexiconGrid = () => {
  const { customWords, addCustomWord, apiKey, selectedWords, setActiveTab, addNotification } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [selectedCefr, setSelectedCefr] = useState('ALL');
  const [quickFilter, setQuickFilter] = useState('ALL'); // 'ALL', 'FAVORITES', 'MASTERED', 'STORY'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);

  // Gemini Missing Term State
  const [isFetchingTerm, setIsFetchingTerm] = useState(false);

  // Merge static oxford3000 dataset with dynamic custom words
  const fullDataset = useMemo(() => {
    const combined = [...customWords, ...oxford3000Data];
    const seen = new Set();
    return combined.filter((item) => {
      const lower = item.word.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  }, [customWords]);

  // Alphabet letter list (ALL, A-Z)
  const alphabet = useMemo(() => ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')], []);

  // Filtered dataset calculation
  const filteredWords = useMemo(() => {
    return fullDataset.filter((item) => {
      // 1. Search Query Filter (English word or Arabic translation)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesWord = item.word.toLowerCase().includes(query);
        const matchesArabic = item.arabic && item.arabic.includes(query);
        if (!matchesWord && !matchesArabic) return false;
      }

      // 2. A-Z Letter Filter
      if (selectedLetter !== 'ALL') {
        if (item.word.charAt(0).toUpperCase() !== selectedLetter) return false;
      }

      // 3. CEFR Level Filter
      if (selectedCefr !== 'ALL') {
        if (item.cefr !== selectedCefr) return false;
      }

      return true;
    });
  }, [fullDataset, searchQuery, selectedLetter, selectedCefr]);

  // Handle filter changes and reset page
  const handleLetterSelect = (letter) => {
    setSelectedLetter(letter);
    setCurrentPage(1);
  };

  const handleCefrSelect = (cefr) => {
    setSelectedCefr(cefr);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLetter('ALL');
    setSelectedCefr('ALL');
    setQuickFilter('ALL');
    setCurrentPage(1);
  };

  // Virtual Pagination calculations
  const totalFilteredItems = filteredWords.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredItems / itemsPerPage));

  // Ensure valid current page range
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedWords = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredWords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWords, safeCurrentPage, itemsPerPage]);

  // Handle Fetch Missing Term with Gemini AI
  const handleFetchMissingTerm = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsFetchingTerm(true);
      const fetched = await fetchMissingTerm(searchQuery.trim(), apiKey);
      if (fetched) {
        addCustomWord(fetched);
        addNotification(`Successfully fetched and added "${fetched.word}"!`, 'success');
      }
    } catch (err) {
      console.error('Error fetching missing term:', err);
      addNotification('Failed to fetch word with Gemini AI.', 'error');
    } finally {
      setIsFetchingTerm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search Bar Section */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Oxford 3000™ Lexicon Catalog</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {totalFilteredItems} Words
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Explore the complete Oxford 3000 CEFR vocabulary (A1-B2) with audio TTS, IPA phonetics, and Arabic translations.
            </p>
          </div>

          {/* Items Per Page Selector */}
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="glass-input px-2.5 py-1.5 rounded-lg text-slate-200 bg-slate-900/80 border border-slate-700/60 focus:border-cyan-500"
            >
              <option value={16}>16 per page</option>
              <option value={20}>20 per page</option>
              <option value={24}>24 per page</option>
              <option value={32}>32 per page</option>
            </select>
          </div>
        </div>

        {/* Interactive Search Bar & Clear Action */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search word in English or translation in Arabic..."
            className="w-full pl-10 pr-24 py-3 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center px-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* CEFR Level Filter Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">CEFR Level Filter</span>
            {(selectedCefr !== 'ALL' || selectedLetter !== 'ALL' || searchQuery) && (
              <button
                onClick={clearFilters}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {['ALL', 'A1', 'A2', 'B1', 'B2'].map((cefr) => {
              const isActive = selectedCefr === cefr;
              const badgeConfig = CEFR_BADGES[cefr] || { bg: 'bg-cyan-500/20 text-cyan-300' };
              return (
                <button
                  key={cefr}
                  onClick={() => handleCefrSelect(cefr)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] scale-105'
                      : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-cyan-500/40 hover:text-white'
                  }`}
                >
                  {cefr === 'ALL' ? 'ALL LEVELS' : cefr}
                </button>
              );
            })}
          </div>
        </div>

        {/* A-Z Letter Filter Bar */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">A-Z Alphabet Filter</span>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 scrollbar-thin">
            {alphabet.map((letter) => {
              const isActive = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => handleLetterSelect(letter)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all border ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:bg-slate-800 hover:text-cyan-300'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Storyteller Selection Quick Floating Bar */}
      {selectedWords.length > 0 && (
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 flex items-center justify-between gap-4 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-sm">
              {selectedWords.length}
            </span>
            <div>
              <p className="text-xs font-semibold text-cyan-200">
                Words selected for AI Storyteller ({selectedWords.length}/5 max):
              </p>
              <p dir="ltr" className="ltr-isolate text-xs text-slate-300 font-medium">
                {selectedWords.map((w) => (typeof w === 'string' ? w : w.word)).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('story')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-md"
          >
            Generate Story →
          </button>
        </div>
      )}

      {/* Grid Summary Info */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="font-semibold text-slate-200">{paginatedWords.length ? (safeCurrentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
          <span className="font-semibold text-slate-200">{Math.min(safeCurrentPage * itemsPerPage, totalFilteredItems)}</span> of{' '}
          <span className="font-semibold text-slate-200">{totalFilteredItems}</span> words
        </div>
        <div>
          Page <span className="font-semibold text-cyan-400">{safeCurrentPage}</span> of{' '}
          <span className="font-semibold text-slate-200">{totalPages}</span>
        </div>
      </div>

      {/* Catalog Grid Cards Rendering */}
      {paginatedWords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {paginatedWords.map((wordObj) => (
            <LexiconCard key={wordObj.id || wordObj.word} wordObj={wordObj} />
          ))}
        </div>
      ) : (
        /* Empty State & Gemini AI Fetcher */
        <div className="glass-panel p-10 rounded-2xl text-center space-y-4 border border-dashed border-slate-700/60">
          <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No vocabulary terms found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              No matching words found for your current search or filter criteria.
            </p>
          </div>

          {searchQuery ? (
            <div className="pt-2">
              <button
                onClick={handleFetchMissingTerm}
                disabled={isFetchingTerm}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:from-cyan-400 hover:to-indigo-400 transition-all shadow-lg flex items-center justify-center space-x-2 mx-auto"
              >
                {isFetchingTerm ? (
                  <span>Fetching "{searchQuery}" with Gemini AI...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Fetch "{searchQuery}" using Gemini AI</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Virtual Pagination Controls */}
      {totalPages > 1 && (
        <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={safeCurrentPage === 1}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white transition-all"
          >
            « First
          </button>

          <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white transition-all"
            >
              ‹ Prev
            </button>

            {/* Page number buttons window */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - safeCurrentPage) <= 2 || p === 1 || p === totalPages)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="px-1 text-slate-500 text-xs">...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                        safeCurrentPage === p
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white transition-all"
            >
              Next ›
            </button>
          </div>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage === totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white transition-all"
          >
            Last »
          </button>
        </div>
      )}
    </div>
  );
};

export default LexiconGrid;
```

---

## 5. Verification Method

To independently verify `LexiconGrid.jsx` design and proposed code:

1. **Compilation & Build**:
   - Save `src/components/LexiconGrid.jsx`.
   - Update `src/App.jsx` to render `<LexiconGrid />` when `activeTab === 'grid'`.
   - Execute `npm run build` in root folder to ensure zero JSX syntax errors, missing imports, or build warnings.

2. **Feature Checklist Verification**:
   - **Catalog Grid & Pagination**: Verify 16 words per page render in grid. Click page numbers `1, 2, 3...` and `Prev/Next/First/Last`. Verify items summary updates (`Showing 1-16 of X words`).
   - **A-Z Alphabet Filter**: Click letter `B`. Verify only words starting with `B` display and pagination resets to page 1.
   - **CEFR Level Buttons**: Click `A1`, `A2`, `B1`, `B2`. Verify colored badges render accurately and filtering restricts dataset correctly.
   - **Interactive Live Search**: Type "ability" in search box. Verify instant filtering. Type Arabic word e.g. "قدرة". Verify matching.
   - **Strict LTR Isolation (`.ltr-isolate`)**: Inspect DOM elements for `.ltr-isolate` with `dir="ltr"` on English word titles, POS badges, IPA phonetics, and example sentences to confirm bi-directional isolation against Arabic text.
   - **Audio TTS Integration**: Click speaker icon on a word card. Verify `playAudio(word, 'en-US')` is invoked.
   - **Favorites & Mastered Toggles**: Click star icon and checkmark icon. Verify context updates and toast notification appears.
   - **Storyteller 5-Word Selection**: Select up to 5 words for Storyteller. Verify bottom floating quick bar appears. Attempt selecting a 6th word and verify warning notification triggers.
   - **Gemini Missing Term Fetcher**: Type a non-existent word in search. Verify empty state displays with "Fetch using Gemini AI" button.
