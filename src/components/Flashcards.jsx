/**
 * ============================================================================
 * File: src/components/Flashcards.jsx
 * Purpose: 3D Flashcards with Modern FSRS v4/v5 Spaced Repetition Engine
 * Connected To: db.js, fsrs.js, AppContext.jsx, mnemonicsData.js
 * Description:
 *   Intelligent 3D Flashcard system driven by IndexedDB and the FSRS algorithm.
 *   - Automatically queries due cards (`getDueWords()`) ordered by memory urgency.
 *   - Provides 4 granular FSRS rating buttons (Again, Hard, Good, Easy) with interval previews.
 *   - Persists scheduling metrics directly into IndexedDB (`progress` table).
 * ============================================================================
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Layers,
  RotateCw,
  Volume2,
  Star,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  Sparkles,
  Trophy,
  Lightbulb,
  Clock,
  Activity,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playAudio } from '../services/audioService';
import { analyzeSilentLetters } from '../utils/phoneticsUtils';
import { getMnemonicForWord } from '../utils/mnemonicsData';
import {
  FSRS_RATING,
  FSRS_STATE,
  fsrsGetNextReview,
  fsrsCalculateRetrievability,
  formatIntervalHuman,
} from '../services/fsrs';
import { getDueWords, updateProgress, getProgressByWordId } from '../services/db';
import LiveEqualizer from './LiveEqualizer';

export default function Flashcards() {
  const {
    isFavorite,
    toggleFavorite,
    isMastered,
    toggleMastered,
    t,
    voicePreset,
    audioSpeed,
    addNotification,
    addXp,
  } = useApp();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('due'); // 'due' | 'all' | 'favorites'
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch Due Words from IndexedDB on mount & filter change
  const loadCardsFromDb = useCallback(async () => {
    setLoading(true);
    try {
      const dueList = await getDueWords(100);
      setCards(dueList);
      setCurrentIndex(0);
    } catch (err) {
      console.error('❌ Error loading cards from IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCardsFromDb();
  }, [loadCardsFromDb]);

  // Filtered dataset
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchLevel = levelFilter === 'ALL' || card.cefr === levelFilter;
      const matchMode =
        modeFilter === 'all'
          ? true
          : modeFilter === 'favorites'
          ? isFavorite(card.word)
          : true; // 'due' is already filtered from DB
      return matchLevel && matchMode;
    });
  }, [cards, levelFilter, modeFilter, isFavorite]);

  const currentWord = filteredCards[currentIndex] || filteredCards[0] || null;

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % (filteredCards.length || 1));
  }, [filteredCards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + (filteredCards.length || 1)) % (filteredCards.length || 1));
  }, [filteredCards.length]);

  const handlePlayTTS = async (e, text) => {
    if (e) e.stopPropagation();
    setIsPlaying(true);
    await playAudio(text, { presetId: voicePreset, speed: audioSpeed });
    setIsPlaying(false);
  };

  // FSRS Rating Handler
  const handleFSRSRating = async (e, rating) => {
    if (e) e.stopPropagation();
    if (!currentWord) return;

    try {
      const existingProg = (await getProgressByWordId(currentWord.id)) || currentWord.fsrsProgress || {};
      const newProgress = fsrsGetNextReview(existingProg, rating, Date.now());

      // Save to IndexedDB progress table
      await updateProgress(currentWord.id, newProgress);

      const ratingMessages = {
        [FSRS_RATING.AGAIN]: 'إعادة المراجعة قريباً 🔁',
        [FSRS_RATING.HARD]: 'مراجعة بمعدل مكثف ⏱️',
        [FSRS_RATING.GOOD]: 'تمت الجدولة بنجاح 👍',
        [FSRS_RATING.EASY]: 'تم حفظ الكلمة بكفاءة عالية 🌟',
      };

      addXp(15);
      addNotification({
        type: 'success',
        message: `FSRS: ${ratingMessages[rating]} (مراجعة بعد ${formatIntervalHuman(newProgress.interval)})`,
      });

      // Remove from current due queue if mastered or reviewed
      setCards((prev) => prev.filter((_, idx) => idx !== currentIndex));
      setIsFlipped(false);
    } catch (err) {
      console.error('❌ Error updating FSRS progress:', err);
    }
  };

  // Keyboard navigation shortcuts
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
      } else if (isFlipped) {
        if (e.key === '1') handleFSRSRating(e, FSRS_RATING.AGAIN);
        if (e.key === '2') handleFSRSRating(e, FSRS_RATING.HARD);
        if (e.key === '3') handleFSRSRating(e, FSRS_RATING.GOOD);
        if (e.key === '4') handleFSRSRating(e, FSRS_RATING.EASY);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFlipped, currentWord]);

  const mnemonic = currentWord ? getMnemonicForWord(currentWord.word, currentWord.arabic, currentWord.examples?.[0]) : null;

  // FSRS Interval Previews for Buttons
  const intervalPreviews = useMemo(() => {
    if (!currentWord) return { again: '< 10m', hard: '1d', good: '3d', easy: '7d' };
    const prog = currentWord.fsrsProgress || {};
    return {
      again: formatIntervalHuman(fsrsGetNextReview(prog, FSRS_RATING.AGAIN).interval),
      hard: formatIntervalHuman(fsrsGetNextReview(prog, FSRS_RATING.HARD).interval),
      good: formatIntervalHuman(fsrsGetNextReview(prog, FSRS_RATING.GOOD).interval),
      easy: formatIntervalHuman(fsrsGetNextReview(prog, FSRS_RATING.EASY).interval),
    };
  }, [currentWord]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-arabic">
      {/* Header */}
      <div className="card-theme-target p-6 sm:p-8 rounded-3xl border text-center shadow-xl">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2.5 theme-btn-primary rounded-2xl shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">{t('flashcardsTitle')}</h2>
        </div>
        <p className="text-xs sm:text-sm font-medium opacity-80 max-w-xl mx-auto">
          بطاقات استذكار ثلاثية الأبعاد مدعومة بخوارزمية التكرار المتباعد الحديثة <strong>(FSRS v4.5)</strong> وقاعدة بيانات <strong>IndexedDB</strong>
        </p>

        {/* Keyboard shortcut hint pills */}
        <div className="flex items-center justify-center gap-2 mt-4 text-[11px] font-mono flex-wrap">
          <span className="px-2.5 py-1 rounded-xl border theme-btn-secondary">← Left: السابق</span>
          <span className="px-2.5 py-1 rounded-xl border theme-btn-primary">Space: قلب البطاقة 🔄</span>
          <span className="px-2.5 py-1 rounded-xl border theme-btn-secondary">Right: التالي →</span>
          <span className="px-2.5 py-1 rounded-xl border bg-black/5 dark:bg-white/5">1-4: التقييم السريع</span>
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
            onClick={() => setModeFilter('due')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
              modeFilter === 'due' ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>المستحقة للمراجعة ({filteredCards.length})</span>
          </button>

          <button
            onClick={() => setModeFilter('favorites')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
              modeFilter === 'favorites' ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>المفضلة</span>
          </button>
        </div>
      </div>

      {/* 3D Flashcard Container */}
      {currentWord ? (
        <div
          className="perspective-1000 w-full min-h-[380px] sm:min-h-[420px] cursor-pointer select-none"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`relative w-full h-full min-h-[380px] sm:min-h-[420px] duration-500 transform-style-3d transition-transform ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* FRONT OF CARD */}
            <div className="absolute inset-0 w-full h-full backface-hidden card-theme-target p-6 sm:p-8 rounded-3xl border shadow-2xl flex flex-col justify-between items-center text-center">
              {/* Top Meta Bar */}
              <div className="w-full flex items-center justify-between text-xs font-bold opacity-75">
                <span className="px-2.5 py-1 rounded-lg theme-btn-secondary uppercase font-mono">
                  {currentWord.pos || 'word'} • {currentWord.cefr || 'B1'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-mono">
                    FSRS Due
                  </span>
                </div>
              </div>

              {/* Center Content */}
              <div className="my-auto space-y-3">
                <h3 dir="ltr" className="ltr-isolate text-4xl sm:text-5xl font-black tracking-tight">
                  {analyzeSilentLetters(currentWord.word).map((ch, idx) => (
                    <span key={idx} className={ch.isSilent ? 'silent-letter text-rose-500' : ''}>
                      {ch.char}
                    </span>
                  ))}
                </h3>
                <p dir="ltr" className="ltr-isolate font-mono text-sm sm:text-base opacity-75">
                  {currentWord.ipa || `/${currentWord.word}/`}
                </p>

                {/* Audio Listen Button */}
                <div className="pt-2">
                  <button
                    onClick={(e) => handlePlayTTS(e, currentWord.word)}
                    disabled={isPlaying}
                    className="p-3.5 rounded-2xl theme-btn-primary shadow-lg active:scale-90 transition-all inline-flex items-center justify-center cursor-pointer"
                  >
                    {isPlaying ? <LiveEqualizer isPlaying={true} /> : <Volume2 className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              {/* Bottom Hint */}
              <div className="w-full flex items-center justify-center gap-1.5 text-xs opacity-60 font-medium">
                <RotateCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>انقر أو اضغط المسافة للكشف عن الترجمة والمثال</span>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 card-theme-target p-6 sm:p-8 rounded-3xl border shadow-2xl flex flex-col justify-between text-center overflow-y-auto">
              <div className="w-full flex items-center justify-between text-xs font-bold opacity-75">
                <span dir="ltr" className="ltr-isolate font-black text-base">
                  {currentWord.word}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(currentWord.word);
                  }}
                  className="p-1.5 rounded-xl theme-btn-secondary"
                >
                  <Star className={`w-4 h-4 ${isFavorite(currentWord.word) ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>

              {/* Translation & Details */}
              <div className="my-auto space-y-3 py-2">
                <h4 className="text-2xl sm:text-3xl font-black text-emerald-500 dark:text-emerald-400">
                  {currentWord.arabic}
                </h4>
                {currentWord.examples?.[0] && (
                  <p dir="ltr" className="ltr-isolate text-sm italic font-medium p-3 rounded-2xl box-surface border text-start">
                    "{currentWord.examples[0]}"
                  </p>
                )}

                {/* Visual Mnemonic */}
                {mnemonic && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs text-start">
                    <div className="flex items-center gap-1 font-bold mb-0.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>الصورة الذهنية للذاكرة:</span>
                    </div>
                    <p>{mnemonic.hook}</p>
                  </div>
                )}
              </div>

              {/* FSRS Rating Buttons */}
              <div className="w-full pt-3 border-t space-y-1.5">
                <span className="text-[10px] font-bold opacity-70 block">
                  تقييم FSRS الذكي للاستذكار (اختر مدى سهولة التذكر):
                </span>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {/* Again */}
                  <button
                    onClick={(e) => handleFSRSRating(e, FSRS_RATING.AGAIN)}
                    className="p-2 sm:p-2.5 rounded-xl bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-xs font-black transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95"
                  >
                    <span>إعادة (1)</span>
                    <span className="text-[10px] opacity-75 font-mono">{intervalPreviews.again}</span>
                  </button>

                  {/* Hard */}
                  <button
                    onClick={(e) => handleFSRSRating(e, FSRS_RATING.HARD)}
                    className="p-2 sm:p-2.5 rounded-xl bg-amber-500/15 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/30 text-xs font-black transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95"
                  >
                    <span>صعبة (2)</span>
                    <span className="text-[10px] opacity-75 font-mono">{intervalPreviews.hard}</span>
                  </button>

                  {/* Good */}
                  <button
                    onClick={(e) => handleFSRSRating(e, FSRS_RATING.GOOD)}
                    className="p-2 sm:p-2.5 rounded-xl bg-blue-500/15 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/30 text-xs font-black transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95"
                  >
                    <span>جيدة (3)</span>
                    <span className="text-[10px] opacity-75 font-mono">{intervalPreviews.good}</span>
                  </button>

                  {/* Easy */}
                  <button
                    onClick={(e) => handleFSRSRating(e, FSRS_RATING.EASY)}
                    className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 text-xs font-black transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95"
                  >
                    <span>سهلة (4)</span>
                    <span className="text-[10px] opacity-75 font-mono">{intervalPreviews.easy}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-theme-target p-12 rounded-3xl border text-center space-y-3">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
          <h3 className="text-xl font-black">أحسنت! لا توجد بطاقات مستحقة للمراجعة الآن 🎉</h3>
          <p className="text-xs opacity-75 max-w-md mx-auto">
            تمت مراجعة جميع كلمات FSRS المقررة لهذا اليوم. يمكنك مراجعة كلمات إضافية أو التدرب عبر الألعاب.
          </p>
          <button
            onClick={() => setModeFilter('all')}
            className="px-4 py-2 rounded-xl theme-btn-primary text-xs font-black"
          >
            مراجعة كافة الكلمات
          </button>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          className="flex-1 py-3.5 rounded-2xl border theme-btn-secondary font-black text-sm flex items-center justify-center gap-2 active:scale-95 shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>السابق</span>
        </button>

        <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl border bg-black/5 dark:bg-white/5">
          {filteredCards.length > 0 ? `${currentIndex + 1} / ${filteredCards.length}` : '0 / 0'}
        </span>

        <button
          onClick={handleNext}
          className="flex-1 py-3.5 rounded-2xl theme-btn-primary font-black text-sm flex items-center justify-center gap-2 active:scale-95 shadow-md cursor-pointer"
        >
          <span>التالي</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
