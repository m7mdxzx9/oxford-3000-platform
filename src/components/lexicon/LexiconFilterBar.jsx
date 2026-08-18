import React from 'react';
import { Search, X, Sparkles, Star, Check, BookOpen, Clock, Palette } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CEFR_LEVELS = ['ALL', 'A1', 'A2', 'B1', 'B2'];
const POS_LIST = ['ALL', 'noun', 'verb', 'adjective', 'adverb', 'preposition'];

export default function LexiconFilterBar({
  searchQuery,
  setSearchQuery,
  selectedLetter,
  setSelectedLetter,
  selectedLevel,
  setSelectedLevel,
  selectedPos,
  setSelectedPos,
  filterMode,
  setFilterMode,
  onFetchMissingTerm,
  isFetchingMissing,
  totalMatching,
}) {
  const { setIsThemeModalOpen } = useApp();

  return (
    <div className="glass-panel p-5 sm:p-7 rounded-3xl border shadow-xl card-theme-target space-y-5">
      {/* Search Input Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute start-4 top-3.5 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن أي كلمة أو معنى بالعربية أو الإنجليزية..."
            className="w-full ps-11 pe-10 py-3 rounded-2xl glass-input text-xs sm:text-sm font-bold font-arabic border focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute end-3 top-3 p-1 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {searchQuery && totalMatching === 0 && (
          <button
            onClick={onFetchMissingTerm}
            disabled={isFetchingMissing}
            className="px-4 py-3 rounded-2xl theme-btn-primary text-xs font-black font-arabic flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isFetchingMissing ? 'animate-spin' : ''}`} />
            <span>جلب الكلمة بالذكاء الاصطناعي ✨</span>
          </button>
        )}
      </div>

      {/* CEFR Levels & Quick Mode Toggles */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* CEFR Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-black opacity-70 font-arabic me-1">المستوى:</span>
          {CEFR_LEVELS.map((lvl) => {
            const isSelected = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black border transition-all cursor-pointer ${
                  isSelected
                    ? 'theme-btn-primary shadow-md border-transparent scale-105'
                    : 'theme-btn-secondary border-black/10 dark:border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        {/* Filter Modes (Favorites / Mastered) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterMode(filterMode === 'favorites' ? 'all' : 'favorites')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-arabic border flex items-center gap-1.5 transition-all cursor-pointer ${
              filterMode === 'favorites'
                ? 'bg-amber-400/20 text-amber-400 border-amber-400'
                : 'theme-btn-secondary border-black/10 dark:border-white/10 opacity-70 hover:opacity-100'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>المفضلة</span>
          </button>

          <button
            onClick={() => setFilterMode(filterMode === 'mastered' ? 'all' : 'mastered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-arabic border flex items-center gap-1.5 transition-all cursor-pointer ${
              filterMode === 'mastered'
                ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400'
                : 'theme-btn-secondary border-black/10 dark:border-white/10 opacity-70 hover:opacity-100'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>المتقنة</span>
          </button>

          <button
            onClick={() => setFilterMode(filterMode === 'due' ? 'all' : 'due')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-arabic border flex items-center gap-1.5 transition-all cursor-pointer ${
              filterMode === 'due'
                ? 'bg-cyan-400/20 text-cyan-400 border-cyan-400'
                : 'theme-btn-secondary border-black/10 dark:border-white/10 opacity-70 hover:opacity-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>مستحقة للمراجعة</span>
          </button>

          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-black font-arabic border flex items-center gap-1.5 theme-btn-primary shadow-sm active:scale-95 transition-all cursor-pointer ms-auto"
            title="تخصيص ألوان الخط والمربعات والتباين"
          >
            <Palette className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>🎨 ألوان الخط والمربعات</span>
          </button>
        </div>
      </div>


      {/* A-Z Letter Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-black/10 dark:border-white/10">
        <button
          onClick={() => setSelectedLetter('ALL')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
            selectedLetter === 'ALL'
              ? 'theme-btn-primary shadow-sm'
              : 'theme-btn-secondary opacity-60 hover:opacity-100'
          }`}
        >
          ALL
        </button>
        {ALPHABET.map((char) => {
          const isSel = selectedLetter === char;
          return (
            <button
              key={char}
              onClick={() => setSelectedLetter(char)}
              className={`w-7 h-7 rounded-lg text-xs font-mono font-bold shrink-0 transition-all flex items-center justify-center cursor-pointer ${
                isSel
                  ? 'theme-btn-primary shadow-sm scale-110'
                  : 'theme-btn-secondary opacity-60 hover:opacity-100'
              }`}
            >
              {char}
            </button>
          );
        })}
      </div>
    </div>
  );
}
