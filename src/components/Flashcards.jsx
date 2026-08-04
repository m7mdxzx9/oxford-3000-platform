import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Layers, RotateCw, Volume2, Star, CheckCircle, ArrowLeft, ArrowRight, Shuffle } from 'lucide-react';
import { OXFORD_3000 } from '../data/oxford3000';
import { useApp } from '../context/AppContext';
import { playAudio } from '../services/audioService';

export default function Flashcards() {
  const { isFavorite, toggleFavorite, isMastered, toggleMastered, customWords, t, voicePreset } = useApp();
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
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t('flashcardsTitle')}</h2>
        </div>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">{t('flashcardsSubtitle')}</p>

        {/* Keyboard shortcut hint pills */}
        <div className="flex items-center justify-center gap-3 mt-4 text-[11px] text-cyan-300/80 font-mono">
          <span className="px-2 py-0.5 bg-slate-900/80 border border-slate-800 rounded">← Left Arrow: Prev</span>
          <span className="px-2 py-0.5 bg-slate-900/80 border border-slate-800 rounded">Space: Flip Card</span>
          <span className="px-2 py-0.5 bg-slate-900/80 border border-slate-800 rounded">Right Arrow: Next →</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-cyan-900/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'A1', 'A2', 'B1', 'B2'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setLevelFilter(lvl);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                levelFilter === lvl ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-900/80 text-slate-400 border border-slate-800'
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
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 ${
              typeFilter === 'favorites' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-900/80 text-slate-400 border border-slate-800'
            }`}
          >
            <Star className="w-3.5 h-3.5" /> {t('favorites')}
          </button>

          <button
            onClick={handleShuffle}
            className="p-2 bg-slate-800 text-cyan-300 rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-slate-700 transition-all"
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
            <div className="absolute inset-0 backface-hidden glass-panel bg-[#0a1636]/90 border border-cyan-500/40 rounded-3xl p-8 flex flex-col items-center justify-between text-center">
              <div className="w-full flex items-center justify-between">
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-bold border border-cyan-500/30">
                  {currentWord.cefr || 'B1'}
                </span>
                <span className="text-xs text-slate-400 italic">{currentWord.pos}</span>
              </div>

              <div className="my-auto space-y-3">
                <h3 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight ltr-token">
                  {currentWord.word}
                </h3>
                <p className="text-cyan-400 text-lg font-mono ltr-token">
                  {currentWord.ipa || `/${currentWord.word}/`}
                </p>
                <button
                  onClick={(e) => handlePlayTTS(e, currentWord.word)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all"
                >
                  <Volume2 className="w-4 h-4" /> {t('listenAudio')}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RotateCw className="w-4 h-4 animate-spin-slow" /> Click or press Space to flip
              </div>
            </div>

            {/* Back Card */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 glass-panel bg-[#06122b]/95 border border-amber-500/40 rounded-3xl p-8 flex flex-col items-center justify-between text-center">
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Meaning & Context</span>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(currentWord.word); }} className="p-1.5 rounded-lg text-amber-400 hover:bg-slate-800">
                    <Star className={`w-4 h-4 ${isFavorite(currentWord.word) ? 'fill-amber-400' : ''}`} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toggleMastered(currentWord.word); }} className="p-1.5 rounded-lg text-emerald-400 hover:bg-slate-800">
                    <CheckCircle className={`w-4 h-4 ${isMastered(currentWord.word) ? 'fill-emerald-400' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="my-auto space-y-4 max-w-lg">
                <h4 className="text-3xl font-extrabold text-amber-300 dir-rtl">{currentWord.arabic}</h4>
                {currentWord.example && (
                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-sm text-slate-200 font-medium ltr-token">
                    "{currentWord.example}"
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RotateCw className="w-4 h-4" /> Click to view word
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl">No words match selected filters.</div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4">
        <button onClick={handlePrev} className="flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-200 rounded-2xl font-semibold transition-all">
          <ArrowLeft className="w-5 h-5" /> {t('previous')}
        </button>

        <span className="text-sm font-bold text-slate-400">
          {t('card')} {currentIndex + 1} {t('of')} {dataset.length}
        </span>

        <button onClick={handleNext} className="flex items-center gap-2 px-5 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-semibold shadow-lg shadow-cyan-600/20 transition-all">
          {t('next')} <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
