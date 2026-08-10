import React, { useState, useMemo, useEffect } from 'react';
import { Award, Volume2, CheckCircle2, XCircle, RotateCcw, Flame, Trophy, Clock } from 'lucide-react';
import { OXFORD_3000 } from '../data/oxford3000';
import { playAudio } from '../services/audioService';
import { useApp } from '../context/AppContext';

export default function QuizGame() {
  const { t, voicePreset } = useApp();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  const quizItems = useMemo(() => {
    const shuffled = [...OXFORD_3000].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10).map((item) => {
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
  }, [quizFinished]);

  const currentItem = quizItems[questionIndex];

  // 15-second Question Countdown Timer
  useEffect(() => {
    if (isAnswered || quizFinished) return;

    setTimeLeft(15);
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
  }, [questionIndex, isAnswered, quizFinished]);

  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    if (opt === currentItem.correctArabic) {
      setScore((prev) => prev + 10);
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
    setQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="card-theme-target p-6 sm:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden flex items-center justify-between shadow-xl bg-[var(--bg-card)] text-[var(--text-main)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-amber-500/20 text-amber-500 dark:text-amber-400 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">{t('quizTitle')}</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-bold">{t('quizSubtitle')}</p>
        </div>

        {/* Score & Streak Counters */}
        <div className="flex items-center gap-3">
          <div className="text-center p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider block">{t('score')}</span>
            <span className="text-xl font-black text-cyan-600 dark:text-cyan-400">{score}</span>
          </div>

          <div className="text-center p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" /> {t('streak')}
            </span>
            <span className="text-xl font-black text-orange-500">{streak}</span>
          </div>
        </div>
      </div>

      {!quizFinished && currentItem ? (
        <div className="card-theme-target p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 bg-[var(--bg-card)] text-[var(--text-main)] shadow-xl">
          {/* Top Progress & Timer Bar */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-bold">
            <span>Question {questionIndex + 1} of {quizItems.length}</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 font-black">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> {timeLeft}s remaining
            </div>
            <span>CEFR Level: {currentItem.wordObj.cefr}</span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${((questionIndex + 1) / quizItems.length) * 100}%` }}
            />
          </div>

          {/* Question Card Hero Box */}
          <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 text-center space-y-3 shadow-xl">
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

            <p className="text-cyan-300 font-mono text-sm ltr-token font-bold">
              {currentItem.wordObj.ipa} ({currentItem.wordObj.pos})
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentItem.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentItem.correctArabic;

              let btnStyle = 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-cyan-500 hover:bg-cyan-500/10 shadow-sm';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-300 font-black shadow-md';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-100 dark:bg-rose-500/20 border-2 border-rose-500 text-rose-950 dark:text-rose-300 font-black shadow-md';
                } else {
                  btnStyle = 'opacity-50 bg-slate-100 dark:bg-slate-900/40 border-2 border-slate-200 dark:border-slate-800 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl text-right font-black text-lg dir-rtl transition-all flex items-center justify-between active:scale-95 ${btnStyle}`}
                >
                  <span className="font-arabic">{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Correct Example Context Hint when Answered */}
          {isAnswered && currentItem.wordObj.example && (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-slate-900 dark:text-slate-200 space-y-1 font-bold">
              <span className="font-black text-cyan-800 dark:text-cyan-400 block">Example Usage:</span>
              <p className="font-semibold ltr-token">"{currentItem.wordObj.example}"</p>
            </div>
          )}

          {/* Footer Action */}
          {isAnswered && (
            <div className="pt-4 flex justify-end">
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
          <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black">{t('quizCompleted')}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-bold">
              Score: <span className="text-cyan-600 dark:text-cyan-400 font-black text-lg">{score}</span> / 100.
            </p>
          </div>

          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-6 py-3.5 theme-btn-primary text-slate-950 font-black rounded-2xl shadow-lg transition-all hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" /> {t('playAgain')}
          </button>
        </div>
      )}
    </div>
  );
}
