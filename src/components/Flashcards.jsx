import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Layers, RotateCw, Volume2, Star, CheckCircle, ArrowLeft, ArrowRight, Shuffle, Sparkles, Trophy, Lightbulb, Clock } from 'lucide-react';
import { OXFORD_3000 } from '../data/oxford3000';
import { useApp } from '../context/AppContext';
import { playAudio } from '../services/audioService';
import { analyzeSilentLetters } from '../utils/phoneticsUtils';
import { getMnemonicForWord } from '../utils/mnemonicsData';
import { SRS_RATINGS, formatSRSInterval } from '../utils/srsUtils';
import LiveEqualizer from './LiveEqualizer';

export default function Flashcards() {
  const {
    isFavorite,
    toggleFavorite,
    isMastered,
    toggleMastered,
    customWords,
    t,
    voicePreset,
    audioSpeed,
    rateWordSRS,
    srsRecords,
    addNotification,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);

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

  const handlePlayTTS = async (e, text) => {
    if (e) e.stopPropagation();
    setIsPlaying(true);
    await playAudio(text, { presetId: voicePreset, speed: audioSpeed });
    setIsPlaying(false);
  };

  const handleToggleMastered = (e, wordTerm) => {
    if (e) e.stopPropagation();
    toggleMastered(wordTerm);
  };

  const handleSRSRating = (e, rating) => {
    if (e) e.stopPropagation();
    if (!currentWord) return;
    rateWordSRS(currentWord.word, rating);
    const ratingLabels = {
      [SRS_RATINGS.AGAIN]: 'إعادة المراجعة غداً 🔁',
      [SRS_RATINGS.HARD]: 'صعبة (مراجعة بعد 3 أيام) ⏱️',
      [SRS_RATINGS.GOOD]: 'جيدة (مراجعة بعد 6 أيام) 👍',
      [SRS_RATINGS.EASY]: 'سهلة ومتقنة تماماً 🌟',
    };
    addNotification(`تم تحديث جدول التكرار المتباعد: ${ratingLabels[rating]}`, 'success');
    handleNext();
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

  const wordSRS = currentWord ? srsRecords[currentWord.word] : null;
  const mnemonic = currentWord ? getMnemonicForWord(currentWord.word, currentWord.arabic, currentWord.example) : null;

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
        <p className="text-xs sm:text-sm font-medium opacity-80 max-w-xl mx-auto font-arabic">
          بطاقات استذكار ثلاثية الأبعاد مدعومة بخوارزمية التكرار المتباعد الفائقة (SuperMemo SM-2)
        </p>

        {/* Keyboard shortcut hint pills */}
        <div className="flex items-center justify-center gap-3 mt-4 text-[11px] font-mono flex-wrap">
          <span className="px-2.5 py-1 rounded-xl border theme-btn-secondary">← Left: السابق</span>
          <span className="px-2.5 py-1 rounded-xl border theme-btn-primary">Space: قلب البطاقة 🔄</span>
          <span className="px-2.5 py-1 rounded-xl border theme-btn-secondary">Right: التالي →</span>
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
            className={`w-full min-h-[380px] rounded-3xl cursor-pointer transition-transform duration-500 transform-style-3d relative shadow-2xl ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front Card */}
            <div className="absolute inset-0 backface-hidden card-theme-target rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between text-center border-2 shadow-2xl">
              <div className="w-full flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-black border theme-btn-primary">
                  CEFR {currentWord.cefr || 'B1'}
                </span>
                <span className="text-xs font-black opacity-70 uppercase font-mono">{currentWord.pos}</span>
              </div>

              <div className="my-auto space-y-3">
                {/* Word with Silent Letters Highlight (Feature 23) */}
                <h3 dir="ltr" className="ltr-isolate text-4xl sm:text-5xl font-black tracking-tight">
                  {analyzeSilentLetters(currentWord.word).map((ch, idx) => (
                    <span key={idx} className={ch.isSilent ? 'silent-letter text-rose-500' : ''} title={ch.note || ''}>
                      {ch.char}
                    </span>
                  ))}
                </h3>
                <p dir="ltr" className="ltr-isolate text-cyan-600 dark:text-cyan-400 text-lg font-mono font-bold">
                  {currentWord.ipa || `/${currentWord.word}/`}
                </p>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={(e) => handlePlayTTS(e, currentWord.word)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 theme-btn-primary rounded-xl text-xs font-black shadow-lg transition-all"
                  >
                    <Volume2 className="w-4 h-4" /> {t('listenAudio')}
                  </button>
                  <LiveEqualizer isPlaying={isPlaying} />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs opacity-75 font-bold font-arabic">
                <RotateCw className="w-4 h-4" /> انقر أو اضغط مسافة للقلب وكشف المعنى
              </div>
            </div>

            {/* Back Card */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 card-theme-target rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between text-center border-2 shadow-2xl">
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-500 font-arabic">
                  الترجمة والسياق والذاكرة
                </span>
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

              <div className="my-auto space-y-3 max-w-lg">
                <h4 dir="rtl" className="rtl-text text-3xl font-black text-amber-600 dark:text-amber-300 font-arabic">
                  {currentWord.arabic}
                </h4>
                <p dir="ltr" className="ltr-isolate text-sm italic font-medium opacity-90 p-2.5 rounded-xl bg-black/5 border">
                  "{currentWord.example}"
                </p>

                {/* Visual Mnemonic Hook (Feature 33) */}
                {mnemonic && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs text-right font-arabic">
                    <div className="flex items-center gap-1 font-bold mb-0.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>الصورة الذهنية للذاكرة:</span>
                    </div>
                    <p>{mnemonic.hook}</p>
                  </div>
                )}
              </div>

              {/* Spaced Repetition (SRS) Rating Buttons (Feature 31) */}
              <div className="w-full pt-3 border-t space-y-1.5 font-arabic">
                <span className="text-[10px] font-bold opacity-70 block">
                  تقييم استقرار الكلمة في الذاكرة (SRS Schedule):
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={(e) => handleSRSRating(e, SRS_RATINGS.AGAIN)}
                    className="p-2 rounded-xl bg-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-xs font-bold transition-all"
                  >
                    إعادة 🔁
                  </button>
                  <button
                    onClick={(e) => handleSRSRating(e, SRS_RATINGS.HARD)}
                    className="p-2 rounded-xl bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/30 text-xs font-bold transition-all"
                  >
                    صعبة ⏱️
                  </button>
                  <button
                    onClick={(e) => handleSRSRating(e, SRS_RATINGS.GOOD)}
                    className="p-2 rounded-xl bg-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/30 text-xs font-bold transition-all"
                  >
                    جيدة 👍
                  </button>
                  <button
                    onClick={(e) => handleSRSRating(e, SRS_RATINGS.EASY)}
                    className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all"
                  >
                    سهلة 🌟
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-theme-target p-12 rounded-3xl border text-center font-arabic">
          <p className="text-lg font-bold opacity-70">لا توجد كلمات مطابقة للفلاتر المحددة.</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          className="flex-1 py-3.5 rounded-2xl border theme-btn-secondary font-black text-sm flex items-center justify-center gap-2 active:scale-95 shadow-md font-arabic"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>السابق</span>
        </button>

        <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl border bg-black/5 dark:bg-white/5">
          {currentIndex + 1} / {dataset.length}
        </span>

        <button
          onClick={handleNext}
          className="flex-1 py-3.5 rounded-2xl theme-btn-primary font-black text-sm flex items-center justify-center gap-2 active:scale-95 shadow-md font-arabic"
        >
          <span>التالي</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
