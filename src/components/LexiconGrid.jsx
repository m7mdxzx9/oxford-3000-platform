/**
 * ============================================================================
 * File: src/components/LexiconGrid.jsx
 * Purpose: 60 FPS Lexicon Hub with TanStack Virtual Scrolling & Web Worker Search
 * Connected To: VirtualLexiconGrid.jsx, useVirtualSearch.js, LexiconFilterBar.jsx, WordModal.jsx
 * Description:
 *   Main vocabulary catalog for 3000 Oxford words. Integrates:
 *     1. TanStack Virtual scrolling for 60 FPS rendering.
 *     2. Web Worker fuzzy search via Fuse.js for zero UI thread blocking.
 *     3. AI Missing word generator fallback.
 * ============================================================================
 */

import React, { useState, useMemo, useCallback } from 'react';
import { BookOpen, Download, Zap, Grid, List } from 'lucide-react';
import { oxford3000Data } from '../data/oxford3000Data';
import { useApp } from '../context/AppContext';
import { fetchMissingTerm } from '../services/geminiService';
import LexiconFilterBar from './lexicon/LexiconFilterBar';
import VirtualLexiconGrid from './lexicon/VirtualLexiconGrid';
import WordOfTheDayWidget from './WordOfTheDayWidget';
import WordModal from './WordModal';
import ExportModal from './ExportModal';
import EmptyState from './EmptyState';
import { useVirtualSearch } from '../hooks/useVirtualSearch';

export const LexiconGrid = () => {
  const {
    customWords,
    addCustomWord,
    selectedWords,
    setActiveTab,
    isFavorite,
    isMastered,
    apiKey,
    addNotification,
  } = useApp();

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedPos, setSelectedPos] = useState('ALL');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'favorites' | 'mastered' | 'due'

  // Modals
  const [activeModalWord, setActiveModalWord] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFetchingMissing, setIsFetchingMissing] = useState(false);

  // Combine Oxford 3000 with user-added custom terms
  const allWords = useMemo(() => {
    return [...(customWords || []), ...oxford3000Data];
  }, [customWords]);

  // Execute Web Worker Fuzzy Search & Multi-criteria Filtering
  const { results: filteredWords, isSearching, totalCount } = useVirtualSearch(allWords, {
    searchQuery,
    selectedLetter,
    selectedLevel,
    selectedPos,
    filterMode,
    favorites: allWords.filter((w) => isFavorite(w.word)).map((w) => w.word),
    mastered: allWords.filter((w) => isMastered(w.word)).map((w) => w.word),
  });

  // Handle Fetch Missing Word with AI
  const handleFetchMissingTerm = async () => {
    const term = searchQuery.trim();
    if (!term) return;

    try {
      setIsFetchingMissing(true);
      const fetched = await fetchMissingTerm(term, apiKey);
      if (fetched) {
        addCustomWord(fetched);
        addNotification({
          type: 'success',
          message: `تم جلب المفردة "${fetched.word}" (${fetched.arabic}) بالذكاء الاصطناعي وإضافتها للمنصة! ✨`,
        });
        setSearchQuery(fetched.word);
      }
    } catch (err) {
      addNotification({
        type: 'error',
        message: 'تعذر جلب الكلمة بالذكاء الاصطناعي.',
      });
    } finally {
      setIsFetchingMissing(false);
    }
  };

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedLetter('ALL');
    setSelectedLevel('ALL');
    setSelectedPos('ALL');
    setFilterMode('all');
  }, []);

  const handleCardClick = useCallback((wordObj) => {
    setActiveModalWord(wordObj);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Word of the Day & Quick Export */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[280px]">
          <WordOfTheDayWidget onSelectWord={handleCardClick} />
        </div>
      </div>

      {/* Floating Story Selection Banner */}
      {selectedWords.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl border border-cyan-500/40 flex items-center justify-between gap-4 shadow-lg card-theme-target">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl theme-btn-primary flex items-center justify-center font-bold text-sm">
              {selectedWords.length}
            </div>
            <div>
              <p className="text-xs font-black font-arabic text-cyan-400">
                الكلمات المختارة لمولد القصص ({selectedWords.length}/5):
              </p>
              <p className="text-xs font-mono opacity-80 ltr-token">
                {selectedWords.map((w) => (typeof w === 'string' ? w : w.word)).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold font-arabic theme-btn-secondary flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير</span>
            </button>

            <button
              onClick={() => setActiveTab('story')}
              className="px-4 py-2 rounded-xl text-xs font-black font-arabic theme-btn-primary shadow-md hover:brightness-110 cursor-pointer"
            >
              توليد القصة الآن ➔
            </button>
          </div>
        </div>
      )}

      {/* Main Filter & Search Bar */}
      <LexiconFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLetter={selectedLetter}
        setSelectedLetter={setSelectedLetter}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        selectedPos={selectedPos}
        setSelectedPos={setSelectedPos}
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        onFetchMissingTerm={handleFetchMissingTerm}
        isFetchingMissing={isFetchingMissing}
        totalMatching={totalCount}
      />

      {/* 60 FPS Virtualized 3000-Word Grid */}
      {filteredWords.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold font-arabic opacity-75 px-1">
            <span>
              عرض {totalCount} كلمة (محرك افتراضي 60 FPS • فقط ~12 بطاقة بالذاكرة)
            </span>
            {isSearching && (
              <span className="text-blue-400 animate-pulse font-mono">⚡ جاري البحث السريع...</span>
            )}
          </div>

          <VirtualLexiconGrid
            words={filteredWords}
            onSelectWord={handleCardClick}
          />
        </div>
      ) : (
        <EmptyState
          type="search"
          searchQuery={searchQuery.trim()}
          onReset={clearFilters}
          onAiFetch={searchQuery.trim() ? handleFetchMissingTerm : null}
          isFetchingTerm={isFetchingMissing}
        />
      )}

      {/* Modals */}
      {activeModalWord && (
        <WordModal word={activeModalWord} onClose={() => setActiveModalWord(null)} />
      )}

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filteredWords={filteredWords}
      />
    </div>
  );
};

export default LexiconGrid;
