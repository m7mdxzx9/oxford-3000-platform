import React, { useState, useMemo } from 'react';
import { Sparkles, Brain, CheckCircle2, XCircle, RotateCcw, Flame, ArrowRight, Lightbulb, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { oxford3000Data } from '../data/oxford3000';
import { playSuccessChime } from '../services/soundEffects';

export default function ActiveRecallTrainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTyped, setUserTyped] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // 10 words with good examples
  const recallDeck = useMemo(() => {
    const list = [...oxford3000Data].filter(
      (w) => w.example && w.example.toLowerCase().includes(w.word.toLowerCase())
    );
    return list.sort(() => 0.5 - Math.random()).slice(0, 10);
  }, []);

  const currentItem = recallDeck[currentIndex] || recallDeck[0];
  const targetWord = (currentItem?.word || '').trim();

  // Create cloze sentence by replacing target word with blanks
  const maskedSentence = useMemo(() => {
    if (!currentItem?.example) return '...';
    const regex = new RegExp(`\\b${targetWord}\\b`, 'gi');
    return currentItem.example.replace(regex, '__________');
  }, [currentItem, targetWord]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isAnswered) return;

    const cleanInput = userTyped.trim().toLowerCase();
    const isMatch = cleanInput === targetWord.toLowerCase();

    setIsAnswered(true);
    setIsCorrect(isMatch);

    if (isMatch) {
      setScore((s) => s + (showHint ? 10 : 20));
      setStreak((st) => st + 1);
      try {
        playSuccessChime();
      } catch (err) {}
    } else {
      setStreak(0);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 450);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < recallDeck.length) {
      setCurrentIndex((i) => i + 1);
      setUserTyped('');
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
    } else {
      setIsFinished(true);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setUserTyped('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="max-w-xl mx-auto glass-panel p-8 rounded-3xl border shadow-2xl text-center space-y-6 card-theme-target font-arabic">
        <div className="w-20 h-20 mx-auto rounded-3xl theme-btn-primary flex items-center justify-center text-4xl shadow-xl tab-active-bounce">
          🧠
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black">جلسة الاستدعاء النشط اكتملت!</h2>
          <p className="text-sm opacity-80">
            لقد دربت ذاكرتك طويلة المدى بنجاح على استحضار المفردات من سياق الجملة.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl border bg-black/5 dark:bg-white/5 font-mono">
          <div>
            <span className="text-xs opacity-70 block font-arabic">النقاط الإجمالية</span>
            <span className="text-2xl font-black text-cyan-500">{score} XP</span>
          </div>
          <div>
            <span className="text-xs opacity-70 block font-arabic">أطول سلسلة استدعاء</span>
            <span className="text-2xl font-black text-amber-500">🔥 {streak}</span>
          </div>
        </div>

        <button
          onClick={restart}
          className="w-full theme-btn-primary py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>بدء جولة استدعاء جديدة</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border shadow-xl card-theme-target">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center font-bold text-xl">
              🧠
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-arabic flex items-center gap-2">
                <span>اختبار الاستدعاء النشط (Active Recall)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 font-mono font-bold">
                  {currentItem.cefr}
                </span>
              </h2>
              <p className="text-xs opacity-75 font-arabic">
                استرجع الكلمة المفقودة من الذاكرة بناءً على سياق الجملة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs font-bold">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-black/5 dark:bg-white/5">
              <Flame className={`w-4 h-4 text-amber-500 ${streak > 1 ? 'flame-streak-active' : ''}`} />
              <span>{streak}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl theme-btn-primary">
              {score} XP
            </div>
          </div>
        </div>
      </div>

      {/* Main Challenge Card */}
      <div
        className={`glass-panel p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 card-theme-target ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Progress header */}
        <div className="flex items-center justify-between text-xs opacity-70 font-mono">
          <span>الجملة {currentIndex + 1} من {recallDeck.length}</span>
          <span>{currentItem.pos}</span>
        </div>

        {/* Cloze Sentence Box */}
        <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border text-center space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-500 font-arabic block">
            املأ الفراغ بالكلمة المناسبة
          </span>
          <p className="text-lg sm:text-xl font-bold leading-relaxed ltr-token text-slate-800 dark:text-slate-100">
            "{maskedSentence}"
          </p>
        </div>

        {/* Meaning Hint Toggle */}
        <div className="text-center font-arabic">
          {!showHint && !isAnswered && (
            <button
              onClick={() => setShowHint(true)}
              className="px-3 py-1.5 rounded-xl border text-xs font-bold theme-btn-secondary inline-flex items-center gap-1.5"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>إظهار المعنى العربي المساعد (-10 XP)</span>
            </button>
          )}

          {showHint && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold dropdown-animate">
              المعنى المطلوب: {currentItem.arabic} (مستوى {currentItem.cefr})
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-arabic">
          <div className="relative">
            <input
              type="text"
              value={userTyped}
              onChange={(e) => setUserTyped(e.target.value)}
              disabled={isAnswered}
              placeholder="اكتب الكلمة الإنجليزية المفقودة..."
              className={`w-full glass-input px-4 py-3 rounded-2xl text-base font-bold text-center ltr-token ${
                isAnswered
                  ? isCorrect
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                    : 'border-rose-500 bg-rose-500/10 text-rose-500'
                  : 'focus:border-cyan-500'
              }`}
              autoFocus
            />
          </div>

          {!isAnswered ? (
            <button
              type="submit"
              disabled={!userTyped.trim()}
              className="w-full theme-btn-primary py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              تحقق من الإجابة
            </button>
          ) : (
            <div className="space-y-3 dropdown-animate">
              <div
                className={`p-4 rounded-2xl border text-center font-bold text-sm ${
                  isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                }`}
              >
                {isCorrect ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>إجابة صحيحة ومثالية!</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <XCircle className="w-5 h-5" />
                      <span>إجابة غير دقيقة! الكلمة الصحيحة هي:</span>
                    </div>
                    <div className="font-mono text-base font-black ltr-token text-cyan-400">
                      {targetWord} ({currentItem.ipa})
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full theme-btn-primary py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95"
              >
                <span>الانتقال للجملة التالية</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
