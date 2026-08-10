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
  HelpCircle,
  Search,
} from 'lucide-react';
import { OXFORD_3000 } from '../data/oxford3000';
import { playAudio } from '../services/audioService';
import { useApp } from '../context/AppContext';
import { generateStory } from '../services/geminiService';
import { getWordExample } from '../utils/exampleSentenceService';
import { sendRealtimeMove, subscribeRealtimeMoves, LOCAL_DEVICE_ID } from '../services/realtimeSyncService';

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
  // 2. SIBLING SCOREBOARD PERSISTENT STATE (AUTHENTIC REAL STATS)
  // --------------------------------------------------------------------------
  const [stats, setStats] = useState(() => {
    const defaultStats = {
      محمد: { mastered: 0, duelsWon: 0, chainWins: 0, totalScore: 0 },
      ريوف: { mastered: 0, duelsWon: 0, chainWins: 0, totalScore: 0 },
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

      // Broadcast stats update to second device
      sendRealtimeMove({
        type: 'STATS_UPDATE',
        id: `stats-${Date.now()}`,
        stats: updated,
      });

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

      const generatedScript = {
        topic: finalTopic,
        level: dialogueLevel,
        turns: turns.slice(0, dialogueTurnsCount),
      };

      setDialogueScript(generatedScript);

      // Broadcast generated dialogue to second device in real time!
      sendRealtimeMove({
        type: 'DIALOGUE_GENERATE',
        id: `dialogue-${Date.now()}`,
        dialogueScript: generatedScript,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingDialogue(false);
    }
  };

  const toggleTranslationTurn = (idx) => {
    setVisibleTranslations((prev) => ({ ...prev, [idx]: !prev[idx] }));
    sendRealtimeMove({
      type: 'DIALOGUE_TOGGLE',
      id: `dtoggle-${Date.now()}`,
      idx,
    });
  };

  const handleRestartQuizDuel = () => {
    setQuizTurn(0);
    setQuizPlayerTurn('محمد');
    setQuizScores({ محمد: 0, ريوف: 0 });
    setQuizGameOver(false);
    setSelectedQuizOption(null);
    setQuizAnswered(false);

    sendRealtimeMove({
      type: 'QUIZ_RESTART',
      id: `qrestart-${Date.now()}`,
    });
  };

  // --------------------------------------------------------------------------
  // 4. TWO-PLAYER PVP WORD CHAIN GAME STATE (1v1: محمد vs ريوف)
  // --------------------------------------------------------------------------
  const [pvpPlayerTurn, setPvpPlayerTurn] = useState('محمد'); // 'محمد' | 'ريوف'
  const [pvpStarter, setPvpStarter] = useState('محمد'); // Host Mohammed chooses who starts
  const [pvpChain, setPvpChain] = useState([]);
  const [pvpUsedWords, setPvpUsedWords] = useState(new Set());
  const [pvpInput, setPvpInput] = useState('');
  const [pvpTimeLimit, setPvpTimeLimit] = useState(15); // 10, 15, 30, 60, 0 (off)
  const [pvpTimer, setPvpTimer] = useState(15);
  const [pvpGameOver, setPvpGameOver] = useState(false);
  const [pvpWinner, setPvpWinner] = useState(null);
  const [pvpError, setPvpError] = useState('');

  // --------------------------------------------------------------------------
  // 6. SIBLING CO-OP DETECTIVE & SPEED REACTION BUZZER STATES
  // --------------------------------------------------------------------------
  const [teamScore, setTeamScore] = useState(0);
  const [detectiveLevel, setDetectiveLevel] = useState('all'); // 'all' | 'A1-A2' | 'B1-B2'
  const [detectiveLength, setDetectiveLength] = useState('any'); // 'any' | 'short' | 'medium' | 'long'
  const [detectivePuzzleType, setDetectivePuzzleType] = useState('context'); // 'context' | 'anagram' | 'definition'

  const [detectiveCase, setDetectiveCase] = useState(() => {
    const wordObj = OXFORD_3000[Math.floor(Math.random() * OXFORD_3000.length)];
    return {
      wordObj,
      puzzleType: 'context',
      solved: false,
    };
  });
  const [detectiveGuess, setDetectiveGuess] = useState('');
  const [detectiveMessage, setDetectiveMessage] = useState('');

  const [activeBuzzer, setActiveBuzzer] = useState(null); // null | 'محمد' | 'ريوف'
  const [buzzScores, setBuzzScores] = useState({ محمد: 0, ريوف: 0 });
  const [buzzIndex, setBuzzIndex] = useState(0);

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

        // NO AUDIO DUPLICATION: Play audio ONLY if sent by another device!
        if (data.senderDeviceId !== LOCAL_DEVICE_ID) {
          playAudio(data.entry.word, { presetId: voicePreset });
        }
      } else if (data.type === 'PVP_CONFIG') {
        if (data.timeLimit !== undefined) {
          setPvpTimeLimit(data.timeLimit);
          setPvpTimer(data.timeLimit);
        }
        if (data.starter) {
          setPvpStarter(data.starter);
          if (pvpChain.length === 0) setPvpPlayerTurn(data.starter);
        }
      } else if (data.type === 'PVP_RESTART') {
        setPvpChain([]);
        setPvpUsedWords(new Set());
        setPvpInput('');
        setPvpTimer(data.timeLimit || 15);
        setPvpGameOver(false);
        setPvpWinner(null);
        setPvpError('');
        const starter = data.starter || pvpStarter;
        setPvpPlayerTurn(starter);
        if (data.starter) setPvpStarter(starter);
      } else if (data.type === 'SUBTAB_CHANGE' && data.subTab) {
        setSubTab(data.subTab);
      } else if (data.type === 'DIALOGUE_GENERATE' && data.dialogueScript) {
        setDialogueScript(data.dialogueScript);
        if (data.dialogueScript.topic) setDialogueTopic(data.dialogueScript.topic);
        if (data.dialogueScript.level) setDialogueLevel(data.dialogueScript.level);
        addNotification('تم استلام حوار تفاعلي جديد من الحساب الآخر! 💬', 'info');
      } else if (data.type === 'DIALOGUE_TOGGLE' && data.idx !== undefined) {
        setVisibleTranslations((prev) => ({ ...prev, [data.idx]: !prev[data.idx] }));
      } else if (data.type === 'QUIZ_ANSWER') {
        if (data.turn !== undefined) setQuizTurn(data.turn);
        if (data.option !== undefined) setSelectedQuizOption(data.option);
        setQuizAnswered(true);
        if (data.scores) setQuizScores(data.scores);
      } else if (data.type === 'QUIZ_NEXT') {
        if (data.turn !== undefined) setQuizTurn(data.turn);
        setSelectedQuizOption(null);
        setQuizAnswered(false);
        if (data.quizPlayerTurn) setQuizPlayerTurn(data.quizPlayerTurn);
      } else if (data.type === 'QUIZ_RESTART') {
        setQuizTurn(0);
        setQuizPlayerTurn('محمد');
        setQuizScores({ محمد: 0, ريوف: 0 });
        setQuizGameOver(false);
        setSelectedQuizOption(null);
        setQuizAnswered(false);
      } else if (data.type === 'STATS_UPDATE' && data.stats) {
        setStats(data.stats);
      } else if (data.type === 'DETECTIVE_GUESS') {
        if (data.solved) {
          setDetectiveCase((prev) => ({ ...prev, solved: true }));
          setTeamScore((prev) => prev + 50);
          setDetectiveMessage(`🎉 تم حل اللغز بنجاح بواسطة الفريق! الكلمة هي: "${data.word}"`);
        } else {
          setDetectiveMessage(`💡 محاولة غير صحيحة للكلمة: "${data.guess}"`);
        }
      } else if (data.type === 'DETECTIVE_NEW') {
        if (data.caseData) setDetectiveCase(data.caseData);
        else if (data.wordObj) setDetectiveCase({ wordObj: data.wordObj, puzzleType: data.puzzleType || 'context', solved: false });
        if (data.level) setDetectiveLevel(data.level);
        if (data.length) setDetectiveLength(data.length);
        if (data.puzzleType) setDetectivePuzzleType(data.puzzleType);
        setDetectiveGuess('');
        setDetectiveMessage('');
      } else if (data.type === 'BUZZER_HIT') {
        setActiveBuzzer(data.player);
        addNotification(`🔔 ضغط ${data.player} على الجرس! لديه 3 ثوانٍ للإجابة!`, 'warning');
      } else if (data.type === 'BUZZER_ANSWER') {
        if (data.scores) setBuzzScores(data.scores);
        setActiveBuzzer(null);
        setBuzzIndex((prev) => prev + 1);
      }
    });

    return () => unsubscribe();
  }, [voicePreset, addNotification, pvpStarter, pvpChain.length]);

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

  const handleSetPvpTimeLimit = (newLimit) => {
    if (activeUser !== 'محمد') {
      addNotification('عذراً، التحكم في خيارات الوقت متاح لـ محمد فقط 🔒', 'warning');
      return;
    }
    setPvpTimeLimit(newLimit);
    setPvpTimer(newLimit);
    sendRealtimeMove({
      type: 'PVP_CONFIG',
      id: `config-${Date.now()}`,
      timeLimit: newLimit,
    });
  };

  const handleSetPvpStarter = (starterName) => {
    if (activeUser !== 'محمد') {
      addNotification('عذراً، تحديد من يبدأ اللعبة خاص بـ محمد فقط 🔒', 'warning');
      return;
    }
    setPvpStarter(starterName);
    if (pvpChain.length === 0) setPvpPlayerTurn(starterName);
    sendRealtimeMove({
      type: 'PVP_CONFIG',
      id: `starter-${Date.now()}`,
      starter: starterName,
      timeLimit: pvpTimeLimit,
    });
  };

  const handleRestartPvpChain = () => {
    if (activeUser !== 'محمد') {
      addNotification('عذراً، زر بدء جولة جديدة خاص بـ محمد فقط 🔒', 'warning');
      return;
    }
    setPvpChain([]);
    setPvpUsedWords(new Set());
    setPvpInput('');
    setPvpTimer(pvpTimeLimit || 15);
    setPvpGameOver(false);
    setPvpWinner(null);
    setPvpError('');
    setPvpPlayerTurn(pvpStarter);

    sendRealtimeMove({
      type: 'PVP_RESTART',
      id: `restart-${Date.now()}`,
      timeLimit: pvpTimeLimit,
      starter: pvpStarter,
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

    const isCorrect = opt === currentQuizItem.correct;
    const updatedScores = {
      ...quizScores,
      [quizPlayerTurn]: isCorrect ? quizScores[quizPlayerTurn] + 10 : quizScores[quizPlayerTurn],
    };

    if (isCorrect) setQuizScores(updatedScores);

    sendRealtimeMove({
      type: 'QUIZ_ANSWER',
      id: `qans-${Date.now()}`,
      turn: quizTurn,
      option: opt,
      scores: updatedScores,
      quizPlayerTurn,
    });
  };

  const handleNextQuizQuestion = () => {
    if (quizTurn + 1 < quizDuelItems.length) {
      const nextTurn = quizTurn + 1;
      const nextPlayer = quizPlayerTurn === 'محمد' ? 'ريوف' : 'محمد';
      setQuizTurn(nextTurn);
      setSelectedQuizOption(null);
      setQuizAnswered(false);
      setQuizPlayerTurn(nextPlayer);

      sendRealtimeMove({
        type: 'QUIZ_NEXT',
        id: `qnxt-${Date.now()}`,
        turn: nextTurn,
        quizPlayerTurn: nextPlayer,
      });
    } else {
      setQuizGameOver(true);
      const winner = quizScores.محمد > quizScores.ريوف ? 'محمد' : quizScores.ريوف > quizScores.محمد ? 'ريوف' : 'تعادل';
      if (winner !== 'تعادل') {
        updateSiblingStat(winner, 'duelsWon', 1);
      }
    }
  };

  const handleSwitchSubTab = (newTab) => {
    setSubTab(newTab);
    sendRealtimeMove({
      type: 'SUBTAB_CHANGE',
      id: `tab-${Date.now()}`,
      subTab: newTab,
    });
  };

  // Detective Handlers
  const handleSubmitDetectiveGuess = (e) => {
    if (e) e.preventDefault();
    if (detectiveCase.solved) return;

    const cleanInput = detectiveGuess.trim().toLowerCase();
    const target = detectiveCase.wordObj.word.trim().toLowerCase();

    const isSolved = cleanInput === target;
    if (isSolved) {
      setDetectiveCase((prev) => ({ ...prev, solved: true }));
      setTeamScore((prev) => prev + 50);
      setDetectiveMessage(`🎉 صح! تم حل اللغز بنجاح! الكلمة هي: "${detectiveCase.wordObj.word}"`);
    } else {
      setDetectiveMessage(`💡 التخمين غير صحيح، جرب كلمة أخرى!`);
    }

    sendRealtimeMove({
      type: 'DETECTIVE_GUESS',
      id: `det-${Date.now()}`,
      guess: detectiveGuess,
      word: detectiveCase.wordObj.word,
      solved: isSolved,
    });

    setDetectiveGuess('');
  };

  const filterDetectiveWords = (lvl = detectiveLevel, len = detectiveLength) => {
    return OXFORD_3000.filter((item) => {
      if (!item || !item.word) return false;
      const cleanLen = item.word.replace(/[^a-z]/gi, '').length;

      if (lvl === 'A1-A2' && !['A1', 'A2'].includes(item.cefr)) return false;
      if (lvl === 'B1-B2' && !['B1', 'B2'].includes(item.cefr)) return false;

      if (len === 'short' && (cleanLen < 3 || cleanLen > 5)) return false;
      if (len === 'medium' && (cleanLen < 6 || cleanLen > 8)) return false;
      if (len === 'long' && cleanLen < 9) return false;

      return true;
    });
  };

  const handleNextDetectiveCase = (customLvl, customLen, customType) => {
    if (activeUser !== 'محمد') {
      addNotification('عذراً، التحكم في خيارات وإعدادات الألغاز خاص بـ محمد فقط 🔒', 'warning');
      return;
    }

    const lvl = customLvl !== undefined ? customLvl : detectiveLevel;
    const len = customLen !== undefined ? customLen : detectiveLength;
    const pType = customType !== undefined ? customType : detectivePuzzleType;

    if (customLvl !== undefined) setDetectiveLevel(customLvl);
    if (customLen !== undefined) setDetectiveLength(customLen);
    if (customType !== undefined) setDetectivePuzzleType(customType);

    const pool = filterDetectiveWords(lvl, len);
    const finalPool = pool.length > 0 ? pool : OXFORD_3000;
    const nextWord = finalPool[Math.floor(Math.random() * finalPool.length)];

    const newCase = { wordObj: nextWord, puzzleType: pType, solved: false };
    setDetectiveCase(newCase);
    setDetectiveGuess('');
    setDetectiveMessage('');

    sendRealtimeMove({
      type: 'DETECTIVE_NEW',
      id: `detnew-${Date.now()}`,
      caseData: newCase,
      level: lvl,
      length: len,
      puzzleType: pType,
    });
  };

  // Speed Reaction Buzzers Handlers
  const handleHitBuzzer = (player) => {
    if (activeBuzzer) return;
    setActiveBuzzer(player);
    sendRealtimeMove({
      type: 'BUZZER_HIT',
      id: `buzz-${Date.now()}`,
      player,
    });
  };

  const handleAnswerBuzzerOption = (opt, correctOpt) => {
    if (!activeBuzzer) return;
    const isCorrect = opt === correctOpt;
    const newScores = {
      ...buzzScores,
      [activeBuzzer]: isCorrect ? buzzScores[activeBuzzer] + 10 : Math.max(0, buzzScores[activeBuzzer] - 5),
    };

    setBuzzScores(newScores);
    setActiveBuzzer(null);
    setBuzzIndex((prev) => prev + 1);

    sendRealtimeMove({
      type: 'BUZZER_ANSWER',
      id: `buzzans-${Date.now()}`,
      scores: newScores,
    });
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
          { id: 'detective', label: '🕵️‍♂️ التحري اللغوي (لغز الفريق)', icon: HelpCircle },
          { id: 'speed_buzz', label: '🔔 تحدي سرعة الجرس 1v1', icon: Flame },
          { id: 'leaderboard', label: '🏆 لوحة المقارنة والإنجاز', icon: BarChart3 },
        ].map((tb) => (
          <button
            key={tb.id}
            onClick={() => handleSwitchSubTab(tb.id)}
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
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm ${
                activeUser === 'محمد'
                  ? 'theme-btn-primary'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
              title={activeUser === 'محمد' ? 'بدء جولة جديدة' : 'التحكم خاص بـ محمد فقط'}
            >
              <RotateCcw className="w-4 h-4" />
              <span>جولة جديدة {activeUser !== 'محمد' && '🔒'}</span>
            </button>
          </div>

          {!pvpGameOver ? (
            <div className="space-y-5">
              {/* Timer Limit & Starter Selector Bar */}
              <div className="flex items-center justify-between flex-wrap gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs font-black shadow-md">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Clock className="w-4 h-4 text-cyan-400" /> وقت كل دور:
                  </span>
                  <div className="flex items-center gap-1" dir="ltr">
                    {[
                      { value: 10, label: '10s' },
                      { value: 15, label: '15s' },
                      { value: 30, label: '30s' },
                      { value: 60, label: '60s' },
                      { value: 0, label: 'Off' },
                    ].map((tOpt) => (
                      <button
                        key={tOpt.value}
                        onClick={() => handleSetPvpTimeLimit(tOpt.value)}
                        disabled={activeUser !== 'محمد'}
                        className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                          pvpTimeLimit === tOpt.value
                            ? 'bg-amber-500 text-slate-950 font-black scale-105 shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50'
                        }`}
                      >
                        {tOpt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Host Starter Control */}
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-black">من يبدأ اللعبة؟</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSetPvpStarter('محمد')}
                      disabled={activeUser !== 'محمد'}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                        pvpStarter === 'محمد'
                          ? 'bg-cyan-500 text-slate-950 font-black scale-105 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50'
                      }`}
                    >
                      👑 يبدأ محمد
                    </button>
                    <button
                      onClick={() => handleSetPvpStarter('ريوف')}
                      disabled={activeUser !== 'محمد'}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                        pvpStarter === 'ريوف'
                          ? 'bg-purple-500 text-white font-black scale-105 shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50'
                      }`}
                    >
                      ⭐ تبدأ ريوف
                    </button>
                  </div>
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
      {/* SUB-TAB 5: CO-OP DETECTIVE MYSTERY PUZZLE                           */}
      {/* ------------------------------------------------------------------ */}
      {subTab === 'detective' && (
        <div className="card-theme-target p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 bg-[var(--bg-card)] text-[var(--text-main)] shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-black flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <span>قسم التحري اللغوي والغاز المفردات (Co-op Detective)</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                يتعاون محمد وريوف كفريق واحد لفك شفرة الكلمة السرية وحل اللغز!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-950 dark:text-amber-300 font-black text-xs">
                نقاط الفريق 🏆: {teamScore}
              </span>
              <button
                onClick={() => handleNextDetectiveCase()}
                disabled={activeUser !== 'محمد'}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all shadow-sm ${
                  activeUser === 'محمد'
                    ? 'theme-btn-primary'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
                title={activeUser === 'محمد' ? 'توليد لغز جديد' : 'التحكم متاح لـ محمد فقط'}
              >
                لغز جديد 🕵️ {activeUser !== 'محمد' && '🔒'}
              </button>
            </div>
          </div>

          {/* Puzzle Settings Controls Bar (Mohammed Host Only) */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-amber-400">
              <span>⚙️ خيارات اللغز ومستوى الصعوبة:</span>
              {activeUser !== 'محمد' && (
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  🔒 تحكم محمد
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-black">
              {/* Level Filter */}
              <div>
                <label className="block mb-1 text-slate-400">المستوى (CEFR):</label>
                <select
                  value={detectiveLevel}
                  onChange={(e) => handleNextDetectiveCase(e.target.value, detectiveLength, detectivePuzzleType)}
                  disabled={activeUser !== 'محمد'}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-black focus:border-amber-500 disabled:opacity-50"
                >
                  <option value="all">الجميع (كل المستويات)</option>
                  <option value="A1-A2">A1-A2 (مبتدئ)</option>
                  <option value="B1-B2">B1-B2 (متوسط متقدم)</option>
                </select>
              </div>

              {/* Length Filter */}
              <div>
                <label className="block mb-1 text-slate-400">طول الكلمة:</label>
                <select
                  value={detectiveLength}
                  onChange={(e) => handleNextDetectiveCase(detectiveLevel, e.target.value, detectivePuzzleType)}
                  disabled={activeUser !== 'محمد'}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-black focus:border-amber-500 disabled:opacity-50"
                >
                  <option value="any">الجميع (أي طول)</option>
                  <option value="short">3-5 أحرف (قصيرة)</option>
                  <option value="medium">6-8 أحرف (متوسطة)</option>
                  <option value="long">9+ أحرف (طويلة/معقدة)</option>
                </select>
              </div>

              {/* Puzzle Type */}
              <div>
                <label className="block mb-1 text-slate-400">نوع اللغز:</label>
                <select
                  value={detectivePuzzleType}
                  onChange={(e) => handleNextDetectiveCase(detectiveLevel, detectiveLength, e.target.value)}
                  disabled={activeUser !== 'محمد'}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-black focus:border-amber-500 disabled:opacity-50"
                >
                  <option value="context">📝 الكلمة المفقودة بالسياق</option>
                  <option value="anagram">🔤 الشفرة والحروف المبعثرة</option>
                  <option value="definition">📖 تعريف المعجم والنطق</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-slate-950 text-white space-y-4 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs text-cyan-400 font-black">
                  تلميحات القضية ({detectiveCase.puzzleType === 'anagram' ? 'شفرة الحروف' : detectiveCase.puzzleType === 'definition' ? 'تعريف المعجم' : 'السياق والكلمة المفقودة'}):
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                  {detectiveCase.wordObj.cefr} | {detectiveCase.wordObj.pos} | {detectiveCase.wordObj.word.length} أحرف
                </span>
              </div>

              <div className="space-y-3 text-sm font-black">
                <p className="text-amber-400">💡 المعنى العربي: "{detectiveCase.wordObj.arabic}"</p>

                {/* Puzzle Type 1: Context Blank */}
                {detectiveCase.puzzleType === 'context' && (
                  <p dir="ltr" className="ltr-isolate text-base text-white leading-relaxed font-mono bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    📝 "{getWordExample(detectiveCase.wordObj).replace(new RegExp(detectiveCase.wordObj.word, 'gi'), '███████')}"
                  </p>
                )}

                {/* Puzzle Type 2: Scrambled Anagram */}
                {detectiveCase.puzzleType === 'anagram' && (
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center space-y-2">
                    <span className="text-xs text-slate-400 font-black block">🔤 الحروف المبعثرة للشفرة:</span>
                    <p dir="ltr" className="ltr-isolate text-2xl font-black font-mono text-cyan-400 tracking-widest">
                      [ {detectiveCase.wordObj.word.toUpperCase().split('').sort(() => 0.5 - Math.random()).join(' - ')} ]
                    </p>
                  </div>
                )}

                {/* Puzzle Type 3: Definition & IPA */}
                {detectiveCase.puzzleType === 'definition' && (
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-xs text-slate-400 font-black block">📖 دليل المعنى والنطق الفونيمي:</span>
                    <p dir="ltr" className="ltr-isolate text-sm font-mono text-cyan-300">
                      Pronunciation (IPA): /{detectiveCase.wordObj.ipa || detectiveCase.wordObj.word}/
                    </p>
                    <p dir="ltr" className="ltr-isolate text-sm font-mono text-white">
                      Definition: "The Oxford 3000 key term for '{detectiveCase.wordObj.arabic}'"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {detectiveMessage && (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-300 font-black text-sm text-center">
                {detectiveMessage}
              </div>
            )}

            {!detectiveCase.solved ? (
              <form onSubmit={handleSubmitDetectiveGuess} className="flex items-center gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={detectiveGuess}
                  onChange={(e) => setDetectiveGuess(e.target.value)}
                  placeholder="اكتب استنتاج الفريق للكلمة السرية..."
                  className="ltr-isolate flex-1 p-3.5 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-950 dark:text-white font-black text-sm"
                />
                <button type="submit" className="px-6 py-3.5 rounded-2xl theme-btn-primary font-black text-sm shadow-md">
                  تخمين الكلمة
                </button>
              </form>
            ) : (
              <div className="text-center pt-2">
                <button
                  onClick={() => handleNextDetectiveCase()}
                  disabled={activeUser !== 'محمد'}
                  className={`px-6 py-3 rounded-2xl font-black text-sm shadow-md ${
                    activeUser === 'محمد'
                      ? 'theme-btn-primary'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  القضية التالية ← {activeUser !== 'محمد' && '🔒'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SUB-TAB 6: SPEED REACTION BUZZERS (1v1)                              */}
      {/* ------------------------------------------------------------------ */}
      {subTab === 'speed_buzz' && (
        <div className="card-theme-target p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 bg-[var(--bg-card)] text-[var(--text-main)] shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span>تحدي التداعي وسرعة الجرس (Speed Reaction Buzzers)</span>
            </h3>
            <div className="flex items-center gap-4 text-xs font-black">
              <span>محمد 🔔: {buzzScores.محمد}</span>
              <span>ريوف 🔔: {buzzScores.ريوف}</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Word Display */}
            <div className="p-8 rounded-3xl bg-slate-950 text-white text-center space-y-2 shadow-2xl">
              <span className="text-xs text-slate-400 font-black block">الكلمة الحالية:</span>
              <h3 dir="ltr" className="ltr-isolate text-4xl font-black text-amber-400">
                {OXFORD_3000[buzzIndex % OXFORD_3000.length]?.word}
              </h3>
            </div>

            {/* Buzzer Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleHitBuzzer('محمد')}
                disabled={activeBuzzer !== null || activeUser !== 'محمد'}
                className={`p-6 rounded-3xl font-black text-lg transition-all shadow-xl active:scale-95 flex flex-col items-center justify-center gap-2 ${
                  activeBuzzer === 'محمد'
                    ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-300 scale-105'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50'
                }`}
              >
                <span>🔔 جرس محمد</span>
                <span className="text-xs font-normal">اضغط أولاً للإجابة</span>
              </button>

              <button
                onClick={() => handleHitBuzzer('ريوف')}
                disabled={activeBuzzer !== null || activeUser !== 'ريوف'}
                className={`p-6 rounded-3xl font-black text-lg transition-all shadow-xl active:scale-95 flex flex-col items-center justify-center gap-2 ${
                  activeBuzzer === 'ريوف'
                    ? 'bg-purple-500 text-white ring-4 ring-purple-300 scale-105'
                    : 'bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50'
                }`}
              >
                <span>🔔 جرس ريوف</span>
                <span className="text-xs font-normal">اضغطي أولاً للإجابة</span>
              </button>
            </div>

            {/* Options when Buzzer is active */}
            {activeBuzzer && (
              <div className="p-5 rounded-3xl bg-amber-500/15 border-2 border-amber-500/40 space-y-3 animate-pulse">
                <p className="text-xs font-black text-amber-950 dark:text-amber-300 text-center">
                  🔔 الدور الآن لـ <strong>{activeBuzzer}</strong> اختيار الترجمة الصحيحة:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    OXFORD_3000[buzzIndex % OXFORD_3000.length]?.arabic,
                    'خيار خطأ 1',
                    'خيار خطأ 2',
                    'خيار خطأ 3',
                  ]
                    .sort(() => 0.5 - Math.random())
                    .map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() =>
                          handleAnswerBuzzerOption(
                            opt,
                            OXFORD_3000[buzzIndex % OXFORD_3000.length]?.arabic
                          )
                        }
                        className="p-3 rounded-xl bg-slate-900 text-white font-black text-sm font-arabic hover:bg-slate-800"
                      >
                        {opt}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
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
