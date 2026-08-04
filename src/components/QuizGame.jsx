import React, { useState, useMemo } from 'react';
import { Award, Volume2, CheckCircle2, XCircle, RotateCcw, Flame, Trophy } from 'lucide-react';
import { OXFORD_3000 } from '../data/oxford3000';
import { playAudio } from '../services/audioService';
import { useApp } from '../context/AppContext';

export default function QuizGame() {
  const { t } = useApp();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

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
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t('quizTitle')}</h2>
          </div>
          <p className="text-slate-400 text-sm">{t('quizSubtitle')}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{t('score')}</span>
            <span className="text-xl font-extrabold text-cyan-400">{score}</span>
          </div>

          <div className="text-center p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> {t('streak')}
            </span>
            <span className="text-xl font-extrabold text-orange-400">{streak}</span>
          </div>
        </div>
      </div>

      {!quizFinished && currentItem ? (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-900/40 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-semibold">
              <span>Question {questionIndex + 1} of {quizItems.length}</span>
              <span>CEFR Level: {currentItem.wordObj.cefr}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((questionIndex + 1) / quizItems.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
              {t('selectArabic')}
            </span>

            <div className="flex items-center justify-center gap-3">
              <h3 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight ltr-token">
                {currentItem.wordObj.word}
              </h3>
              <button
                onClick={() => playAudio(currentItem.wordObj.word)}
                className="p-2.5 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded-xl transition-all shadow-md"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <p className="text-cyan-400/90 font-mono text-sm ltr-token">
              {currentItem.wordObj.ipa} ({currentItem.wordObj.pos})
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentItem.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentItem.correctArabic;

              let btnStyle = 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-cyan-500/50';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold';
                } else {
                  btnStyle = 'bg-slate-900/40 border-slate-900 text-slate-500';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border text-right font-bold text-lg dir-rtl transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-2xl shadow-lg transition-all"
              >
                {questionIndex + 1 < quizItems.length ? t('nextQuestion') : t('finishQuiz')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-3xl border border-cyan-500/40 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-extrabold text-white">{t('quizCompleted')}</h3>
            <p className="text-slate-400 text-sm">
              Score: <span className="text-cyan-400 font-bold text-lg">{score}</span> / 100.
            </p>
          </div>

          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-extrabold rounded-2xl shadow-lg transition-all hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" /> {t('playAgain')}
          </button>
        </div>
      )}
    </div>
  );
}
