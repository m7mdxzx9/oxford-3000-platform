import React, { useState, useMemo, useEffect } from 'react';
import {
  Award,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Flame,
  Trophy,
  Clock,
  Settings2,
  PlayCircle,
  Filter,
  HelpCircle,
} from 'lucide-react';
import { OXFORD_3000 } from '../data/oxford3000';
import { playAudio } from '../services/audioService';
import { useApp } from '../context/AppContext';

export default function QuizGame() {
  const { t, voicePreset } = useApp();

  // Quiz Configuration State
  const [quizLength, setQuizLength] = useState(10); // 5, 10, 15, 20, 25
  const [selectedCefr, setSelectedCefr] = useState('ALL'); // 'ALL', 'A1', 'A2', 'B1', 'B2'
  const [timeLimit, setTimeLimit] = useState(15); // 10, 15, 30, 0 (no limit)
  const [quizStarted, setQuizStarted] = useState(false);

  // Active Quiz Progress State
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [quizResetToken, setQuizResetToken] = useState(0);

  // Generate dynamic quiz questions based on CEFR filter & length
  const quizItems = useMemo(() => {
    let pool = [...OXFORD_3000];
    if (selectedCefr !== 'ALL') {
      pool = pool.filter((w) => w.cefr.toUpperCase() === selectedCefr.toUpperCase());
    }

    if (pool.length === 0) {
      pool = [...OXFORD_3000];
    }

    const shuffled = pool.sort(() => 0.5 - Math.random());
    const count = Math.min(quizLength, shuffled.length);

    return shuffled.slice(0, count).map((item) => {
      const wrongOptions = OXFORD_3000.filter((w) => w.id !== item.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((w) => w.arabic);

      const options = [item.arabic, ...wrongOptions].sort(() => 0.5 - Math.random());

      return {
        wordObj: item,
        correctArabic: item.arabic,
        options,
      };
    });
  }, [quizResetToken, quizLength, selectedCefr]);

  const currentItem = quizItems[questionIndex];

  // Question Countdown Timer
  useEffect(() => {
    if (!quizStarted || isAnswered || quizFinished || timeLimit === 0) return;

    setTimeLeft(timeLimit);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsAnswered(true);
          setStreak(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questionIndex, isAnswered, quizFinished, quizStarted, timeLimit]);

  const handleStartQuiz = () => {
    setQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizFinished(false);
    setQuizResetToken((prev) => prev + 1);
    setQuizStarted(true);
  };

  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    if (opt === currentItem.correctArabic) {
      setScore((prev) => prev + Math.round(100 / quizItems.length));
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex + 1 < quizItems.length) {
      setQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setQuizStarted(false);
    setQuizFinished(false);
  };

  // Render Quiz Setup Screen before starting
  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="card-theme-target p-6 sm:p-10 rounded-3xl border border-cyan-500/30 text-center space-y-6 shadow-2xl bg-[var(--bg-card)] text-[var(--text-main)]">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-md">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black">{t('quizTitle')}</h2>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              خصص إعدادات الاختبار حسب مستواك في مفردات أكسفورد الـ 3000 وابدأ التحدي الآن!
            </p>
          </div>

          {/* Controls Bar */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-5 text-right dir-rtl font-arabic">
            <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              <Settings2 className="w-4 h-4 text-cyan-500" />
              <span>إعدادات وتخصيص الاختبار:</span>
            </div>

            {/* 1. Question Count Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                🔢 عدد الأسئلة في الجولة:
              </label>
              <div className="grid grid-cols-5 gap-2" dir="ltr">
                {[5, 10, 15, 20, 25].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuizLength(num)}
                    className={`py-2 rounded-xl text-xs font-black transition-all border ${
                      quizLength === num
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-black scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {num} سؤال
                  </button>
                ))}
              </div>
            </div>

            {/* 2. CEFR Level Difficulty Filter */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                🎯 مستوى المفردات (CEFR Level):
              </label>
              <div className="grid grid-cols-5 gap-2" dir="ltr">
                {['ALL', 'A1', 'A2', 'B1', 'B2'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedCefr(lvl)}
                    className={`py-2 rounded-xl text-xs font-black transition-all border ${
                      selectedCefr === lvl
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md font-black scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {lvl === 'ALL' ? 'الكل (All)' : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Question Time Limit Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                ⏱️ المؤقت الزمني لكل سؤال:
              </label>
              <div className="grid grid-cols-4 gap-2" dir="ltr">
                {[
                  { value: 10, label: '10 ثوانٍ' },
                  { value: 15, label: '15 ثانية' },
                  { value: 30, label: '30 ثانية' },
                  { value: 0, label: 'بدون مؤقت' },
                ].map((tOpt) => (
                  <button
                    key={tOpt.value}
                    onClick={() => setTimeLimit(tOpt.value)}
                    className={`py-2 rounded-xl text-xs font-black transition-all border ${
                      timeLimit === tOpt.value
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {tOpt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            className="w-full py-4 rounded-2xl theme-btn-primary text-slate-950 font-black text-base transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-6 h-6" />
            <span>ابدأ الاختبار الآن ({quizLength} أسئلة)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="card-theme-target p-5 sm:p-6 rounded-3xl border border-cyan-500/30 flex items-center justify-between shadow-xl bg-[var(--bg-card)] text-[var(--text-main)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-500 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black">{t('quizTitle')}</h2>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              المستوى: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{selectedCefr}</span> | الأسئلة: {quizItems.length}
            </p>
          </div>
        </div>

        {/* Score & Streak Counters */}
        <div className="flex items-center gap-2">
          <div className="text-center px-3 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider block">{t('score')}</span>
            <span className="text-lg font-black text-cyan-600 dark:text-cyan-400">{score}</span>
          </div>

          <div className="text-center px-3 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" /> {t('streak')}
            </span>
            <span className="text-lg font-black text-orange-500">{streak}</span>
          </div>
        </div>
      </div>

      {!quizFinished && currentItem ? (
        <div className="card-theme-target p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 bg-[var(--bg-card)] text-[var(--text-main)] shadow-xl">
          {/* Top Progress & Timer Bar */}
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-black">
            <span>سؤال {questionIndex + 1} من {quizItems.length}</span>
            {timeLimit > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-950 dark:text-amber-300 border border-amber-500/40 font-black">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> {timeLeft} ثانية متبقية
              </div>
            )}
            <span>CEFR Level: {currentItem.wordObj.cefr}</span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((questionIndex + 1) / quizItems.length) * 100}%` }}
            />
          </div>

          {/* Question Card Hero Box */}
          <div className="p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 text-center space-y-3 shadow-2xl">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-black block">
              {t('selectArabic')}
            </span>

            <div className="flex items-center justify-center gap-3">
              <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tight ltr-token">
                {currentItem.wordObj.word}
              </h3>
              <button
                onClick={() => playAudio(currentItem.wordObj.word, { presetId: voicePreset })}
                className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all shadow-md active:scale-90"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <p className="text-cyan-300 font-mono text-sm ltr-token font-black">
              /{currentItem.wordObj.ipa}/ ({currentItem.wordObj.pos})
            </p>
          </div>

          {/* Options Grid with 100% High Contrast Text Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentItem.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentItem.correctArabic;

              let btnStyle =
                'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-slate-800 shadow-sm';
              let textStyle = 'text-slate-950 dark:text-white font-black text-xl';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-600 shadow-md ring-2 ring-emerald-500/50';
                  textStyle = 'text-emerald-950 dark:text-emerald-100 font-black text-xl';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-100 dark:bg-rose-950/80 border-2 border-rose-600 shadow-md ring-2 ring-rose-500/50';
                  textStyle = 'text-rose-950 dark:text-rose-100 font-black text-xl';
                } else {
                  btnStyle = 'opacity-50 bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800';
                  textStyle = 'text-slate-900 dark:text-slate-300 font-extrabold text-lg';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl text-right font-black dir-rtl transition-all flex items-center justify-between min-h-[60px] active:scale-95 ${btnStyle}`}
                >
                  <span className={`font-arabic ${textStyle}`}>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-300 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-700 dark:text-rose-300 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Correct Example Context Hint when Answered (High Contrast) */}
          {isAnswered && currentItem.wordObj.example && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white border-2 border-cyan-500/40 text-xs space-y-1.5 shadow-xl">
              <span className="font-black text-cyan-400 block text-xs tracking-wider">Example Usage:</span>
              <p className="font-black ltr-token text-base text-white">"{currentItem.wordObj.example}"</p>
            </div>
          )}

          {/* Footer Action */}
          {isAnswered && (
            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={handleRestart}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                تغيير إعدادات الاختبار
              </button>
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95"
              >
                {questionIndex + 1 < quizItems.length ? `${t('nextQuestion')} ←` : t('finishQuiz')}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Summary Screen */
        <div className="card-theme-target p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-6 bg-[var(--bg-card)] text-[var(--text-main)] shadow-xl">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black">{t('quizCompleted')}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-bold">
              النتيجة النهائية: <span className="text-cyan-600 dark:text-cyan-400 font-black text-xl">{score}</span> / 100
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3.5 theme-btn-primary text-slate-950 font-black rounded-2xl shadow-lg transition-all hover:scale-105"
            >
              <RotateCcw className="w-5 h-5" /> {t('playAgain')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
