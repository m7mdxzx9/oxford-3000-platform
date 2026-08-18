/**
 * ============================================================================
 * File: src/components/WordChainGame.jsx
 * Purpose: Word Chain Game with Solo AI & WebRTC Duo-Player Multiplayer
 * Connected To: webrtcGame.js, audioService.js, oxford3000.js, AppContext.jsx
 * Description:
 *   Supports two distinct game modes:
 *     1. Solo Mode (الذكاء الاصطناعي): Practice word chaining against Oxford AI bot.
 *     2. Duo Multiplayer (مبارزة ثنائية WebRTC): Real-time P2P turn-based battle
 *        with 15s turn timer, room codes, dictionary validation, and live sync.
 * ============================================================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Users,
  Copy,
  Check,
  Share2,
  Clock,
  Radio,
} from 'lucide-react';
import { OXFORD_3000 } from '../data/oxford3000Data';
import { playAudio } from '../services/audioService';
import { useApp } from '../context/AppContext';
import { WebRtcGameSession, WEBRTC_PACKETS } from '../services/webrtcGame';

export default function WordChainGame() {
  const { t, voicePreset, addNotification, addXp } = useApp();

  // Mode Selection: 'solo' | 'duo'
  const [gameMode, setGameMode] = useState('solo');

  // Solo / Shared Game State
  const [chain, setChain] = useState([]);
  const [usedWords, setUsedWords] = useState(new Set());
  const [inputWord, setInputWord] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedWordModal, setSelectedWordModal] = useState(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [turnTimer, setTurnTimer] = useState(15);

  // WebRTC Multiplayer State
  const [webRtcSession, setWebRtcSession] = useState(null);
  const [duoState, setDuoState] = useState('lobby'); // 'lobby' | 'hosting' | 'joining' | 'playing' | 'gameover'
  const [roomCode, setRoomCode] = useState('');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [opponentName, setOpponentName] = useState('المنافس');
  const [copiedLink, setCopiedLink] = useState(false);

  const logEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fast lookup map for Oxford 3000 dataset
  const oxfordMap = useMemo(() => {
    const map = new Map();
    OXFORD_3000.forEach((item) => {
      if (item && item.word) {
        const clean = item.word.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (clean && !map.has(clean)) {
          map.set(clean, item);
        }
      }
    });
    return map;
  }, []);

  // Required starting letter for next turn
  const requiredNextLetter = useMemo(() => {
    if (chain.length === 0) return '';
    const lastPlayed = chain[chain.length - 1].word;
    const clean = lastPlayed.toLowerCase().replace(/[^a-z]/g, '');
    return clean ? clean.slice(-1) : '';
  }, [chain]);

  // Turn Countdown Timer (15 Seconds)
  useEffect(() => {
    if (chain.length === 0 || (gameMode === 'solo' && isBotThinking)) return;
    if (gameMode === 'duo' && (!isMyTurn || duoState !== 'playing')) return;

    setTurnTimer(15);
    const timer = setInterval(() => {
      setTurnTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (gameMode === 'duo') {
            handleDuoTimeout();
          } else {
            setErrorMessage('⌛ انتهى الوقت المخصص لدورك! تم إعادة ضبط السلسلة.');
            setStreak(0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [chain, isBotThinking, gameMode, isMyTurn, duoState]);

  // Auto-scroll chain log
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chain, isBotThinking]);

  // Clear toast error message
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // ==========================================
  // WebRTC Multiplayer Event Handlers
  // ==========================================
  const startHosting = () => {
    const session = new WebRtcGameSession({
      onOpen: (id) => {
        setRoomCode(id);
        setDuoState('hosting');
      },
      onConnected: () => {
        setDuoState('playing');
        setIsMyTurn(true);
        setIsHost(true);
        setChain([]);
        setUsedWords(new Set());
        addNotification({ type: 'success', message: 'انضم المنافس للمبارزة! دورك للبدء 🎮' });
      },
      onData: (packet) => handleIncomingPacket(packet),
      onDisconnected: () => {
        addNotification({ type: 'warning', message: 'انقطع الاتصال مع المنافس.' });
        setDuoState('lobby');
      },
      onError: (err) => {
        setErrorMessage('تعذر إنشاء الاتصال عبر WebRTC.');
      },
    });

    session.initHost();
    setWebRtcSession(session);
  };

  const joinExistingRoom = () => {
    if (!inputRoomCode.trim()) return;
    const session = new WebRtcGameSession({
      onOpen: () => {
        setDuoState('joining');
      },
      onConnected: () => {
        setDuoState('playing');
        setIsMyTurn(false);
        setIsHost(false);
        setChain([]);
        setUsedWords(new Set());
        addNotification({ type: 'success', message: 'تم الاتصال بالغرفة بنجاح! انتظر دور المنافس.' });
      },
      onData: (packet) => handleIncomingPacket(packet),
      onDisconnected: () => {
        addNotification({ type: 'warning', message: 'انقطع الاتصال مع المضيف.' });
        setDuoState('lobby');
      },
      onError: () => {
        setErrorMessage('تعذر الاتصال بالغرفة المحددة. تأكد من صحة الرمز.');
        setDuoState('lobby');
      },
    });

    session.joinRoom(inputRoomCode);
    setWebRtcSession(session);
  };

  const handleIncomingPacket = (packet) => {
    if (!packet || typeof packet !== 'object' || !packet.type) return;

    switch (packet.type) {
      case WEBRTC_PACKETS.WORD_PLAYED: {
        const payload = packet.payload;
        if (!payload || !payload.wordObj || typeof payload.wordObj.word !== 'string') return;
        
        const rawWord = payload.wordObj.word.trim();
        if (rawWord.length === 0 || rawWord.length > 50) return;
        
        const cleanWord = rawWord.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!cleanWord) return;

        // Verify it against the Oxford dictionary
        const found = oxfordMap.get(cleanWord);
        const verifiedWordObj = found || {
          word: rawWord.replace(/[^a-zA-Z\s-]/g, ''),
          arabic: typeof payload.wordObj.arabic === 'string' ? payload.wordObj.arabic.slice(0, 100) : '',
          pos: typeof payload.wordObj.pos === 'string' ? payload.wordObj.pos.slice(0, 20) : 'word',
          cefr: typeof payload.wordObj.cefr === 'string' ? payload.wordObj.cefr.slice(0, 5) : 'B1',
        };

        setChain((prev) => [...prev, { ...verifiedWordObj, playedBy: 'opponent' }]);
        setUsedWords((prev) => new Set([...prev, cleanWord]));
        setIsMyTurn(true);
        playAudio(verifiedWordObj.word, { presetId: voicePreset });
        break;
      }

      case WEBRTC_PACKETS.TIMEOUT_FAIL: {
        // Only accept timeout fail if it was the opponent's turn
        if (!isMyTurn && duoState === 'playing') {
          addNotification({ type: 'success', message: 'فاز دورك! انتهى وقت المنافس دون إجابة 🏆' });
          addXp(50);
          setIsMyTurn(true);
        }
        break;
      }

      case WEBRTC_PACKETS.REMATCH: {
        setChain([]);
        setUsedWords(new Set());
        setIsMyTurn(!isHost);
        addNotification({ type: 'info', message: 'بدأت جولة جديدة من السلسلة!' });
        break;
      }

      default:
        break;
    }
  };

  const handleDuoTimeout = () => {
    if (webRtcSession) {
      webRtcSession.sendPacket(WEBRTC_PACKETS.TIMEOUT_FAIL, {});
    }
    setErrorMessage('⌛ انتهى وقتك المحدد (15 ثانية)! فاز المنافس بهذه الجولة.');
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    addNotification({ type: 'success', message: 'تم نسخ رمز الغرفة للحافظة!' });
  };

  // ==========================================
  // Word Submission Logic
  // ==========================================
  const handleWordSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (gameMode === 'duo' && !isMyTurn) {
      setErrorMessage('انتظر دور المنافس!');
      return;
    }

    const rawInput = inputWord.trim();
    if (!rawInput) return;

    const cleanInput = rawInput.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanInput) {
      setErrorMessage('الرجاء إدخال كلمة إنجليزية صالحة.');
      return;
    }

    // Rule 1: Oxford 3000 validation
    const foundWord = oxfordMap.get(cleanInput);
    if (!foundWord) {
      setErrorMessage(`الكلمة "${rawInput}" غير موجودة في قاموس أكسفورد الـ 3000!`);
      return;
    }

    // Rule 2: Last letter chaining rule
    if (requiredNextLetter && !cleanInput.startsWith(requiredNextLetter)) {
      setErrorMessage(`يجب أن تبدأ الكلمة بحرف '${requiredNextLetter.toUpperCase()}'!`);
      return;
    }

    // Rule 3: No duplicate words in round
    if (usedWords.has(cleanInput)) {
      setErrorMessage(`الكلمة "${foundWord.word}" تم استخدامها بالفعل في هذه الجولة!`);
      return;
    }

    const entry = {
      ...foundWord,
      playedBy: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update Local State
    setChain((prev) => [...prev, entry]);
    setUsedWords((prev) => new Set([...prev, cleanInput]));
    setInputWord('');
    setScore((prev) => prev + 10 + streak * 2);
    setStreak((prev) => prev + 1);
    addXp(10);

    playAudio(foundWord.word, { presetId: voicePreset });

    // Mode Branching:
    if (gameMode === 'duo') {
      // Broadcast to Peer
      if (webRtcSession) {
        webRtcSession.sendPacket(WEBRTC_PACKETS.WORD_PLAYED, { wordObj: entry });
      }
      setIsMyTurn(false);
    } else {
      // Trigger Solo AI Bot Turn
      triggerBotTurn(cleanInput);
    }
  };

  // Solo AI Bot turn simulation
  const triggerBotTurn = (userCleanWord) => {
    setIsBotThinking(true);
    const lastChar = userCleanWord.slice(-1);

    setTimeout(() => {
      const candidates = OXFORD_3000.filter((item) => {
        if (!item || !item.word) return false;
        const clean = item.word.toLowerCase().replace(/[^a-z0-9]/g, '');
        return clean.startsWith(lastChar) && !usedWords.has(clean) && clean !== userCleanWord;
      });

      if (candidates.length === 0) {
        setErrorMessage(`🎉 مذهل! استسلم الذكاء الاصطناعي لعدم وجود كلمات تبدأ بحرف '${lastChar.toUpperCase()}'!`);
        setIsBotThinking(false);
        return;
      }

      const botChoice = candidates[Math.floor(Math.random() * candidates.length)];
      const botClean = botChoice.word.toLowerCase().replace(/[^a-z0-9]/g, '');

      const botEntry = {
        ...botChoice,
        playedBy: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChain((prev) => [...prev, botEntry]);
      setUsedWords((prev) => new Set([...prev, botClean]));
      setIsBotThinking(false);
      playAudio(botChoice.word, { presetId: voicePreset });
    }, 1200);
  };

  const handleRestart = () => {
    setChain([]);
    setUsedWords(new Set());
    setInputWord('');
    setScore(0);
    setStreak(0);
    setErrorMessage('');
    if (gameMode === 'duo' && webRtcSession) {
      webRtcSession.sendPacket(WEBRTC_PACKETS.REMATCH, {});
      setIsMyTurn(isHost);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-arabic">
      {/* Header & Mode Switcher */}
      <div className="card-theme-target p-6 sm:p-8 rounded-3xl border shadow-xl text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 theme-btn-primary rounded-2xl shadow-md">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black">سلسلة كلمات أكسفورد 3000™</h2>
            <p className="text-xs sm:text-sm font-medium opacity-80">
              اربط الكلمات بالحرف الأخير مع التحقق الفوري من القاموس ومبارزات WebRTC P2P الحية
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-center gap-2 p-1 rounded-2xl box-surface border max-w-sm mx-auto">
          <button
            onClick={() => {
              setGameMode('solo');
              handleRestart();
            }}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              gameMode === 'solo' ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>لعب فردي (AI)</span>
          </button>

          <button
            onClick={() => {
              setGameMode('duo');
              handleRestart();
            }}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              gameMode === 'duo' ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>مبارزة ثنائية (WebRTC)</span>
          </button>
        </div>
      </div>

      {/* DUO WEBRTC LOBBY (If in Duo mode and not playing) */}
      {gameMode === 'duo' && duoState !== 'playing' && (
        <div className="card-theme-target p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-500 text-xs font-bold flex items-center gap-2">
              <Radio className="w-5 h-5 shrink-0 animate-pulse" />
              <span>اتصال مباشر فوري Peer-to-Peer (WebRTC) دون خادم وسيط.</span>
            </div>

            {duoState === 'lobby' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Host Game */}
                <div className="p-5 rounded-2xl box-surface border space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-blue-500 mb-1">إنشاء غرفة جديدة</h3>
                    <p className="text-xs opacity-75">أنشئ غرفة وشارك الرمز مع صديقك للمبارزة مباشرة.</p>
                  </div>
                  <button
                    onClick={startHosting}
                    className="w-full py-2.5 rounded-xl theme-btn-primary text-xs font-black shadow-md cursor-pointer"
                  >
                    إنشاء غرفة وتوليد الرمز ⚡
                  </button>
                </div>

                {/* Join Game */}
                <div className="p-5 rounded-2xl box-surface border space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-emerald-500 mb-1">الانضمام لغرفة</h3>
                    <p className="text-xs opacity-75">أدخل رمز الغرفة التي أنشأها صديقك.</p>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={inputRoomCode}
                      onChange={(e) => setInputRoomCode(e.target.value)}
                      placeholder="أدخل رمز الغرفة (مثال: oxf-abc12)"
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono font-bold border text-center"
                    />
                    <button
                      onClick={joinExistingRoom}
                      disabled={!inputRoomCode.trim()}
                      className="w-full py-2.5 rounded-xl theme-btn-secondary border text-xs font-black shadow-sm cursor-pointer"
                    >
                      انضمام للمبارزة ➔
                    </button>
                  </div>
                </div>
              </div>
            )}

            {duoState === 'hosting' && (
              <div className="p-6 rounded-2xl box-surface border space-y-4 animate-in fade-in">
                <h3 className="text-lg font-black text-amber-500">في انتظار انضمام المنافس...</h3>
                <p className="text-xs opacity-75">شارك هذا الرمز مع صديقك للبدء فوراً:</p>

                <div className="flex items-center justify-center gap-2">
                  <span className="px-4 py-2 rounded-xl border bg-black/10 dark:bg-white/10 font-mono text-xl font-black text-amber-400 tracking-wider">
                    {roomCode}
                  </span>
                  <button
                    onClick={copyRoomCode}
                    className="p-2.5 rounded-xl theme-btn-primary shadow-sm cursor-pointer"
                    title="نسخ الرمز"
                  >
                    {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {duoState === 'joining' && (
              <div className="p-6 rounded-2xl box-surface border space-y-3 animate-in fade-in">
                <Clock className="w-8 h-8 text-blue-500 mx-auto animate-spin" />
                <h3 className="text-base font-black">جاري الاتصال بالغرفة المحددة عبر WebRTC...</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GAME BOARD (Active in Solo mode or Duo Playing) */}
      {(gameMode === 'solo' || duoState === 'playing') && (
        <div className="card-theme-target p-5 sm:p-7 rounded-3xl border shadow-xl space-y-5">
          {/* Status Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold opacity-75">النقاط:</span>
              <span className="text-sm font-mono font-black text-emerald-400 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                {score} XP
              </span>
            </div>

            {/* Turn & Countdown Timer */}
            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1 rounded-xl border text-xs font-black flex items-center gap-1.5 ${
                  (gameMode === 'solo' && !isBotThinking) || (gameMode === 'duo' && isMyTurn)
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {gameMode === 'duo'
                    ? isMyTurn
                      ? `دورك الآن (${turnTimer}s)`
                      : 'دور المنافس...'
                    : `دورك (${turnTimer}s)`}
                </span>
              </div>
            </div>

            {/* Next Required Letter Indicator */}
            {requiredNextLetter && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold opacity-75">الحرف المطلوب:</span>
                <span className="w-7 h-7 rounded-xl theme-btn-primary flex items-center justify-center font-mono font-black text-sm uppercase shadow-sm">
                  {requiredNextLetter}
                </span>
              </div>
            )}
          </div>

          {/* Chain Chat / Log Area */}
          <div className="min-h-[220px] max-h-[360px] overflow-y-auto p-3 rounded-2xl box-surface border space-y-2.5">
            {chain.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                <Sparkles className="w-8 h-8 mb-2 animate-bounce" />
                <p className="text-xs font-bold">ابدأ السلسلة بكتابة أي كلمة إنجليزية من قائمة أكسفورد 3000!</p>
              </div>
            ) : (
              chain.map((entry, index) => {
                const isUser = entry.playedBy === 'user';
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-xs shrink-0">
                        {gameMode === 'duo' ? <Users className="w-3.5 h-3.5 text-blue-400" /> : <Bot className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-2xl max-w-[80%] border shadow-sm space-y-1 ${
                        isUser
                          ? 'theme-btn-primary rounded-te-none text-start'
                          : 'box-surface rounded-ts-none text-start border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span dir="ltr" className="ltr-isolate font-black text-sm">
                          {entry.word}
                        </span>
                        <button
                          onClick={() => playAudio(entry.word, { presetId: voicePreset })}
                          className="opacity-70 hover:opacity-100 p-0.5"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] opacity-80">{entry.arabic}</p>
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-xl theme-btn-primary flex items-center justify-center text-xs shrink-0 font-bold">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={logEndRef} />
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Word Input Form */}
          <form onSubmit={handleWordSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                dir="ltr"
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value)}
                disabled={(gameMode === 'duo' && !isMyTurn) || isBotThinking}
                placeholder={
                  requiredNextLetter
                    ? `أدخل كلمة تبدأ بحرف '${requiredNextLetter.toUpperCase()}'...`
                    : 'أدخل أي كلمة إنجليزية للبدء...'
                }
                className="w-full px-4 py-3 rounded-2xl glass-input text-sm font-bold border focus:outline-none disabled:opacity-50"
              />
              {requiredNextLetter && (
                <span className="absolute start-3 top-3 px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-xs font-mono font-bold opacity-60">
                  {requiredNextLetter.toUpperCase()}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!inputWord.trim() || (gameMode === 'duo' && !isMyTurn) || isBotThinking}
              className="p-3 sm:px-5 sm:py-3 rounded-2xl theme-btn-primary text-xs font-black shadow-md flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
              <span className="hidden sm:inline">إرسال</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="p-3 rounded-2xl theme-btn-secondary border opacity-70 hover:opacity-100 cursor-pointer"
              title="إعادة بدء السلسلة"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
