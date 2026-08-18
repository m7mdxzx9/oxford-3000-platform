import React, { useState, useEffect, useRef } from 'react';
import { Gamepad2, Volume2, RotateCcw, Clock, CheckCircle2, Flame, Award, Trophy } from 'lucide-react';
import { oxford3000Data } from '../../data/oxford3000Data';
import { playWordAudio } from '../../services/audioService';
import { playSuccessChime } from '../../services/soundEffects';

export default function WordChainDuelTab({
  activeUser,
  voicePreset,
  audioSpeed,
  updateSiblingStat,
  addNotification,
}) {
  const [chainHistory, setChainHistory] = useState([
    { word: 'challenge', arabic: 'تحدي', by: 'النظام', cefr: 'B1' },
  ]);
  const [currentTurn, setCurrentTurn] = useState('محمد');
  const [inputWord, setInputWord] = useState('');
  const [turnTimer, setTurnTimer] = useState(20);
  const [chainGameOver, setChainGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [playerScores, setPlayerScores] = useState({ محمد: 0, ريوف: 0 });

  const timerRef = useRef(null);

  const lastWordObj = chainHistory[chainHistory.length - 1];
  const requiredChar = lastWordObj?.word ? lastWordObj.word.slice(-1).toLowerCase() : 'e';

  // Timer Tick
  useEffect(() => {
    if (chainGameOver) return;

    timerRef.current = setInterval(() => {
      setTurnTimer((prev) => {
        if (prev <= 1) {
          // Time out - Switch turn or forfeit
          const nextPlayer = currentTurn === 'محمد' ? 'ريوف' : 'محمد';
          addNotification(`انتهى وقت ${currentTurn}! تنتقل النقطة إلى ${nextPlayer}`, 'info');
          setPlayerScores((s) => ({ ...s, [nextPlayer]: s[nextPlayer] + 1 }));
          setCurrentTurn(nextPlayer);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentTurn, chainGameOver, addNotification]);

  const handleSubmitWord = (e) => {
    e.preventDefault();
    const clean = inputWord.trim().toLowerCase();
    if (!clean) return;

    if (!clean.startsWith(requiredChar)) {
      addNotification(`خطأ: الكلمة يجب أن تبدأ بحرف "${requiredChar.toUpperCase()}"!`, 'error');
      return;
    }

    if (chainHistory.some((item) => item.word.toLowerCase() === clean)) {
      addNotification(`تم استخدام كلمة "${clean}" مسبقاً في هذه الجولة!`, 'error');
      return;
    }

    // Check if word exists in Oxford 3000
    const foundWord = oxford3000Data.find((w) => w.word.toLowerCase() === clean);
    if (!foundWord) {
      addNotification(`كلمة "${clean}" ليست في معجم أكسفورد 3000 المعتمد!`, 'error');
      return;
    }

    // Word Valid! Add to chain
    const newEntry = {
      word: foundWord.word,
      arabic: foundWord.arabic,
      by: currentTurn,
      cefr: foundWord.cefr,
    };

    setChainHistory((prev) => [...prev, newEntry]);
    setPlayerScores((prev) => ({
      ...prev,
      [currentTurn]: prev[currentTurn] + 10,
    }));
    setInputWord('');
    setTurnTimer(20);

    try {
      playSuccessChime();
    } catch (e) {}

    // Check win condition (e.g. 50 points)
    if (playerScores[currentTurn] + 10 >= 50) {
      setChainGameOver(true);
      setWinner(currentTurn);
      updateSiblingStat(currentTurn, 'chainWins', 1);
      updateSiblingStat(currentTurn, 'totalScore', 50);
      addNotification(`🎉 مبروك! فاز ${currentTurn} في تحدي سلسلة الكلمات!`, 'success');
      return;
    }

    // Switch turn
    setCurrentTurn((prev) => (prev === 'محمد' ? 'ريوف' : 'محمد'));
  };

  const handleRestartGame = () => {
    setChainHistory([{ word: 'journey', arabic: 'رحلة', by: 'النظام', cefr: 'A2' }]);
    setCurrentTurn('محمد');
    setInputWord('');
    setTurnTimer(20);
    setChainGameOver(false);
    setWinner(null);
    setPlayerScores({ محمد: 0, ريوف: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Game Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border shadow-xl card-theme-target space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl theme-btn-primary shadow-md">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black font-arabic">
                مبارزة سلسلة الكلمات (1v1 PvP Word Chain)
              </h3>
              <p className="text-xs opacity-75 font-arabic">
                اكتب كلمة تبدأ بآخر حرف من الكلمة السابقة من قائمة Oxford 3000
              </p>
            </div>
          </div>

          <button
            onClick={handleRestartGame}
            className="px-3.5 py-2 rounded-2xl theme-btn-secondary border text-xs font-bold font-arabic flex items-center gap-1.5 hover:brightness-110 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة التحدي</span>
          </button>
        </div>

        {/* Score & Turn Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Player 1: Muhammad */}
          <div
            className={`p-4 rounded-2xl border text-center transition-all ${
              currentTurn === 'محمد'
                ? 'bg-cyan-500/10 border-cyan-500 shadow-md scale-[1.02]'
                : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70'
            }`}
          >
            <div className="text-xs font-black font-arabic text-cyan-400 mb-1">محمد</div>
            <div className="text-2xl font-black font-mono">{playerScores['محمد']} XP</div>
            {currentTurn === 'محمد' && !chainGameOver && (
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500 text-white font-bold animate-pulse">
                دورك الآن!
              </span>
            )}
          </div>

          {/* Turn Timer */}
          <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-xs font-bold opacity-75 font-arabic mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>الوقت المتبقي:</span>
            </div>
            <div
              className={`text-2xl font-black font-mono ${
                turnTimer <= 5 ? 'text-rose-500 animate-bounce' : 'text-amber-400'
              }`}
            >
              {turnTimer}s
            </div>
          </div>

          {/* Player 2: Ryouf */}
          <div
            className={`p-4 rounded-2xl border text-center transition-all ${
              currentTurn === 'ريوف'
                ? 'bg-rose-500/10 border-rose-500 shadow-md scale-[1.02]'
                : 'bg-black/5 dark:bg-white/5 border-transparent opacity-70'
            }`}
          >
            <div className="text-xs font-black font-arabic text-rose-400 mb-1">ريوف</div>
            <div className="text-2xl font-black font-mono">{playerScores['ريوف']} XP</div>
            {currentTurn === 'ريوف' && !chainGameOver && (
              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                دورك الآن!
              </span>
            )}
          </div>
        </div>

        {/* Required Letter Display */}
        {!chainGameOver ? (
          <div className="p-6 rounded-3xl bg-black/5 dark:bg-white/5 border text-center space-y-3">
            <span className="text-xs font-black opacity-75 font-arabic">الحرف المطلوب تبدأ به الكلمة:</span>
            <div className="text-5xl font-black font-mono text-cyan-400 uppercase tracking-widest animate-pulse">
              {requiredChar}
            </div>
            <p className="text-xs opacity-70 font-arabic">
              آخر كلمة كانت: <span className="font-mono font-bold">{lastWordObj?.word}</span> (
              {lastWordObj?.arabic})
            </p>

            {/* Word Input Form */}
            <form onSubmit={handleSubmitWord} className="max-w-md mx-auto flex gap-2 pt-2">
              <input
                type="text"
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value)}
                placeholder={`اكتب كلمة تبدأ بـ ${requiredChar.toUpperCase()}...`}
                className="flex-1 px-4 py-3 rounded-2xl glass-input text-sm font-bold font-mono tracking-wide focus:outline-none border"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl theme-btn-primary font-black font-arabic text-sm shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                إرسال
              </button>
            </form>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
            <h4 className="text-2xl font-black font-arabic text-emerald-400">
              مبروك للفائز: {winner}! 🏆
            </h4>
            <p className="text-xs font-arabic opacity-85">
              تم تسجيل الفوز وإضافة 50 نقطة XP في لوحة الصدارة المشتركة!
            </p>
            <button
              onClick={handleRestartGame}
              className="px-6 py-3 rounded-2xl theme-btn-primary font-black font-arabic text-sm shadow-md cursor-pointer"
            >
              بدء جولة جديدة
            </button>
          </div>
        )}
      </div>

      {/* Chain History */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border shadow-xl card-theme-target space-y-4">
        <h4 className="text-sm font-black font-arabic flex items-center gap-2">
          <span>سلسلة الكلمات المكتملة في الجولة ({chainHistory.length})</span>
        </h4>

        <div className="flex flex-wrap gap-2.5">
          {chainHistory.map((item, idx) => (
            <div
              key={idx}
              className="px-3.5 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border flex items-center gap-2"
            >
              <button
                onClick={() => playWordAudio(item.word, { preset: voicePreset, speed: audioSpeed })}
                className="opacity-70 hover:opacity-100 cursor-pointer"
                title="استمع"
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              </button>
              <span className="font-mono font-bold text-sm ltr-token">{item.word}</span>
              <span className="text-[11px] font-arabic opacity-75">({item.arabic})</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-bold">
                {item.by}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
