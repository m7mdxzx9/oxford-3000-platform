import React, { useState, useEffect, useMemo } from 'react';
import { Volume2, Sparkles, HelpCircle, CheckCircle2, RotateCcw, Flame, ArrowRight, Lightbulb, Delete, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { oxford3000Data } from '../data/oxford3000Data';
import { playWordAudio } from '../services/audioService';
import { playSuccessChime } from '../services/soundEffects';
import LiveEqualizer from './LiveEqualizer';

export default function SpellingBee() {
  const { voicePreset, audioSpeed } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedLetters, setTypedLetters] = useState('');
  const [hintLevel, setHintLevel] = useState(0); // 0: none, 1: arabic, 2: first letter
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // 10 randomized words
  const words = useMemo(() => {
    const list = [...oxford3000Data].filter((w) => w.word.length >= 3 && !w.word.includes(' '));
    return list.sort(() => 0.5 - Math.random()).slice(0, 10);
  }, []);

  const currentWordObj = words[currentIndex] || words[0];
  const targetWord = (currentWordObj?.word || '').toLowerCase();

  const handlePlayAudio = async () => {
    if (!targetWord) return;
    setIsPlaying(true);
    await playWordAudio(targetWord, { preset: voicePreset, speed: audioSpeed });
    setIsPlaying(false);
  };

  useEffect(() => {
    setTypedLetters('');
    setHintLevel(0);
    setShowResult(false);
    const timer = setTimeout(() => {
      handlePlayAudio();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleKeyPress = (char) => {
    if (showResult) return;
    if (typedLetters.length < targetWord.length) {
      setTypedLetters((prev) => prev + char.toLowerCase());
    }
  };

  const handleBackspace = () => {
    if (showResult) return;
    setTypedLetters((prev) => prev.slice(0, -1));
  };

  const handleCheck = () => {
    if (typedLetters.trim().toLowerCase() === targetWord) {
      setShowResult(true);
      const points = hintLevel === 0 ? 20 : hintLevel === 1 ? 15 : 10;
      setScore((s) => s + points);
      setStreak((st) => st + 1);
      try {
        playSuccessChime();
      } catch (e) {}
    } else {
      setStreak(0);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 450);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < words.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setIsCompleted(false);
  };

  // Keyboard Rows
  const KB_ROWS = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  if (isCompleted) {
    return (
      <div className="max-w-xl mx-auto glass-panel p-8 rounded-3xl border shadow-2xl text-center space-y-6 card-theme-target">
        <div className="w-20 h-20 mx-auto rounded-3xl theme-btn-primary flex items-center justify-center text-4xl shadow-xl tab-active-bounce">
          🐝
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black font-arabic">مبروك! أتممت تحدي الإملاء بنجاح</h2>
          <p className="text-sm opacity-80 font-arabic">
            أظهرت مهارة استثنائية في تهجئة مفردات أكسفورد
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl border bg-black/5 dark:bg-white/5 font-mono">
          <div>
            <span className="text-xs opacity-70 block font-arabic">النقاط المكتسبة</span>
            <span className="text-2xl font-black text-cyan-500">{score} XP</span>
          </div>
          <div>
            <span className="text-xs opacity-70 block font-arabic">أطول سلسلة متتالية</span>
            <span className="text-2xl font-black text-amber-500">🔥 {streak}</span>
          </div>
        </div>

        <button
          onClick={restart}
          className="w-full theme-btn-primary py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="font-arabic">بدء جولة إملاء جديدة</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border shadow-xl card-theme-target">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xl">
              🐝
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-arabic flex items-center gap-2">
                <span>تحدي الإملاء الذكي (Spelling Bee)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-mono font-bold">
                  {currentWordObj.cefr}
                </span>
              </h2>
              <p className="text-xs opacity-75 font-arabic">
                استمع لنطق الكلمة واكتب حروفها بدقة
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

      {/* Main Card */}
      <div
        className={`glass-panel p-6 sm:p-8 rounded-3xl border shadow-2xl text-center space-y-6 card-theme-target ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Audio Replay Button */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <button
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className="w-20 h-20 rounded-full theme-btn-primary flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="انقر لسماع الكلمة مجدداً"
          >
            <Volume2 className="w-8 h-8" />
          </button>
          <div className="flex items-center gap-2">
            <LiveEqualizer isPlaying={isPlaying} />
            <span className="text-xs font-mono opacity-70 font-arabic">انقر لإعادة النطق</span>
          </div>
        </div>

        {/* Letter Boxes Display */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap py-2">
          {targetWord.split('').map((char, index) => {
            const letter = typedLetters[index] || '';
            const isFilled = index < typedLetters.length;
            const isRevealedByHint = hintLevel >= 2 && index === 0;

            return (
              <div
                key={index}
                className={`w-10 h-12 sm:w-12 sm:h-14 rounded-2xl border-2 flex items-center justify-center font-mono text-xl sm:text-2xl font-black transition-all ${
                  showResult
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                    : isFilled
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400 scale-105'
                    : 'border-slate-300 dark:border-slate-700 bg-black/5 dark:bg-white/5 opacity-70'
                }`}
              >
                {showResult ? char : isFilled ? letter : isRevealedByHint ? char : ''}
              </div>
            );
          })}
        </div>

        {/* Hints Bar */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {hintLevel === 0 && (
            <button
              onClick={() => setHintLevel(1)}
              className="px-3 py-1.5 rounded-xl border text-xs font-bold theme-btn-secondary flex items-center gap-1.5 font-arabic"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>طلب تلميح المعنى العربي (-5 XP)</span>
            </button>
          )}

          {hintLevel === 1 && (
            <div className="space-y-2 w-full">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold font-arabic">
                المعنى العربي: {currentWordObj.arabic} ({currentWordObj.pos})
              </div>
              <button
                onClick={() => setHintLevel(2)}
                className="px-3 py-1 rounded-xl border text-[11px] font-bold theme-btn-secondary flex items-center gap-1.5 mx-auto font-arabic"
              >
                <Sparkles className="w-3 h-3 text-cyan-500" />
                <span>كشف الحرف الأول (-5 XP)</span>
              </button>
            </div>
          )}

          {hintLevel >= 2 && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold font-arabic">
              المعنى: {currentWordObj.arabic} | الحرف الأول: {targetWord[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Onscreen Keyboard */}
        {!showResult && (
          <div className="space-y-1.5 pt-2">
            {KB_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
                {row.map((k) => (
                  <button
                    key={k}
                    onClick={() => handleKeyPress(k)}
                    className="w-7 h-10 sm:w-10 sm:h-12 rounded-xl border font-mono font-bold text-sm sm:text-base theme-btn-secondary hover:scale-105 active:scale-95 transition-all uppercase"
                  >
                    {k}
                  </button>
                ))}
              </div>
            ))}
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={handleBackspace}
                className="px-4 py-2.5 rounded-xl border theme-btn-secondary text-xs font-bold flex items-center gap-1 active:scale-95"
              >
                <Delete className="w-4 h-4" />
                <span>حذف</span>
              </button>
              <button
                onClick={handleCheck}
                disabled={typedLetters.length < targetWord.length}
                className="px-6 py-2.5 rounded-xl theme-btn-primary text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>تحقق من الإملاء</span>
              </button>
            </div>
          </div>
        )}

        {/* Result Success banner & Next */}
        {showResult && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 dropdown-animate">
            <div className="flex items-center justify-center gap-2 text-emerald-500 font-black text-sm font-arabic">
              <CheckCircle2 className="w-5 h-5" />
              <span>إملاء ممتاز وصحيح 100%!</span>
            </div>
            <div className="text-xs font-mono opacity-80">
              {currentWordObj.ipa} &bull; {currentWordObj.example}
            </div>
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl theme-btn-primary font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 font-arabic"
            >
              <span>الانتقال للكلمة التالية</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
