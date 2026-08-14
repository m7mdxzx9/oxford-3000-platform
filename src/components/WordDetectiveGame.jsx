import React, { useState, useMemo } from 'react';
import { HelpCircle, Search, Sparkles, Volume2, Award, RotateCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { OXFORD_3000 } from '../data/oxford3000';
import { playAudio } from '../services/audioService';
import { useApp } from '../context/AppContext';
import { getWordExample } from '../utils/exampleSentenceService';

export default function WordDetectiveGame() {
  const { voicePreset, addNotification, addXp } = useApp();

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [casesSolved, setCasesSolved] = useState(0);
  const [hintsUnlocked, setHintsUnlocked] = useState(2); // Start with 2 hints
  const [guessInput, setGuessInput] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Pick random case target word
  const [currentCase, setCurrentCase] = useState(() => {
    const item = OXFORD_3000[Math.floor(Math.random() * OXFORD_3000.length)];
    return {
      id: `case-${Date.now()}`,
      wordObj: item,
      solved: false,
    };
  });

  const targetWordClean = useMemo(() => {
    return currentCase.wordObj.word.toLowerCase().replace(/[^a-z]/g, '');
  }, [currentCase]);

  const exampleSentence = useMemo(() => {
    const ex = getWordExample(currentCase.wordObj);
    return ex.replace(new RegExp(currentCase.wordObj.word, 'gi'), '███████');
  }, [currentCase]);

  const handleUnlockMoreHints = () => {
    if (hintsUnlocked < 4) {
      setHintsUnlocked((prev) => prev + 1);
      addNotification('تم فتح تلميح إضافي لفك شفرة الكلمة! 💡', 'info');
    }
  };

  const handleGuessSubmit = (e) => {
    if (e) e.preventDefault();
    if (currentCase.solved) return;

    const cleanInput = guessInput.trim().toLowerCase().replace(/[^a-z]/g, '');
    if (!cleanInput) return;

    if (cleanInput === targetWordClean) {
      // Solved!
      const earned = Math.max(20, 100 - (hintsUnlocked - 2) * 20);
      setScore((prev) => prev + earned);
      setStreak((prev) => prev + 1);
      setCasesSolved((prev) => prev + 1);
      setCurrentCase((prev) => ({ ...prev, solved: true }));
      setFeedback({ type: 'success', text: `🎉 استنتاج عبقري! الكلمة السرية هي "${currentCase.wordObj.word}"` });
      playAudio(currentCase.wordObj.word, { presetId: voicePreset });
    } else {
      setStreak(0);
      setFeedback({ type: 'error', text: `❌ استنتاج غير دقيق للكلمة "${guessInput.trim()}". حاول مجدداً!` });
    }
    setGuessInput('');
  };

  const handleNextCase = () => {
    const newItem = OXFORD_3000[Math.floor(Math.random() * OXFORD_3000.length)];
    setCurrentCase({
      id: `case-${Date.now()}`,
      wordObj: newItem,
      solved: false,
    });
    setHintsUnlocked(2);
    setGuessInput('');
    setFeedback(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="card-theme-target p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 theme-btn-primary rounded-2xl shadow-md">
              <Search className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                <span>قسم التحري اللغوي 🕵️‍♂️</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full theme-btn-primary font-mono font-bold">
                  Word Detective
                </span>
              </h2>
              <p className="text-xs sm:text-sm font-bold opacity-80 mt-0.5">
                فك شفرات قضايا المفردات الغامضة باستخدام الأدلة والتلميحات الذكية!
              </p>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 rounded-2xl theme-btn-secondary text-xs font-black flex items-center gap-1.5 shadow-sm border">
              <Award className="w-4 h-4 text-amber-500" />
              <span>النقاط: <strong className="text-amber-500">{score}</strong></span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl theme-btn-secondary text-xs font-black flex items-center gap-1.5 shadow-sm border">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span>السلسلة: <strong className="text-cyan-500">{streak} 🔥</strong></span>
            </div>
          </div>
        </div>

        {/* Case File Board */}
        <div className="p-5 sm:p-7 rounded-3xl border bg-black/5 space-y-6 shadow-md">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span className="font-mono text-xs font-black opacity-80">ملف القضية: #{currentCase.id.slice(-6).toUpperCase()}</span>
            </div>
            <span className="text-xs px-3 py-1 rounded-full theme-btn-primary font-mono font-black">
              مستوى المفردة: {currentCase.wordObj.cefr}
            </span>
          </div>

          {/* Clues Container */}
          <div className="space-y-4">
            <h4 className="text-xs font-black opacity-80 flex items-center gap-1.5">
              <span>🔎 أدلة فك الشفرة المتاحة ({hintsUnlocked} من 4 أدلة):</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Hint 1: POS & Length */}
              <div className="p-4 rounded-2xl border bg-[var(--bg-card)] space-y-1 shadow-sm">
                <span className="text-[11px] font-black text-cyan-600 dark:text-cyan-400 block">دليل 1: الإعراب والتركيب</span>
                <p className="text-sm font-black">
                  نوع الكلمة: <strong className="font-mono">{currentCase.wordObj.pos}</strong> | الطول: <strong className="text-amber-500">{currentCase.wordObj.word.length} حروف</strong>
                </p>
              </div>

              {/* Hint 2: Arabic Meaning */}
              <div className="p-4 rounded-2xl border bg-[var(--bg-card)] space-y-1 shadow-sm">
                <span className="text-[11px] font-black text-cyan-600 dark:text-cyan-400 block">دليل 2: المعنى باللغة العربية</span>
                <p className="text-sm font-black font-arabic text-amber-700 dark:text-amber-300">
                  "{currentCase.wordObj.arabic}"
                </p>
              </div>

              {/* Hint 3: Audio Pronunciation */}
              {hintsUnlocked >= 3 ? (
                <div className="p-4 rounded-2xl border bg-[var(--bg-card)] space-y-1 shadow-sm">
                  <span className="text-[11px] font-black text-cyan-600 dark:text-cyan-400 block">دليل 3: الصوت والنطق الإنجليزي</span>
                  <button
                    onClick={() => playAudio(currentCase.wordObj.word, { presetId: voicePreset })}
                    className="px-3 py-1.5 rounded-xl theme-btn-primary text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>استمع إلى نطق الكلمة السرية</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed flex items-center justify-between text-xs opacity-60 font-bold">
                  <span>🔒 دليل 3: نطق الصوت مغلق</span>
                </div>
              )}

              {/* Hint 4: Sentence Context */}
              {hintsUnlocked >= 4 ? (
                <div className="p-4 rounded-2xl border bg-[var(--bg-card)] space-y-1 shadow-sm">
                  <span className="text-[11px] font-black text-cyan-600 dark:text-cyan-400 block">دليل 4: السياق في الجملة</span>
                  <p dir="ltr" className="ltr-isolate text-xs font-mono font-bold leading-relaxed">
                    "{exampleSentence}"
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed flex items-center justify-between text-xs opacity-60 font-bold">
                  <span>🔒 دليل 4: السياق مغلق</span>
                </div>
              )}
            </div>

            {hintsUnlocked < 4 && !currentCase.solved && (
              <div className="text-center pt-2">
                <button
                  onClick={handleUnlockMoreHints}
                  className="px-4 py-2 rounded-xl theme-btn-secondary text-xs font-black transition-all shadow-sm"
                >
                  💡 فتح دليل إضافي (تلميح جديد)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-sm font-black text-center shadow-md transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Guess Form or Next Case Action */}
        {!currentCase.solved ? (
          <form onSubmit={handleGuessSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              dir="ltr"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder="اكتب اسم الكلمة السرية بالإنجليزية..."
              className="ltr-isolate flex-1 p-3.5 sm:p-4 rounded-2xl glass-input font-black text-sm sm:text-base"
            />
            <button
              type="submit"
              className="px-8 py-3.5 sm:py-4 rounded-2xl theme-btn-primary font-black text-sm shadow-xl active:scale-95 flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-5 h-5" />
              <span>إرسال الاستنتاج</span>
            </button>
          </form>
        ) : (
          <div className="text-center pt-2">
            <button
              onClick={handleNextCase}
              className="px-8 py-3.5 sm:py-4 rounded-2xl theme-btn-primary font-black text-sm sm:text-base shadow-2xl active:scale-95 inline-flex items-center gap-2"
            >
              <span>الانتقال للقضية التالية 🕵️‍♂️</span>
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
