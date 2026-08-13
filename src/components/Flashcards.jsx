import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Layers, RotateCw, Volume2, Star, CheckCircle, ArrowLeft, ArrowRight, Shuffle, Sparkles, Trophy } from 'lucide-react';
import { OXFORD_3000 } from '../data/oxford3000';
import { useApp } from '../context/AppContext';
import { playAudio } from '../services/audioService';

export default function Flashcards() {
  const { isFavorite, toggleFavorite, isMastered, toggleMastered, customWords, t, voicePreset, addXp } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('all');

  const dataset = useMemo(() => {
    const combined = [...customWords, ...OXFORD_3000];
    return combined.filter((item) => {
      const matchLevel = levelFilter === 'ALL' || item.cefr === levelFilter;
      const matchType =
        typeFilter === 'all'
          ? true
          : typeFilter === 'favorites'
          ? isFavorite(item.word)
          : isMastered(item.word);
      return matchLevel && matchType;
    });
  }, [customWords, levelFilter, typeFilter, isFavorite, isMastered]);

  const currentWord = dataset[currentIndex] || dataset[0] || null;

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % (dataset.length || 1));
  }, [dataset.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + (dataset.length || 1)) % (dataset.length || 1));
  }, [dataset.length]);

  const handleShuffle = () => {
    setIsFlipped(false);
    const randomIndex = Math.floor(Math.random() * (dataset.length || 1));
    setCurrentIndex(randomIndex);
  };

  const handlePlayTTS = (e, text) => {
    if (e) e.stopPropagation();
    playAudio(text, { presetId: voicePreset });
  };

  const handleToggleMastered = (e, wordTerm) => {
    if (e) e.stopPropagation();
    const wasMastered = isMastered(wordTerm);
    toggleMastered(wordTerm);
    if (!wasMastered && addXp) {
      addXp(15, `إتقان كلمة "${wordTerm}"`);
    }
  };

  // Keyboard navigation shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="card-theme-target p-6 sm:p-8 rounded-3xl border text-center shadow-xl">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2.5 theme-btn-primary rounded-2xl shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">{t('flashcardsTitle')}</h2>
        </div>
        <p className="text-xs sm:text-sm font-medium opacity-80 max-w-xl mx-auto">{t('flashcardsSubtitle')}</p>

        {/* Keyboard shortcut hint pills */}
        <div className="flex items-center justify-center gap-3 mt-4 text-[11px] font-mono flex-wrap">
          <span className="px-2.5 py-1 rounded-xl border theme-btn-secondary">← Left: Prev</span>
          <span className="px-2.5 py-1 rounded-xl border theme-btn-primary">Space: Flip Card 🔄</span>
          <span className="px-2.5 py-1 rounded-xl border theme-btn-secondary">Right: Next →</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-theme-target p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['ALL', 'A1', 'A2', 'B1', 'B2'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setLevelFilter(lvl);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                levelFilter === lvl ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary opacity-80'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTypeFilter(typeFilter === 'favorites' ? 'all' : 'favorites');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
              typeFilter === 'favorites' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40' : 'theme-btn-secondary opacity-80'
            }`}
          >
            <Star className="w-3.5 h-3.5" /> {t('favorites')}
          </button>

          <button
            onClick={handleShuffle}
            className="p-2 rounded-xl text-xs font-black flex items-center gap-1 theme-btn-secondary hover:brightness-110 transition-all"
            title="Shuffle Deck"
          >
            <Shuffle className="w-4 h-4" /> {t('shuffle')}
          </button>
        </div>
      </div>

      {/* 3D Flip Card */}
      {currentWord ? (
        <div className="perspective-1000 my-8">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`w-full min-h-[350px] rounded-3xl cursor-pointer transition-transform duration-500 transform-style-3d relative shadow-2xl ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front Card */}
            <div className="absolute inset-0 backface-hidden card-theme-target rounded-3xl p-8 flex flex-col items-center justify-between text-center border-2 shadow-2xl">
              <div className="w-full flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-black border theme-btn-primary">
                  CEFR {currentWord.cefr || 'B1'}
                </span>
                <span className="text-xs font-black opacity-70 uppercase font-mono">{currentWord.pos}</span>
              </div>

              <div className="my-auto space-y-3">
                <h3 dir="ltr" className="ltr-isolate text-4xl sm:text-5xl font-black tracking-tight">
                  {currentWord.word}
                </h3>
                <p dir="ltr" className="ltr-isolate text-cyan-600 dark:text-cyan-400 text-lg font-mono font-bold">
                  {currentWord.ipa || `/${currentWord.word}/`}
                </p>
                <button
                  onClick={(e) => handlePlayTTS(e, currentWord.word)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 theme-btn-primary rounded-xl text-xs font-black shadow-lg transition-all"
                >
                  <Volume2 className="w-4 h-4" /> {t('listenAudio')}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs opacity-75 font-bold">
                <RotateCw className="w-4 h-4" /> انقر أو اضغط مسافة للقلب (Click or Space to flip)
              </div>
            </div>

            {/* Back Card */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 card-theme-target rounded-3xl p-8 flex flex-col items-center justify-between text-center border-2 shadow-2xl">
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-500">الترجمة والسياق (Meaning & Context)</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(currentWord.word); }}
                    className="p-2 rounded-xl theme-btn-secondary text-amber-500 hover:scale-105"
                  >
                    <Star className={`w-4 h-4 ${isFavorite(currentWord.word) ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => handleToggleMastered(e, currentWord.word)}
                    className="p-2 rounded-xl theme-btn-secondary text-emerald-500 hover:scale-105"
                  >
                    <CheckCircle className={`w-4 h-4 ${isMastered(currentWord.word) ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="my-auto space-y-4 max-w-lg">
                <h4 dir="rtl" className="rtl-text text-3xl font-black text-amber-600 dark:text-amber-300 font-arabic">
                  {currentWord.arabic}
                </h4>
                {currentWord.example && (
                  <div dir="ltr" className="ltr-isolate p-4 rounded-2xl border text-sm font-bold bg-black/5 leading-relaxed">
                    "{currentWord.example}"
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs opacity-75 font-bold">
                <RotateCw className="w-4 h-4" /> انقر للعودة للوجه الأول (Click to flip back)
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center opacity-70 card-theme-target rounded-3xl border">No words match selected filters.</div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs theme-btn-secondary transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> {t('previous')}
        </button>

        <span className="text-xs sm:text-sm font-black opacity-80">
          {t('card')} {currentIndex + 1} {t('of')} {dataset.length}
        </span>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs theme-btn-primary shadow-lg transition-all"
        >
          {t('next')} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
