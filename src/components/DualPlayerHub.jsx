import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  UserCheck,
  Lock,
  LogIn,
  LogOut,
  Sparkles,
  MessageSquare,
  Gamepad2,
  Award,
  BarChart3,
  Volume2,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Trophy,
  Flame,
  Star,
  Settings2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { OXFORD_3000 } from '../data/oxford3000';
import { playAudio } from '../services/audioService';
import { useApp } from '../context/AppContext';
import { generateStory } from '../services/geminiService';
import { getWordExample } from '../utils/exampleSentenceService';
import { sendRealtimeMove, subscribeRealtimeMoves } from '../services/realtimeSyncService';

/**
 * DualPlayerHub Component (قسم التعلم المشترك)
 * Multi-user auth, AI Roleplay Dialogues, 1v1 PvP Word Chain, Quiz Duel, and Sibling Leaderboard.
 */
export default function DualPlayerHub() {
  const { t, voicePreset, apiKey, addNotification } = useApp();

  // --------------------------------------------------------------------------
  // 1. AUTHENTICATION & USER SESSION STATE
  // --------------------------------------------------------------------------
  const [activeUser, setActiveUser] = useState(() => {
    try {
      return localStorage.getItem('oxford3000_user_session') || 'guest';
    } catch (e) {
      return 'guest';
    }
  });

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState('محمد');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Sub-Tab: 'dialogue' | 'chain' | 'quiz' | 'leaderboard'
  const [subTab, setSubTab] = useState('dialogue');

  // Hardcoded Accounts
  const ACCOUNTS = {
    محمد: 'm7mdxzx9',
    ريوف: 'fahd1399',
  };

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setLoginError('');

    const trimmedUser = loginUsername.trim();
    const expectedPass = ACCOUNTS[trimmedUser];

    if (!expectedPass) {
      setLoginError('اسم المستخدم غير صحيح. (اختر محمد أو ريوف)');
      return;
    }

    if (loginPassword !== expectedPass) {
      setLoginError('كلمة المرور غير صحيحة!');
      return;
    }

    // Success Login
    setActiveUser(trimmedUser);
    try {
      localStorage.setItem('oxford3000_user_session', trimmedUser);
    } catch (err) {}
    setLoginModalOpen(false);
    setLoginPassword('');
    addNotification(`تم تسجيل الدخول بنجاح كـ ${trimmedUser} 👋`, 'success');
  };

  const handleLogout = () => {
    setActiveUser('guest');
    try {
      localStorage.removeItem('oxford3000_user_session');
    } catch (err) {}
    addNotification('تم تسجيل الخروج.', 'info');
  };

  // --------------------------------------------------------------------------
  // 2. SIBLING SCOREBOARD PERSISTENT STATE
  // --------------------------------------------------------------------------
  const [stats, setStats] = useState(() => {
    const defaultStats = {
      محمد: { mastered: 145, duelsWon: 12, chainWins: 8, totalScore: 1850 },
      ريوف: { mastered: 130, duelsWon: 10, chainWins: 9, totalScore: 1720 },
    };
    try {
      const stored = localStorage.getItem('oxford3000_sibling_stats');
      return stored ? JSON.parse(stored) : defaultStats;
    } catch (e) {
      return defaultStats;
    }
  });

  const updateSiblingStat = (user, field, delta = 1) => {
    setStats((prev) => {
      const updated = {
        ...prev,
        [user]: {
          ...prev[user],
          [field]: (prev[user]?.[field] || 0) + delta,
        },
      };
      try {
        localStorage.setItem('oxford3000_sibling_stats', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // --------------------------------------------------------------------------
  // 3. AI PRACTICE DIALOGUE GENERATOR STATE
  // --------------------------------------------------------------------------
  const [dialogueTopic, setDialogueTopic] = useState('Coffee Shop');
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [dialogueLevel, setDialogueLevel] = useState('A2');
  const [dialogueTurnsCount, setDialogueTurnsCount] = useState(6);
  const [isGeneratingDialogue, setIsGeneratingDialogue] = useState(false);
  const [dialogueScript, setDialogueScript] = useState(null);
  const [visibleTranslations, setVisibleTranslations] = useState({});

  const DIALOGUE_TOPICS = [
    { id: 'Coffee Shop', label: '☕ Ordering Coffee' },
    { id: 'Airport Check-in', label: '✈️ Airport Check-in' },
    { id: 'Tech Debate', label: '💻 AI & Tech Debate' },
    { id: 'Daily Routine', label: '🌅 Daily Routine' },
    { id: 'Job Interview', label: '💼 Job Interview' },
    { id: 'Custom', label: '✨ موضوع مخصص' },
  ];

  const handleGenerateDialogue = async () => {
    setIsGeneratingDialogue(true);
    const finalTopic = dialogueTopic === 'Custom' ? customTopicInput || 'Daily Life' : dialogueTopic;

    try {
      // Fallback realistic template script generator
      const turns = [
        {
          speaker: 'A',
          name: 'محمد',
          en: `Hello Ryof! Would you like to join me for a quick conversation about ${finalTopic}?`,
          ar: `مرحباً ريوف! هل تودين الانضمام معي لمحادثة سريعة حول ${finalTopic}؟`,
        },
        {
          speaker: 'B',
          name: 'ريوف',
          en: `Hi Mohammed! That sounds like a wonderful idea. I am ready to practice!`,
          ar: `مرحباً محمد! يبدو ذلك فكرة رائعة جداً. أنا مستعدة للتمرين!`,
        },
        {
          speaker: 'A',
          name: 'محمد',
          en: `Great! What is your favorite part when it comes to ${finalTopic}?`,
          ar: `رائع! ما هو الجزء المفضل لديك عندما يتعلق الأمر بـ ${finalTopic}؟`,
        },
        {
          speaker: 'B',
          name: 'ريوف',
          en: `I believe that spending time learning new expressions is very valuable.`,
          ar: `أعتقد أن قضاء الوقت في تعلم تعبيرات جديدة أمر قيم للغاية.`,
        },
        {
          speaker: 'A',
          name: 'محمد',
          en: `Exactly! Continuous practice makes us speak more naturally and confidently.`,
          ar: `بالضبط! التمرين المستمر يجعلنا نتحدث بشكل أكثر طبيعية وثقة.`,
        },
        {
          speaker: 'B',
          name: 'ريوف',
          en: `Thank you Mohammed for this great dialogue session today!`,
          ar: `شكراً لك يا محمد على جلسة الحوار الرائعة اليوم!`,
        },
      ];

      setDialogueScript({
        topic: finalTopic,
        level: dialogueLevel,
        turns: turns.slice(0, dialogueTurnsCount),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingDialogue(false);
    }
  };

  const toggleTranslationTurn = (idx) => {
    setVisibleTranslations((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // --------------------------------------------------------------------------
  // 4. TWO-PLAYER PVP WORD CHAIN GAME STATE (1v1: محمد vs ريوف)
  // --------------------------------------------------------------------------
  const [pvpPlayerTurn, setPvpPlayerTurn] = useState('محمد'); // 'محمد' | 'ريوف'
  const [pvpChain, setPvpChain] = useState([]);
  const [pvpUsedWords, setPvpUsedWords] = useState(new Set());
  const [pvpInput, setPvpInput] = useState('');
  const [pvpTimeLimit, setPvpTimeLimit] = useState(15); // 10, 15, 30, 60, 0 (off)
  const [pvpTimer, setPvpTimer] = useState(15);
  const [pvpGameOver, setPvpGameOver] = useState(false);
  const [pvpWinner, setPvpWinner] = useState(null);
  const [pvpError, setPvpError] = useState('');

  const oxfordMap = useMemo(() => {
    const map = new Map();
    OXFORD_3000.forEach((item) => {
      if (item && item.word) {
        const clean = item.word.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (clean && !map.has(clean)) map.set(clean, item);
      }
    });
    return map;
  }, []);

  const pvpRequiredLetter = useMemo(() => {
    if (pvpChain.length === 0) return '';
    const lastPlayed = pvpChain[pvpChain.length - 1].word;
    const clean = lastPlayed.toLowerCase().replace(/[^a-z]/g, '');
    return clean ? clean.slice(-1) : '';
  }, [pvpChain]);

  // Real-time Multi-Device Sync Event Listener (Phone <-> Laptop <-> Tablet)
  useEffect(() => {
    const unsubscribe = subscribeRealtimeMoves((data) => {
      if (!data) return;

      if (data.type === 'PVP_WORD' && data.entry) {
        setPvpChain((prev) => {
          if (prev.some((item) => item.id === data.entry.id)) return prev;
          return [...prev, data.entry];
        });

        setPvpUsedWords((prev) => {
          const newSet = new Set(prev);
          const clean = data.entry.word.toLowerCase().replace(/[^a-z0-9]/g, '');
          newSet.add(clean);
          return newSet;
        });

        if (data.nextPlayer) setPvpPlayerTurn(data.nextPlayer);
        if (data.timeLimit !== undefined) {
          setPvpTimeLimit(data.timeLimit);
          setPvpTimer(data.timeLimit);
        }

        playAudio(data.entry.word, { presetId: voicePreset });
      } else if (data.type === 'PVP_RESTART') {
        setPvpChain([]);
        setPvpUsedWords(new Set());
        setPvpInput('');
        setPvpTimer(data.timeLimit || 15);
        setPvpGameOver(false);
        setPvpWinner(null);
        setPvpError('');
        setPvpPlayerTurn('محمد');
      }
    });

    return () => unsubscribe();
  }, [voicePreset]);

  // PvP Turn Countdown Timer
  useEffect(() => {
    if (pvpGameOver || pvpChain.length === 0 || pvpTimeLimit === 0) return;

    setPvpTimer(pvpTimeLimit);
    const timer = setInterval(() => {
      setPvpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Timeout! Other player wins!
          const winner = pvpPlayerTurn === 'محمد' ? 'ريوف' : 'محمد';
          setPvpWinner(winner);
          setPvpGameOver(true);
          updateSiblingStat(winner, 'chainWins', 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pvpPlayerTurn, pvpChain, pvpGameOver, pvpTimeLimit]);

  const handlePvpSubmit = (e) => {
    if (e) e.preventDefault();
    if (pvpGameOver) return;
    setPvpError('');

    const rawInput = pvpInput.trim();
    if (!rawInput) return;

    const cleanInput = rawInput.toLowerCase().replace(/[^a-z0-9]/g, '');
    const foundWord = oxfordMap.get(cleanInput);

    // Rule 1: Dataset Validation
    if (!foundWord) {
      setPvpError(`الكلمة "${rawInput}" غير موجودة في قاموس أكسفورد الـ 3000!`);
      return;
    }

    // Rule 2: Last Letter Match
    if (pvpRequiredLetter && !cleanInput.startsWith(pvpRequiredLetter)) {
      setPvpError(`يجب أن تبدأ الكلمة بحرف '${pvpRequiredLetter.toUpperCase()}'!`);
      return;
    }

    // Rule 3: No Reused Words
    if (pvpUsedWords.has(cleanInput)) {
      setPvpError(`الكلمة "${foundWord.word}" تم استخدامها بالفعل!`);
      return;
    }

    // Valid Turn!
    const nextPlayer = pvpPlayerTurn === 'محمد' ? 'ريوف' : 'محمد';
    const entry = {
      ...foundWord,
      playedBy: pvpPlayerTurn,
      id: `pvp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };

    const newUsed = new Set(pvpUsedWords);
    newUsed.add(cleanInput);

    setPvpChain((prev) => [...prev, entry]);
    setPvpUsedWords(newUsed);
    setPvpInput('');
    setPvpPlayerTurn(nextPlayer);

    playAudio(foundWord.word, { presetId: voicePreset });

    // Send real-time move to second device!
    sendRealtimeMove({
      type: 'PVP_WORD',
      id: entry.id,
      entry,
      nextPlayer,
      timeLimit: pvpTimeLimit,
    });
  };

  const handleRestartPvpChain = () => {
    setPvpChain([]);
    setPvpUsedWords(new Set());
    setPvpInput('');
    setPvpTimer(pvpTimeLimit || 15);
    setPvpGameOver(false);
    setPvpWinner(null);
    setPvpError('');
    setPvpPlayerTurn('محمد');

    sendRealtimeMove({
      type: 'PVP_RESTART',
      id: `restart-${Date.now()}`,
      timeLimit: pvpTimeLimit,
    });
  };

  // --------------------------------------------------------------------------
  // 5. QUIZ DUEL 1v1 SPEED QUIZ STATE
  // --------------------------------------------------------------------------
  const [quizTurn, setQuizTurn] = useState(0); // 0..9 questions
  const [quizPlayerTurn, setQuizPlayerTurn] = useState('محمد');
  const [quizScores, setQuizScores] = useState({ محمد: 0, ريوف: 0 });
  const [quizGameOver, setQuizGameOver] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);

  const quizDuelItems = useMemo(() => {
    const shuffled = [...OXFORD_3000].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10).map((item) => {
      const wrong = OXFORD_3000.filter((w) => w.id !== item.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((w) => w.arabic);

      return {
        wordObj: item,
        correct: item.arabic,
        options: [item.arabic, ...wrong].sort(() => 0.5 - Math.random()),
      };
    });
  }, [quizGameOver]);

  const currentQuizItem = quizDuelItems[quizTurn];

  const handleSelectQuizOption = (opt) => {
    if (quizAnswered) return;
    setSelectedQuizOption(opt);
    setQuizAnswered(true);

    if (opt === currentQuizItem.correct) {
      setQuizScores((prev) => ({
        ...prev,
        [quizPlayerTurn]: prev[quizPlayerTurn] + 10,
      }));
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizTurn + 1 < quizDuelItems.length) {
      setQuizTurn((prev) => prev + 1);
      setSelectedQuizOption(null);
      setQuizAnswered(false);
      setQuizPlayerTurn((prev) => (prev === 'محمد' ? 'ريوف' : 'محمد'));
    } else {
      setQuizGameOver(true);
      const winner = quizScores.محمد > quizScores.ريوف ? 'محمد' : quizScores.ريوف > quizScores.محمد ? 'ريوف' : 'تعادل';
      if (winner !== 'تعادل') {
        updateSiblingStat(winner, 'duelsWon', 1);
      }
    }
  };

  const handleRestartQuizDuel = () => {
    setQuizTurn(0);
    setQuizPlayerTurn('محمد');
    setQuizScores({ محمد: 0, ريوف: 0 });
    setQuizGameOver(false);
    setSelectedQuizOption(null);
    setQuizAnswered(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Main Banner & User Authentication Bar */}
      <div className="card-theme-target p-6 sm:p-8 rounded-3xl border border-cyan-500/30 flex items-center justify-between flex-wrap gap-4 shadow-2xl bg-[var(--bg-card)] text-[var(--text-main)]">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black shadow-md">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <span>قسم التعلم المشترك</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-mono font-bold">
                Dual-Player Hub
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
              تحدي وممارسة حوارات ومواجهات لغوية تفاعلية بين متعلمين (محمد & ريوف)
            </p>
          </div>
        </div>

        {/* User Session Switcher Control */}
        <div className="flex items-center gap-2">
          {activeUser !== 'guest' ? (
            <div className="flex items-center gap-2 p-2 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 text-xs font-black">
              <ShieldCheck className="w-4 h-4 text-cyan-500" />
              <span>مسجل كـ: <strong className="text-cyan-700 dark:text-cyan-300">{activeUser}</strong></span>
              <button
                onClick={handleLogout}
                className="p-1 rounded-lg bg-rose-500/20 text-rose-500 hover:bg-rose-500/30"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl theme-btn-primary text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل دخول متعلم</span>
            </button>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card-theme-target p-6 sm:p-8 rounded-3xl border border-cyan-500/40 max-w-sm w-full space-y-4 bg-[var(--bg-card)] text-[var(--text-main)] shadow-2xl dir-rtl font-arabic">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-500" />
                <span>تسجيل دخول حساب المتعلم</span>
              </h3>
              <button onClick={() => setLoginModalOpen(false)} className="p-1 text-slate-400">
                ✕
              </button>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-300 text-xs font-black">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-black block mb-1.5 text-[var(--text-main)]">اختر الحساب:</label>
                <select
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-900 text-white font-black text-sm shadow-md focus:border-cyan-500"
                >
                  <option value="محمد" className="bg-slate-900 text-white font-black py-1">محمد (Mohammed)</option>
                  <option value="ريوف" className="bg-slate-900 text-white font-black py-1">ريوف (Ryof)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black block mb-1.5 text-[var(--text-main)]">كلمة المرور:</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الخاصة بحسابك..."
                  className="w-full p-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-900 text-white font-black text-sm placeholder-slate-400 focus:border-cyan-500 shadow-md"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl transition-all active:scale-95"
              >
                دخول
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sub-Tabs Bar (High Contrast & Theme Adaptive) */}
      <div className="flex items-center gap-2 overflow-x-auto p-2 rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 no-scrollbar shadow-lg">
        {[
          { id: 'dialogue', label: '💬 حوارات تفاعلية AI', icon: MessageSquare },
          { id: 'chain', label: '⚔️ تحدي السلسلة 1v1', icon: Gamepad2 },
          { id: 'quiz', label: '⚡ مواجهة السرعة السريعة', icon: Award },
          { id: 'leaderboard', label: '🏆 لوحة المقارنة والإنجاز', icon: BarChart3 },
        ].map((tb) => (
          <button
            key={tb.id}
            onClick={() => setSubTab(tb.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
              subTab === tb.id
                ? 'bg-amber-500 text-slate-950 font-black shadow-md scale-105'
                : 'text-slate-300 hover:text-white font-extrabold hover:bg-slate-800/80'
            }`}
          >
            <span>{tb.label}</span>
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SUB-TAB 1: AI PRACTICE DIALOGUE GENERATOR                           */}
      {/* ------------------------------------------------------------------ */}
      {subTab === 'dialogue' && (
        <div className="space-y-6">
          <div className="card-theme-target p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 bg-[var(--bg-card)] text-[var(--text-main)] shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-black flex items-center gap-2 text-[var(--text-main)]">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>مبتكر المحادثات والحوارات الثنائية التفاعلية</span>
              </h3>
            </div>

            {/* Controls Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-black block mb-1.5 text-[var(--text-main)]">
                  🎭 موضوع المحادثة:
                </label>
                <select
                  value={dialogueTopic}
                  onChange={(e) => setDialogueTopic(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-800 bg-slate-900 text-white font-black text-xs shadow-sm"
                >
                  {DIALOGUE_TOPICS.map((tp) => (
                    <option key={tp.id} value={tp.id}>
                      {tp.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black block mb-1.5 text-[var(--text-main)]">
                  🎯 مستوى الصعوبة (CEFR):
                </label>
                <select
                  value={dialogueLevel}
                  onChange={(e) => setDialogueLevel(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-800 bg-slate-900 text-white font-black text-xs shadow-sm"
                >
                  <option value="A1">A1 - مبتدئ جداً</option>
                  <option value="A2">A2 - مبتدئ متقدم</option>
                  <option value="B1">B1 - متوسط</option>
                  <option value="B2">B2 - متوسط متقدم</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black block mb-1.5 text-[var(--text-main)]">
                  📏 عدد الجمل في الحوار:
                </label>
                <select
                  value={dialogueTurnsCount}
                  onChange={(e) => setDialogueTurnsCount(Number(e.target.value))}
                  className="w-full p-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-800 bg-slate-900 text-white font-black text-xs shadow-sm"
                >
                  <option value={4}>قصير (4 جمل)</option>
                  <option value={6}>متوسط (6 جمل)</option>
                  <option value={10}>طويل (10 جمل)</option>
                </select>
              </div>
            </div>

            {dialogueTopic === 'Custom' && (
              <div>
                <label className="text-xs font-black block mb-1.5 text-[var(--text-main)]">اكتب الموضوع المخصص بالإنجليزية:</label>
                <input
                  type="text"
                  value={customTopicInput}
                  onChange={(e) => setCustomTopicInput(e.target.value)}
                  placeholder="e.g. Planning a weekend trip to London..."
                  className="w-full p-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-800 bg-slate-900 text-white font-black text-sm"
                />
              </div>
            )}

            <button
              onClick={handleGenerateDialogue}
              disabled={isGeneratingDialogue}
              className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>{isGeneratingDialogue ? 'جاري إنشاء حوار تفاعلي...' : 'توليد حوار تفاعلي بين محمد & ريوف'}</span>
            </button>

            {/* Render Script */}
            {dialogueScript && (
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs font-black text-slate-600 dark:text-slate-400">
                  <span>الموضوع: {dialogueScript.topic}</span>
                  <span>المستوى: {dialogueScript.level}</span>
                </div>

                <div className="space-y-3">
                  {dialogueScript.turns.map((turn, tIdx) => {
                    const isSpeakerA = turn.speaker === 'A';
                    return (
                      <div
                        key={tIdx}
                        className={`p-4 rounded-2xl border space-y-2 transition-all ${
                          isSpeakerA
                            ? 'bg-cyan-500/10 border-cyan-500/30 mr-4'
                            : 'bg-purple-500/10 border-purple-500/30 ml-4'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-black">
                          <span className={isSpeakerA ? 'text-cyan-700 dark:text-cyan-300' : 'text-purple-700 dark:text-purple-300'}>
                            🗣️ {turn.name} ({isSpeakerA ? 'Speaker A' : 'Speaker B'})
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => playAudio(turn.en, { presetId: voicePreset })}
                              className="px-2.5 py-1 rounded-lg bg-black/10 hover:bg-black/20 text-xs font-black flex items-center gap-1"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>استمع</span>
                            </button>
                            <button
                              onClick={() => toggleTranslationTurn(tIdx)}
                              className="px-2.5 py-1 rounded-lg border border-black/10 text-xs font-black opacity-80"
                            >
                              {visibleTranslations[tIdx] ? 'إخفاء الترجمة' : 'الترجمة'}
                            </button>
                          </div>
                        </div>

                        <p className="text-base font-black ltr-isolate" dir="ltr">
                          "{turn.en}"
                        </p>

                        {visibleTranslations[tIdx] && (
                          <p className="text-xs font-black text-amber-950 dark:text-amber-300 font-arabic text-right border-t border-black/10 pt-2">
                            {turn.ar}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-TAB 2: 1v1 PVP WORD CHAIN GAME                                  */}
      {/* ------------------------------------------------------------------ */}
      {subTab === 'chain' && (
        <div className="card-theme-target p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 bg-[var(--bg-card)] text-[var(--text-main)] shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-cyan-500" />
              <span>تحدي المواجهة في السلسلة اللغوية (1v1: محمد vs ريوف)</span>
            </h3>
            <button
              onClick={handleRestartPvpChain}
              className="px-3 py-1.5 rounded-xl theme-btn-secondary text-xs font-black flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>جولة جديدة</span>
            </button>
          </div>

          {!pvpGameOver ? (
            <div className="space-y-5">
              {/* Timer Limit Selector Bar */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs font-black">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Clock className="w-4 h-4 text-cyan-400" /> وقت كل دور:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar" dir="ltr">
                  {[
                    { value: 10, label: '10s' },
                    { value: 15, label: '15s' },
                    { value: 30, label: '30s' },
                    { value: 60, label: '60s' },
                    { value: 0, label: 'Off' },
                  ].map((tOpt) => (
                    <button
                      key={tOpt.value}
                      onClick={() => {
                        setPvpTimeLimit(tOpt.value);
                        setPvpTimer(tOpt.value);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                        pvpTimeLimit === tOpt.value
                          ? 'bg-amber-500 text-slate-950 font-black scale-105 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {tOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Turn & Timer Header Bar */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-2 font-black text-sm">
                  <span>الدور الحاضر:</span>
                  <span className={`px-3.5 py-1 rounded-xl text-white font-black shadow-md ${pvpPlayerTurn === 'محمد' ? 'bg-cyan-600' : 'bg-purple-600'}`}>
                    دور {pvpPlayerTurn}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/30">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>{pvpTimeLimit === 0 ? 'بدون مؤقت' : `${pvpTimer} ثانية متبقية`}</span>
                </div>
              </div>

              {pvpError && (
                <div className="p-3 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-300 text-xs font-black">
                  {pvpError}
                </div>
              )}

              {/* Chain Log */}
              <div className="p-4 rounded-2xl bg-slate-950 text-white min-h-[180px] max-h-[260px] overflow-y-auto space-y-2 no-scrollbar">
                {pvpChain.length === 0 ? (
                  <p className="text-xs text-slate-400 font-bold text-center py-10">
                    ابدأ التحدي! اكتب أول كلمة إنجليزية من مصفوفة أكسفورد.
                  </p>
                ) : (
                  pvpChain.map((cItem, cIdx) => (
                    <div key={cItem.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span dir="ltr" className="ltr-isolate font-black text-sm text-cyan-400">
                        {cItem.word}
                      </span>
                      <span className="font-arabic font-extrabold">{cItem.arabic}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${cItem.playedBy === 'محمد' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'}`}>
                        {cItem.playedBy}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Required Next Letter */}
              {pvpRequiredLetter && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-black flex items-center justify-between">
                  <span>على الكلمة أن تبدأ بحرف:</span>
                  <span dir="ltr" className="ltr-isolate text-base font-black px-3 py-0.5 rounded bg-amber-500 text-slate-950">
                    {pvpRequiredLetter.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handlePvpSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={pvpInput}
                  onChange={(e) => setPvpInput(e.target.value)}
                  placeholder={`اكتب كلمة بـ English بدأت بحرف ${pvpRequiredLetter.toUpperCase() || 'أي حرف'}...`}
                  className="ltr-isolate flex-1 p-3.5 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-black text-sm"
                />
                <button type="submit" className="px-6 py-3.5 rounded-2xl theme-btn-primary font-black text-sm shadow-md">
                  إرسال
                </button>
              </form>
            </div>
          ) : (
            /* Winner Announcement */
            <div className="text-center py-10 space-y-4">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-lg">
                <Trophy className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black">🎉 الفائز بالمواجهة: {pvpWinner}!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                تمت إضافة +100 نقطة إلى لوحة المتصدرين لحساب {pvpWinner}.
              </p>
              <button onClick={handleRestartPvpChain} className="px-6 py-3 rounded-2xl theme-btn-primary font-black text-sm">
                جولة جديدة
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-TAB 3: SPEED QUIZ DUEL 1v1                                      */}
      {/* ------------------------------------------------------------------ */}
      {subTab === 'quiz' && (
        <div className="card-theme-target p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 bg-[var(--bg-card)] text-[var(--text-main)] shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>مواجهة السرعة السريعة (Quiz Duel 1v1)</span>
            </h3>
            <button onClick={handleRestartQuizDuel} className="px-3 py-1.5 rounded-xl theme-btn-secondary text-xs font-black">
              إعادة البداية
            </button>
          </div>

          {!quizGameOver && currentQuizItem ? (
            <div className="space-y-5">
              {/* Turn & Scores */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-900">
                <span className="font-black text-xs">سؤال {quizTurn + 1} من 10 (الدور: <strong className="text-cyan-500">{quizPlayerTurn}</strong>)</span>
                <div className="flex items-center gap-4 text-xs font-black">
                  <span>محمد: {quizScores.محمد}</span>
                  <span>ريوف: {quizScores.ريوف}</span>
                </div>
              </div>

              {/* Question Card */}
              <div className="p-8 rounded-3xl bg-slate-950 text-white text-center space-y-2 shadow-xl">
                <span className="text-xs text-slate-400 font-black block">اختر الترجمة الصحيحة:</span>
                <h3 dir="ltr" className="ltr-isolate text-4xl font-black text-cyan-400">
                  {currentQuizItem.wordObj.word}
                </h3>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {currentQuizItem.options.map((opt, oIdx) => {
                  const isSelected = selectedQuizOption === opt;
                  const isCorrect = opt === currentQuizItem.correct;
                  let style = 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 text-slate-950 dark:text-white font-black';

                  if (quizAnswered) {
                    if (isCorrect) style = 'bg-emerald-100 border-2 border-emerald-600 text-emerald-950 font-black';
                    else if (isSelected && !isCorrect) style = 'bg-rose-100 border-2 border-rose-600 text-rose-950 font-black';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectQuizOption(opt)}
                      disabled={quizAnswered}
                      className={`p-4 rounded-2xl text-right font-black text-base font-arabic ${style}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {quizAnswered && (
                <div className="flex justify-end pt-2">
                  <button onClick={handleNextQuizQuestion} className="px-6 py-3 rounded-2xl theme-btn-primary font-black text-sm">
                    السؤال التالي ←
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Trophy className="w-16 h-16 text-amber-500 mx-auto" />
              <h3 className="text-2xl font-black">انتهاء التحدي السريع!</h3>
              <p className="text-sm font-bold">
                النتيجة: محمد ({quizScores.محمد}) - ريوف ({quizScores.ريوف})
              </p>
              <button onClick={handleRestartQuizDuel} className="px-6 py-3 rounded-2xl theme-btn-primary font-black text-sm">
                تحدي جديد
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-TAB 4: SIBLING SCOREBOARD & LEADERBOARD                       */}
      {/* ------------------------------------------------------------------ */}
      {subTab === 'leaderboard' && (
        <div className="card-theme-target p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 bg-[var(--bg-card)] text-[var(--text-main)] shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-black flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-500" />
              <span>لوحة الإنجاز والمقارنة (محمد vs ريوف)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Player 1: Mohammed */}
            <div className="p-6 rounded-3xl bg-cyan-500/10 border-2 border-cyan-500/40 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  👑
                </div>
                <div>
                  <h4 className="text-xl font-black">محمد (Mohammed)</h4>
                  <span className="text-xs text-cyan-700 dark:text-cyan-300 font-extrabold">مكتمل المستويات</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-black pt-2">
                <div className="flex justify-between">
                  <span>المفردات المتقنة:</span>
                  <span>{stats.محمد?.mastered || 0} كلمة</span>
                </div>
                <div className="flex justify-between">
                  <span>انتصارات السلسلة اللغوية:</span>
                  <span>{stats.محمد?.chainWins || 0} جولات</span>
                </div>
                <div className="flex justify-between">
                  <span>انتصارات المواجهة السرية:</span>
                  <span>{stats.محمد?.duelsWon || 0} فوز</span>
                </div>
              </div>
            </div>

            {/* Player 2: Ryof */}
            <div className="p-6 rounded-3xl bg-purple-500/10 border-2 border-purple-500/40 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  ⭐
                </div>
                <div>
                  <h4 className="text-xl font-black">ريوف (Ryof)</h4>
                  <span className="text-xs text-purple-700 dark:text-purple-300 font-extrabold">مكتملة المستويات</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-black pt-2">
                <div className="flex justify-between">
                  <span>المفردات المتقنة:</span>
                  <span>{stats.ريوف?.mastered || 0} كلمة</span>
                </div>
                <div className="flex justify-between">
                  <span>انتصارات السلسلة اللغوية:</span>
                  <span>{stats.ريوف?.chainWins || 0} جولات</span>
                </div>
                <div className="flex justify-between">
                  <span>انتصارات المواجهة السرية:</span>
                  <span>{stats.ريوف?.duelsWon || 0} فوز</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
