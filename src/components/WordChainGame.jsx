import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Gamepad2,
  Send,
  RotateCcw,
  Volume2,
  Sparkles,
  Trophy,
  Flame,
  AlertCircle,
  CheckCircle2,
  User,
  Bot,
  HelpCircle,
  X,
  BookOpen,
} from 'lucide-react';
import { OXFORD_3000 } from '../data/oxford3000';
import { playAudio } from '../services/audioService';
import { useApp } from '../context/AppContext';
import { getWordExample } from '../utils/exampleSentenceService';

/**
 * WordChainGame Component (لعبة السلسلة اللغوية)
 * Strict local Oxford 3000 dataset turn-based word chain game.
 */
export default function WordChainGame() {
  const { t, voicePreset } = useApp();

  // Game State
  const [chain, setChain] = useState([]);
  const [usedWords, setUsedWords] = useState(new Set());
  const [inputWord, setInputWord] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedWordModal, setSelectedWordModal] = useState(null);
  const [isBotThinking, setIsBotThinking] = useState(false);

  const logEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fast lookup map for Oxford 3000 dataset
  const oxfordMap = useMemo(() => {
    const map = new Map();
    OXFORD_3000.forEach((item) => {
      if (item && item.word) {
        // Clean word string for matching
        const clean = item.word.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (clean && !map.has(clean)) {
          map.set(clean, item);
        }
      }
    });
    return map;
  }, []);

  // Get last letter required for the next word
  const requiredNextLetter = useMemo(() => {
    if (chain.length === 0) return '';
    const lastPlayed = chain[chain.length - 1].word;
    const clean = lastPlayed.toLowerCase().replace(/[^a-z]/g, '');
    return clean ? clean.slice(-1) : '';
  }, [chain]);

  // Auto-scroll to bottom of chain log
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chain, isBotThinking]);

  // Clear error toast after 4 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleRestart = () => {
    setChain([]);
    setUsedWords(new Set());
    setInputWord('');
    setScore(0);
    setStreak(0);
    setErrorMessage('');
    setSelectedWordModal(null);
    setIsBotThinking(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleUserSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const rawInput = inputWord.trim();
    if (!rawInput) return;

    const cleanInput = rawInput.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanInput) {
      setErrorMessage('الرجاء إدخال كلمة إنجليزية صالحة.');
      return;
    }

    // Rule A: Is word in Oxford 3000 dataset?
    const foundWord = oxfordMap.get(cleanInput);
    if (!foundWord) {
      setErrorMessage(`الكلمة "${rawInput}" غير موجودة في قاموس أكسفورد الـ 3000! جرب كلمة أخرى.`);
      return;
    }

    // Rule B: Does it start with the required last letter?
    if (requiredNextLetter && !cleanInput.startsWith(requiredNextLetter)) {
      setErrorMessage(`يجب أن تبدأ الكلمة بحرف '${requiredNextLetter.toUpperCase()}'!`);
      return;
    }

    // Rule C: Has it been used already in current session?
    if (usedWords.has(cleanInput)) {
      setErrorMessage(`الكلمة "${foundWord.word}" تم استخدامها بالفعل في هذه الجولة!`);
      return;
    }

    // VALID USER WORD!
    const userEntry = {
      ...foundWord,
      playedBy: 'user',
      id: `user-${Date.now()}`,
    };

    const newUsed = new Set(usedWords);
    newUsed.add(cleanInput);

    const pointsEarned = 10 + cleanInput.length * 2;
    setScore((prev) => prev + pointsEarned);
    setStreak((prev) => prev + 1);
    setChain((prev) => [...prev, userEntry]);
    setUsedWords(newUsed);
    setInputWord('');

    // Play TTS audio for user word
    playAudio(foundWord.word, { presetId: voicePreset });

    // Bot Response Logic
    const lastLetterOfUserWord = cleanInput.slice(-1);
    setIsBotThinking(true);

    setTimeout(() => {
      // Find candidate words in Oxford 3000 starting with lastLetterOfUserWord and not used
      const candidates = OXFORD_3000.filter((w) => {
        const cClean = w.word.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cClean.startsWith(lastLetterOfUserWord) && !newUsed.has(cClean);
      });

      if (candidates.length > 0) {
        // Pick a random candidate word
        const botWordObj = candidates[Math.floor(Math.random() * candidates.length)];
        const botClean = botWordObj.word.toLowerCase().replace(/[^a-z0-9]/g, '');

        const botEntry = {
          ...botWordObj,
          playedBy: 'bot',
          id: `bot-${Date.now()}`,
        };

        newUsed.add(botClean);
        setUsedWords(newUsed);
        setChain((prev) => [...prev, botEntry]);
        setIsBotThinking(false);

        // Play TTS audio for bot word
        playAudio(botWordObj.word, { presetId: voicePreset });
      } else {
        setIsBotThinking(false);
        setErrorMessage(`🎉 مبروك! لقد هزمت الذكاء الاصطناعي! لم تتبق كلمات تبدأ بحرف '${lastLetterOfUserWord.toUpperCase()}'.`);
      }
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="card-theme-target p-6 sm:p-8 rounded-3xl border border-cyan-500/30 flex items-center justify-between shadow-2xl bg-[var(--bg-card)] text-[var(--text-main)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold shadow-md">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <span>لعبة السلسلة اللغوية</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-mono font-bold">
                Word Chain
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
              ادخل كلمة إنجليزية من قائمة أكسفورد تبدأ بالحرف الأخير للكلمة السابقة وتحدى البوت!
            </p>
          </div>
        </div>

        {/* Score, Streak & Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-center px-3.5 py-2 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider block">
              {t('score')}
            </span>
            <span className="text-xl font-black text-cyan-600 dark:text-cyan-400">{score}</span>
          </div>

          <div className="text-center px-3.5 py-2 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" /> {t('streak')}
            </span>
            <span className="text-xl font-black text-orange-500">{streak}</span>
          </div>

          <button
            onClick={handleRestart}
            className="p-3 rounded-2xl theme-btn-secondary text-xs font-black transition-all active:scale-95 shadow-sm"
            title="إعادة بداية الجولة"
          >
            <RotateCcw className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Error Toast Notification Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-950 dark:text-rose-200 flex items-center gap-3 font-black text-sm animate-pulse shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="p-1 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Chain Game Board */}
      <div className="card-theme-target p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 bg-[var(--bg-card)] text-[var(--text-main)] shadow-2xl min-h-[420px] flex flex-col justify-between">
        
        {/* Chain Bubbles Log Container */}
        <div className="flex-1 overflow-y-auto max-h-[380px] p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 space-y-4 no-scrollbar">
          {chain.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black">ابدأ السلسلة اللغوية الآن!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold max-w-sm mx-auto">
                اكتب أي كلمة إنجليزية تبدأ بها اللعبة (مثل: <code dir="ltr" className="ltr-isolate font-mono text-cyan-600 dark:text-cyan-400">apple</code>). ستقوم اللعبة باختيار كلمة تبدأ بحرف النهاية!
              </p>
            </div>
          ) : (
            chain.map((item, idx) => {
              const isUser = item.playedBy === 'user';
              const cleanWord = item.word.toLowerCase().replace(/[^a-z]/g, '');
              const lastChar = cleanWord.slice(-1).toUpperCase();

              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 transition-all ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-bold shadow-sm ${
                      isUser
                        ? 'bg-cyan-500 text-slate-950 border border-cyan-400'
                        : 'bg-purple-600 text-white border border-purple-400'
                    }`}
                  >
                    {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>

                  {/* Interactive Word Bubble */}
                  <div
                    onClick={() => setSelectedWordModal(item)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] shadow-md max-w-xs sm:max-w-md space-y-1.5 ${
                      isUser
                        ? 'bg-cyan-500/15 dark:bg-cyan-500/20 border-cyan-500/40 text-slate-950 dark:text-cyan-100 hover:border-cyan-500'
                        : 'bg-purple-500/15 dark:bg-purple-500/20 border-purple-500/40 text-slate-950 dark:text-purple-100 hover:border-purple-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span dir="ltr" className="ltr-isolate text-xl font-black tracking-tight">
                        {item.word}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(item.word, { presetId: voicePreset });
                        }}
                        className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 text-current transition-all"
                        title="Listen to word TTS"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs font-extrabold gap-2 border-t border-black/10 pt-1.5">
                      <span className="font-arabic">{item.arabic}</span>
                      <span dir="ltr" className="ltr-isolate text-[10px] px-1.5 py-0.5 rounded bg-black/10 font-mono">
                        {item.cefr} | {item.pos}
                      </span>
                    </div>

                    {/* Linking Letter Badge */}
                    <div className="text-[10px] font-black opacity-80 pt-1 flex items-center justify-between">
                      <span>{isUser ? 'أنت' : 'الذكاء الاصطناعي'}</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">
                        الحرف التالي: <strong className="text-amber-500 text-xs font-black">[{lastChar}]</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Bot Thinking Animation */}
          {isBotThinking && (
            <div className="flex items-center gap-3 flex-row">
              <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-900 dark:text-purple-300 text-xs font-black flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                <span>الذكاء الاصطناعي يفكر في كلمة مطابقة...</span>
              </div>
            </div>
          )}

          <div ref={logEndRef} />
        </div>

        {/* Required Next Letter Indicator Banner */}
        {requiredNextLetter && (
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between font-black text-xs text-cyan-950 dark:text-cyan-300">
            <span>دورك الآن! اكتب كلمة تبدأ بالحرف:</span>
            <span dir="ltr" className="ltr-isolate font-black text-base px-3 py-1 rounded-xl bg-amber-500 text-slate-950 shadow-sm font-mono animate-bounce">
              {requiredNextLetter.toUpperCase()}
            </span>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleUserSubmit} className="flex items-center gap-2 pt-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              dir="ltr"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder={
                requiredNextLetter
                  ? `Write an English word starting with '${requiredNextLetter.toUpperCase()}'...`
                  : 'Write any English word from Oxford 3000 to start...'
              }
              className="ltr-isolate w-full px-4 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-black text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!inputWord.trim() || isBotThinking}
            className="px-6 py-3.5 rounded-2xl theme-btn-primary text-slate-950 font-black text-sm transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          >
            <span>إرسال</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Word Details Modal Tooltip */}
      {selectedWordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card-theme-target p-6 sm:p-8 rounded-3xl border border-cyan-500/40 max-w-md w-full space-y-5 bg-[var(--bg-card)] text-[var(--text-main)] shadow-2xl">
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 dir="ltr" className="ltr-isolate text-3xl font-black tracking-tight">
                  {selectedWordModal.word}
                </h3>
                <p className="text-cyan-600 dark:text-cyan-400 font-mono text-sm font-bold ltr-isolate" dir="ltr">
                  /{selectedWordModal.ipa}/ ({selectedWordModal.pos})
                </p>
              </div>

              <button
                onClick={() => setSelectedWordModal(null)}
                className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Arabic Translation & Details */}
            <div dir="rtl" className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 font-arabic space-y-1 text-right">
              <span className="text-xs font-black text-amber-700 dark:text-amber-400 block">الترجمة والتعريف العربي:</span>
              <p className="text-xl font-black text-amber-950 dark:text-amber-300">
                {selectedWordModal.arabic}
              </p>
            </div>

            {/* Example Sentence */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 text-xs space-y-1 font-bold">
              <span className="text-cyan-400 font-black block">Example Sentence:</span>
              <p className="ltr-isolate text-sm text-white leading-relaxed" dir="ltr">
                "{getWordExample(selectedWordModal)}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => playAudio(selectedWordModal.word, { presetId: voicePreset })}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Volume2 className="w-4 h-4" /> استمع للنطق الصوتي
              </button>

              <button
                onClick={() => setSelectedWordModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-black hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
