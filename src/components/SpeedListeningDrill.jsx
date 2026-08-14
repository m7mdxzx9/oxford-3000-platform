import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Volume2, Zap, Play, RotateCcw, Award, CheckCircle2, XCircle, Clock, Flame, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { oxford3000Data } from '../data/oxford3000';
import { playWordAudio } from '../services/audioService';
import { playSuccessChime } from '../services/soundEffects';
import LiveEqualizer from './LiveEqualizer';

const SPEED_LEVELS = [
  { id: 'warmup', speed: 0.75, label: '0.75x - الإحماء', badge: 'Warm-up', color: 'text-emerald-500' },
  { id: 'normal', speed: 1.0, label: '1.0x - الطبيعي', badge: 'Standard', color: 'text-cyan-500' },
  { id: 'fast', speed: 1.25, label: '1.25x - المسرع', badge: 'Fast Speed', color: 'text-amber-500' },
  { id: 'turbo', speed: 1.5, label: '1.5x - الفائق', badge: 'Turbo Sonic', color: 'text-rose-500' },
];

export default function SpeedListeningDrill() {
  const { voicePreset } = useApp();
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [roundEnded, setRoundEnded] = useState(false);

  // Pick 10 random words for the drill session
  const drillWords = useMemo(() => {
    const shuffled = [...oxford3000Data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }, []);

  const currentItem = drillWords[currentIndex] || drillWords[0];

  // Generate 4 multiple-choice options (1 correct + 3 random distractors)
  const options = useMemo(() => {
    if (!currentItem) return [];
    const distractors = oxford3000Data
      .filter((w) => w.word !== currentItem.word)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const combined = [currentItem, ...distractors].sort(() => 0.5 - Math.random());
    return combined;
  }, [currentItem]);

  const playCurrentAudio = useCallback(async () => {
    if (!currentItem) return;
    setIsPlaying(true);
    await playWordAudio(currentItem.word, { preset: voicePreset, speed: selectedSpeed });
    setIsPlaying(false);
  }, [currentItem, voicePreset, selectedSpeed]);

  // Auto-play word when question changes
  useEffect(() => {
    setUserAnswer(null);
    const timer = setTimeout(() => {
      playCurrentAudio();
    }, 400);
    return () => clearTimeout(timer);
  }, [currentIndex, playCurrentAudio]);

  const handleSelectOption = (opt) => {
    if (userAnswer !== null) return; // already answered
    const isCorrect = opt.word === currentItem.word;
    setUserAnswer(opt.word);

    if (isCorrect) {
      setScore((s) => s + 10 * Math.round(selectedSpeed * 10));
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
    if (currentIndex + 1 < drillWords.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setRoundEnded(true);
    }
  };

  const restartDrill = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setUserAnswer(null);
    setRoundEnded(false);
  };

  if (roundEnded) {
    return (
      <div className="max-w-xl mx-auto glass-panel p-8 rounded-3xl border shadow-2xl text-center space-y-6 card-theme-target">
        <div className="w-20 h-20 mx-auto rounded-3xl theme-btn-primary flex items-center justify-center text-4xl shadow-xl tab-active-bounce">
          🏆
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black font-arabic">اكتمل تحدي الاستماع السريع!</h2>
          <p className="text-sm opacity-80 font-arabic">
            أحسنت! أتممت الجلسة بسرعة <span className="font-bold text-cyan-500">{selectedSpeed}x</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl border bg-black/5 dark:bg-white/5">
          <div>
            <span className="text-xs opacity-70 block font-arabic">مجموع النقاط</span>
            <span className="text-2xl font-black text-cyan-500">{score} XP</span>
          </div>
          <div>
            <span className="text-xs opacity-70 block font-arabic">أطول سلسلة</span>
            <span className="text-2xl font-black text-amber-500">🔥 {streak}</span>
          </div>
        </div>

        <button
          onClick={restartDrill}
          className="w-full theme-btn-primary py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="font-arabic">بدء جولة جديدة</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Speed Ladder */}
      <div className="glass-panel p-6 rounded-3xl border shadow-xl card-theme-target space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center font-bold text-lg">
              ⚡
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-arabic flex items-center gap-2">
                <span>تحدي سرعة الاستماع والفهم</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 font-mono">
                  Speed Drill
                </span>
              </h2>
              <p className="text-xs opacity-75 font-arabic">
                استمع للكلمة بالسرعة المضبوطة وحدد المعنى الصحيح
              </p>
            </div>
          </div>

          {/* Score & Streak Counters */}
          <div className="flex items-center gap-2 font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-black/5 dark:bg-white/5 text-xs font-bold">
              <Flame className={`w-4 h-4 text-amber-500 ${streak > 2 ? 'flame-streak-active' : ''}`} />
              <span>{streak}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl theme-btn-primary text-xs font-bold">
              {score} XP
            </div>
          </div>
        </div>

        {/* Speed Ladder Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t">
          {SPEED_LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setSelectedSpeed(lvl.speed)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                selectedSpeed === lvl.speed
                  ? 'theme-btn-primary shadow-md scale-102'
                  : 'theme-btn-secondary opacity-75 hover:opacity-100'
              }`}
            >
              <span className="font-mono text-sm font-black">{lvl.speed}x</span>
              <span className="text-[10px] font-arabic">{lvl.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Question Card */}
      <div
        className={`glass-panel p-6 sm:p-8 rounded-3xl border shadow-2xl text-center space-y-6 card-theme-target ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Progress Bar */}
        <div className="flex items-center justify-between text-xs opacity-70 font-mono mb-2">
          <span>السؤال {currentIndex + 1} من {drillWords.length}</span>
          <span>{Math.round(((currentIndex + 1) / drillWords.length) * 100)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / drillWords.length) * 100}%` }}
          />
        </div>

        {/* Center Audio Player */}
        <div className="py-6 flex flex-col items-center justify-center space-y-3">
          <button
            onClick={playCurrentAudio}
            disabled={isPlaying}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full theme-btn-primary flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-90 cursor-pointer"
            title="انقر لإعادة سماع الكلمة"
          >
            <Volume2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </button>
          <div className="flex items-center gap-2">
            <LiveEqualizer isPlaying={isPlaying} />
            <span className="text-xs font-mono opacity-70">
              {isPlaying ? 'جاري النطق...' : 'انقر للسماع مجدداً'}
            </span>
          </div>
        </div>

        {/* Options Grid (Multiple Choice) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt, i) => {
            const isSelected = userAnswer === opt.word;
            const isCorrectTarget = opt.word === currentItem.word;
            let btnStyle = 'theme-btn-secondary';

            if (userAnswer !== null) {
              if (isCorrectTarget) {
                btnStyle = 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/40 shadow-lg';
              } else if (isSelected && !isCorrectTarget) {
                btnStyle = 'bg-rose-500 text-white border-rose-400 shadow-rose-500/40 shadow-lg';
              } else {
                btnStyle = 'opacity-40';
              }
            }

            return (
              <button
                key={opt.id || i}
                onClick={() => handleSelectOption(opt)}
                disabled={userAnswer !== null}
                className={`p-4 rounded-2xl border text-sm sm:text-base font-bold transition-all flex items-center justify-between gap-2 text-right active:scale-95 ${btnStyle}`}
              >
                <div className="space-y-0.5">
                  <div className="font-arabic">{opt.arabic}</div>
                  {userAnswer !== null && (
                    <div className="text-xs font-mono opacity-80 ltr-token text-left">{opt.word}</div>
                  )}
                </div>
                {userAnswer !== null && isCorrectTarget && (
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                )}
                {userAnswer !== null && isSelected && !isCorrectTarget && (
                  <XCircle className="w-5 h-5 text-white shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        {userAnswer !== null && (
          <div className="pt-4 border-t flex justify-end dropdown-animate">
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-2xl theme-btn-primary font-black text-sm flex items-center gap-2 shadow-lg active:scale-95"
            >
              <span className="font-arabic">الكلمة التالية</span>
              <Play className="w-4 h-4 fill-current rtl:rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
