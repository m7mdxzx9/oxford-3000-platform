import React, { useState } from 'react';
import { Award, Volume2, RotateCcw, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { oxford3000Data } from '../../data/oxford3000Data';
import { playWordAudio } from '../../services/audioService';
import { playSuccessChime } from '../../services/soundEffects';

export default function QuizDuelTab({
  activeUser,
  voicePreset,
  audioSpeed,
  updateSiblingStat,
  addNotification,
}) {
  const [quizTurn, setQuizTurn] = useState(0);
  const [quizPlayerTurn, setQuizPlayerTurn] = useState('محمد');
  const [quizScores, setQuizScores] = useState({ محمد: 0, ريوف: 0 });
  const [quizGameOver, setQuizGameOver] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Generate 6 quick questions
  const [quizQuestions] = useState(() => {
    const questions = [];
    const pool = oxford3000Data.slice(0, 150);

    for (let i = 0; i < 6; i++) {
      const correctIdx = Math.floor(Math.random() * pool.length);
      const targetWord = pool[correctIdx];

      const distractors = pool
        .filter((w) => w.id !== targetWord.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const options = [targetWord, ...distractors].sort(() => 0.5 - Math.random());

      questions.push({
        target: targetWord,
        options,
      });
    }
    return questions;
  });

  const currentQ = quizQuestions[quizTurn];

  const handleSelectAnswer = (option) => {
    if (quizAnswered || quizGameOver) return;

    setSelectedQuizOption(option);
    setQuizAnswered(true);

    const isCorrect = option.id === currentQ.target.id;

    if (isCorrect) {
      setQuizScores((s) => ({ ...s, [quizPlayerTurn]: s[quizPlayerTurn] + 10 }));
      try {
        playSuccessChime();
      } catch (e) {}
      addNotification(`إجابة صحيحة يا ${quizPlayerTurn}! (+10 نقاط)`, 'success');
    } else {
      addNotification(`إجابة خاطئة! الإجابة الصحيحة هي: ${currentQ.target.arabic}`, 'error');
    }

    // Advance turn after 1.2 seconds
    setTimeout(() => {
      if (quizTurn + 1 >= quizQuestions.length) {
        setQuizGameOver(true);
        const winnerName =
          quizScores['محمد'] > quizScores['ريوف']
            ? 'محمد'
            : quizScores['ريوف'] > quizScores['محمد']
            ? 'ريوف'
            : 'تعادل';

        if (winnerName !== 'تعادل') {
          updateSiblingStat(winnerName, 'duelsWon', 1);
          updateSiblingStat(winnerName, 'totalScore', 40);
        }
      } else {
        setQuizTurn((t) => t + 1);
        setQuizPlayerTurn((p) => (p === 'محمد' ? 'ريوف' : 'محمد'));
        setSelectedQuizOption(null);
        setQuizAnswered(false);
      }
    }, 1200);
  };

  const handleRestart = () => {
    setQuizTurn(0);
    setQuizPlayerTurn('محمد');
    setQuizScores({ محمد: 0, ريوف: 0 });
    setQuizGameOver(false);
    setSelectedQuizOption(null);
    setQuizAnswered(false);
  };

  return (
    <div className="space-y-6">
      {/* Quiz Duel Container Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border shadow-xl card-theme-target space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl theme-btn-primary shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black font-arabic">
                مبارزة الأسئلة السريعة (Quiz Duel 1v1)
              </h3>
              <p className="text-xs opacity-75 font-arabic">
                تحدي ثنائي بالتناوب لاختبار معاني مفردات أكسفورد 3000
              </p>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="px-3.5 py-2 rounded-2xl theme-btn-secondary border text-xs font-bold font-arabic flex items-center gap-1.5 hover:brightness-110 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة المبارزة</span>
          </button>
        </div>

        {/* Player Score Banners */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`p-4 rounded-2xl border text-center transition-all ${
              quizPlayerTurn === 'محمد' && !quizGameOver
                ? 'bg-cyan-500/10 border-cyan-500 shadow-md scale-[1.02]'
                : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70'
            }`}
          >
            <div className="text-xs font-black font-arabic text-cyan-400 mb-1">محمد</div>
            <div className="text-2xl font-black font-mono">{quizScores['محمد']} XP</div>
          </div>

          <div
            className={`p-4 rounded-2xl border text-center transition-all ${
              quizPlayerTurn === 'ريوف' && !quizGameOver
                ? 'bg-rose-500/10 border-rose-500 shadow-md scale-[1.02]'
                : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70'
            }`}
          >
            <div className="text-xs font-black font-arabic text-rose-400 mb-1">ريوف</div>
            <div className="text-2xl font-black font-mono">{quizScores['ريوف']} XP</div>
          </div>
        </div>

        {!quizGameOver && currentQ ? (
          <div className="space-y-6">
            {/* Question Header */}
            <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border text-center space-y-3">
              <div className="flex items-center justify-between text-xs font-bold opacity-75 font-arabic">
                <span>
                  السؤال {quizTurn + 1} من {quizQuestions.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold">
                  دور اللاعب: {quizPlayerTurn}
                </span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl sm:text-4xl font-black font-mono tracking-tight ltr-token">
                  {currentQ.target.word}
                </h2>
                <button
                  onClick={() => playWordAudio(currentQ.target.word, { preset: voicePreset, speed: audioSpeed })}
                  className="p-2 rounded-full theme-btn-secondary hover:scale-105 active:scale-95 cursor-pointer"
                  title="استمع للكلمة"
                >
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                </button>
              </div>

              <p className="text-xs font-mono text-cyan-400">{currentQ.target.ipa}</p>
              <p className="text-xs font-arabic opacity-70">ما هو المعنى الصحيح لهذه المفردة باللغة العربية؟</p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedQuizOption?.id === opt.id;
                const isCorrect = opt.id === currentQ.target.id;

                let optClass = 'theme-btn-secondary border-black/10 dark:border-white/10 hover:border-cyan-500/50';
                if (quizAnswered) {
                  if (isCorrect) {
                    optClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    optClass = 'bg-rose-500/20 text-rose-400 border-rose-500';
                  } else {
                    optClass = 'opacity-40';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(opt)}
                    disabled={quizAnswered}
                    className={`p-4 rounded-2xl border font-arabic font-bold text-sm sm:text-base text-start transition-all flex items-center justify-between gap-2 cursor-pointer ${optClass}`}
                  >
                    <span>{opt.arabic}</span>
                    {quizAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {quizAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
            <h4 className="text-2xl font-black font-arabic text-emerald-400">
              انتهت المبارزة! 🏆
            </h4>
            <p className="text-sm font-arabic font-bold">
              النتيجة النهائية: محمد ({quizScores['محمد']} XP) • ريوف ({quizScores['ريوف']} XP)
            </p>
            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-2xl theme-btn-primary font-black font-arabic text-sm shadow-md cursor-pointer"
            >
              لعب جولة أخرى
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
