import React, { useState } from 'react';
import { Volume2, Sparkles, HelpCircle, CheckCircle2, XCircle, RotateCcw, Flame, ArrowRight, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playWordAudio } from '../services/audioService';
import { playSuccessChime } from '../services/soundEffects';
import LiveEqualizer from './LiveEqualizer';

const MINIMAL_PAIRS_DATA = [
  {
    id: 1,
    title: '/ɪ/ (قصير) مقابل /iː/ (طويل)',
    contrast: 'Short I vs Long EE',
    tip: 'في /ɪ/ عضلات الفم مسترخية، بينما في /iː/ تبتسم ابتسامة عريضة ويمتد الصوت.',
    pairs: [
      { wordA: 'ship', ipaA: '/ʃɪp/', meaningA: 'سفينة', wordB: 'sheep', ipaB: '/ʃiːp/', meaningB: 'خروف' },
      { wordA: 'fit', ipaA: '/fɪt/', meaningA: 'مناسب / لائق', wordB: 'feet', ipaB: '/fiːt/', meaningB: 'أقدام' },
      { wordA: 'live', ipaA: '/lɪv/', meaningA: 'يعيش', wordB: 'leave', ipaB: '/liːv/', meaningB: 'يغادر / يترك' },
      { wordA: 'sit', ipaA: '/sɪt/', meaningA: 'يجلس', wordB: 'seat', ipaB: '/siːt/', meaningB: 'مقعد' },
      { wordA: 'hit', ipaA: '/hɪt/', meaningA: 'يضرب', wordB: 'heat', ipaB: '/hiːt/', meaningB: 'حرارة' },
    ],
  },
  {
    id: 2,
    title: '/e/ مقابل /æ/ (الفتحة العريضة)',
    contrast: 'E vs Open A',
    tip: 'في /e/ الفك مفتوح قليلاً، أما في /æ/ تفتح فكك للأسفل بوضوح.',
    pairs: [
      { wordA: 'pen', ipaA: '/pen/', meaningA: 'قلم', wordB: 'pan', ipaB: '/pæn/', meaningB: 'مقلاة' },
      { wordA: 'bed', ipaA: '/bed/', meaningA: 'سرير', wordB: 'bad', ipaB: '/bæd/', meaningB: 'سيء' },
      { wordA: 'men', ipaA: '/men/', meaningA: 'رجال', wordB: 'man', ipaB: '/mæn/', meaningB: 'رجل' },
      { wordA: 'head', ipaA: '/hed/', meaningA: 'رأس', wordB: 'had', ipaB: '/hæd/', meaningB: 'كان يملك' },
    ],
  },
  {
    id: 3,
    title: '/ʊ/ مقابل /uː/ (الضمة الخفيفة والعميقة)',
    contrast: 'Short U vs Long OO',
    tip: 'في /ʊ/ الشفاه مسترخية، أما في /uː/ تُضم الشفاه بإحكام كأنك تصفر.',
    pairs: [
      { wordA: 'pull', ipaA: '/pʊl/', meaningA: 'يسحب', wordB: 'pool', ipaB: '/puːl/', meaningB: 'مسبح' },
      { wordA: 'full', ipaA: '/fʊl/', meaningA: 'ممتلئ', wordB: 'fool', ipaB: '/fuːl/', meaningB: 'أحمق' },
    ],
  },
  {
    id: 4,
    title: '/θ/ (الثاء) مقابل /s/ أو /f/',
    contrast: 'TH Sound vs S / F',
    tip: 'في /θ/ يوضع طرف اللسان بين الأسنان الأمامية.',
    pairs: [
      { wordA: 'think', ipaA: '/θɪŋk/', meaningA: 'يفكر / يعتقد', wordB: 'sink', ipaB: '/sɪŋk/', meaningB: 'يغرق / مغسلة' },
      { wordA: 'three', ipaA: '/θriː/', meaningA: 'ثلاثة', wordB: 'free', ipaB: '/friː/', meaningB: 'حر / مجاني' },
    ],
  },
];

export default function MinimalPairsTrainer() {
  const { voicePreset, audioSpeed } = useApp();
  const [selectedCategory, setSelectedCategory] = useState(MINIMAL_PAIRS_DATA[0]);
  const [activePlaying, setActivePlaying] = useState(null);

  // Ear Training Game Mode state
  const [testMode, setTestMode] = useState(false);
  const [testTarget, setTestTarget] = useState(null); // 'A' or 'B'
  const [currentTestPair, setCurrentTestPair] = useState(null);
  const [userChoice, setUserChoice] = useState(null);
  const [testScore, setTestScore] = useState(0);
  const [testStreak, setTestStreak] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const handlePlay = async (word, key) => {
    setActivePlaying(key);
    await playWordAudio(word, { preset: voicePreset, speed: audioSpeed });
    setActivePlaying(null);
  };

  const startEarQuiz = () => {
    setTestMode(true);
    setTestScore(0);
    setTestStreak(0);
    loadNextQuizQuestion();
  };

  const loadNextQuizQuestion = () => {
    setUserChoice(null);
    const allPairs = selectedCategory.pairs;
    const randomPair = allPairs[Math.floor(Math.random() * allPairs.length)];
    const target = Math.random() > 0.5 ? 'A' : 'B';
    setCurrentTestPair(randomPair);
    setTestTarget(target);

    // Auto-play the target word
    setTimeout(() => {
      const wordToPlay = target === 'A' ? randomPair.wordA : randomPair.wordB;
      handlePlay(wordToPlay, 'quiz-target');
    }, 300);
  };

  const handleQuizAnswer = (choice) => {
    if (userChoice !== null) return;
    setUserChoice(choice);

    const isCorrect = choice === testTarget;
    if (isCorrect) {
      setTestScore((s) => s + 10);
      setTestStreak((st) => st + 1);
      try {
        playSuccessChime();
      } catch (e) {}
    } else {
      setTestStreak(0);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 450);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border shadow-xl card-theme-target space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold text-xl">
              🎧
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-arabic flex items-center gap-2">
                <span>مدرب الأصوات المتشابهة المشوشة</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-mono font-bold">
                  Minimal Pairs
                </span>
              </h2>
              <p className="text-xs sm:text-sm opacity-75 font-arabic">
                تدرّب على التمييز الصوتي الدقيق بين الكلمات الإنجليزية ذات النطق المتقارب
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (testMode) {
                setTestMode(false);
              } else {
                startEarQuiz();
              }
            }}
            className="px-4 py-2 rounded-2xl theme-btn-primary text-xs font-black flex items-center gap-2 shadow-md active:scale-95 cursor-pointer font-arabic"
          >
            {testMode ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>العودة لجدول المقارنة</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>بدء اختبار تمييز الأذن (Ear Quiz)</span>
              </>
            )}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t">
          {MINIMAL_PAIRS_DATA.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat);
                if (testMode) startEarQuiz();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory.id === cat.id
                  ? 'theme-btn-primary shadow-sm scale-102'
                  : 'theme-btn-secondary opacity-75 hover:opacity-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-arabic">{cat.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode 1: Ear Training Quiz Mode */}
      {testMode && currentTestPair && (
        <div
          className={`glass-panel p-6 sm:p-8 rounded-3xl border shadow-2xl card-theme-target space-y-6 text-center ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          <div className="flex items-center justify-between font-mono text-xs opacity-75">
            <span className="font-arabic">أي كلمة سمعتها للتو؟</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Flame className="w-4 h-4" /> {testStreak}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-500 font-bold">
                {testScore} XP
              </span>
            </div>
          </div>

          {/* Sound Replay button */}
          <div className="py-4">
            <button
              onClick={() => {
                const w = testTarget === 'A' ? currentTestPair.wordA : currentTestPair.wordB;
                handlePlay(w, 'quiz-target');
              }}
              className="w-20 h-20 mx-auto rounded-full theme-btn-primary flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="إعادة سماع الصوت"
            >
              <Volume2 className="w-8 h-8" />
            </button>
            <div className="mt-2 flex items-center justify-center gap-2">
              <LiveEqualizer isPlaying={activePlaying === 'quiz-target'} />
              <span className="text-xs font-mono opacity-70 font-arabic">انقر لإعادة السماع</span>
            </div>
          </div>

          {/* 2 Big Choice Buttons: Option A vs Option B */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Word A */}
            <button
              onClick={() => handleQuizAnswer('A')}
              disabled={userChoice !== null}
              className={`p-6 rounded-3xl border text-center transition-all active:scale-95 space-y-2 ${
                userChoice !== null
                  ? testTarget === 'A'
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/40 shadow-xl'
                    : userChoice === 'A'
                    ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/40 shadow-xl'
                    : 'opacity-40'
                  : 'theme-btn-secondary hover:scale-102'
              }`}
            >
              <div className="text-2xl sm:text-3xl font-black font-mono ltr-token">
                {currentTestPair.wordA}
              </div>
              <div className="text-xs font-mono opacity-80">{currentTestPair.ipaA}</div>
              <div className="text-sm font-bold font-arabic">{currentTestPair.meaningA}</div>
            </button>

            {/* Word B */}
            <button
              onClick={() => handleQuizAnswer('B')}
              disabled={userChoice !== null}
              className={`p-6 rounded-3xl border text-center transition-all active:scale-95 space-y-2 ${
                userChoice !== null
                  ? testTarget === 'B'
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/40 shadow-xl'
                    : userChoice === 'B'
                    ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/40 shadow-xl'
                    : 'opacity-40'
                  : 'theme-btn-secondary hover:scale-102'
              }`}
            >
              <div className="text-2xl sm:text-3xl font-black font-mono ltr-token">
                {currentTestPair.wordB}
              </div>
              <div className="text-xs font-mono opacity-80">{currentTestPair.ipaB}</div>
              <div className="text-sm font-bold font-arabic">{currentTestPair.meaningB}</div>
            </button>
          </div>

          {/* Next Button */}
          {userChoice !== null && (
            <div className="pt-4 border-t flex justify-end dropdown-animate">
              <button
                onClick={loadNextQuizQuestion}
                className="px-6 py-3 rounded-2xl theme-btn-primary font-black text-sm flex items-center gap-2 shadow-lg active:scale-95"
              >
                <span className="font-arabic">السؤال التالي</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Browse Comparison Cards */}
      {!testMode && (
        <div className="space-y-4">
          {/* Tip Box */}
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs sm:text-sm font-medium space-y-1 font-arabic">
            <div className="font-black text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>نصيحة النطق ومخرج الحروف:</span>
            </div>
            <p className="opacity-90">{selectedCategory.tip}</p>
          </div>

          {/* Minimal Pairs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedCategory.pairs.map((p, idx) => (
              <div
                key={idx}
                className="glass-panel p-4 sm:p-5 rounded-3xl border shadow-lg card-theme-target space-y-3"
              >
                <div className="grid grid-cols-2 gap-3 divide-x rtl:divide-x-reverse divide-black/10 dark:divide-white/10">
                  {/* Pair Word A */}
                  <div className="space-y-2 text-center p-2">
                    <div className="text-xl font-black ltr-token font-mono">{p.wordA}</div>
                    <div className="text-xs font-mono text-cyan-500">{p.ipaA}</div>
                    <div className="text-xs font-bold font-arabic opacity-75">{p.meaningA}</div>
                    <button
                      onClick={() => handlePlay(p.wordA, `pair-${idx}-a`)}
                      className="w-full py-2 rounded-xl theme-btn-secondary text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-cyan-500" />
                      <LiveEqualizer isPlaying={activePlaying === `pair-${idx}-a`} />
                      <span className="font-arabic">نطق A</span>
                    </button>
                  </div>

                  {/* Pair Word B */}
                  <div className="space-y-2 text-center p-2">
                    <div className="text-xl font-black ltr-token font-mono">{p.wordB}</div>
                    <div className="text-xs font-mono text-purple-500">{p.ipaB}</div>
                    <div className="text-xs font-bold font-arabic opacity-75">{p.meaningB}</div>
                    <button
                      onClick={() => handlePlay(p.wordB, `pair-${idx}-b`)}
                      className="w-full py-2 rounded-xl theme-btn-secondary text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-purple-500" />
                      <LiveEqualizer isPlaying={activePlaying === `pair-${idx}-b`} />
                      <span className="font-arabic">نطق B</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
