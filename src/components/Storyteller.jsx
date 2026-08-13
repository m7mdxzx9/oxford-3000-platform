import React, { useState } from 'react';
import { BookOpen, Sparkles, RefreshCw, Volume2, Mic, MicOff, Languages, Trash2, HelpCircle, CheckCircle, Plus, Dice5, Play, Pause, Award, Maximize2, Minimize2, Type, Sun, Moon, Book, ChevronRight, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateStory } from '../services/geminiService';
import { playAudio, stopAudio } from '../services/audioService';
import { recordAndEvaluateSpeech, stopListening } from '../services/speechEvaluation';
import { oxford3000Data } from '../data/oxford3000';
import SentenceTokenViewer from './SentenceTokenViewer';
import SpeechScoreVisualizer from './SpeechScoreVisualizer';
import AudioSpeedControl from './AudioSpeedControl';

// Reading Mode Theme Presets with high-contrast text tokens
const READING_THEMES = {
  sepia: {
    id: 'sepia',
    label: 'Sepia Warm (ورقي دافئ)',
    bg: 'bg-[#fbf4e9]',
    text: 'text-[#231812]',
    border: 'border-[#dfcfb9]',
    accent: 'bg-[#8c6d52]/15 text-[#3b2719] border-[#8c6d52]/40',
    arText: 'text-[#3b2719]',
    quizText: 'text-[#441a63]',
    optBtn: 'bg-[#fffdf9] border-[#d8c6ac] text-[#1f140e] hover:bg-[#f3e6d3] font-bold shadow-sm',
  },
  dark: {
    id: 'dark',
    label: 'Midnight Dark (ليلي مريح)',
    bg: 'bg-[#090d16]',
    text: 'text-slate-100',
    border: 'border-slate-800',
    accent: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    arText: 'text-amber-300',
    quizText: 'text-purple-300',
    optBtn: 'bg-slate-900 border-slate-800 text-slate-100 hover:bg-slate-800 font-bold',
  },
  light: {
    id: 'light',
    label: 'Pure Light (ناصع ناصع)',
    bg: 'bg-white',
    text: 'text-slate-950',
    border: 'border-slate-300',
    accent: 'bg-indigo-500/15 text-indigo-950 border-indigo-500/40',
    arText: 'text-amber-950',
    quizText: 'text-purple-950',
    optBtn: 'bg-slate-50 border-slate-300 text-slate-950 hover:bg-slate-100 font-bold shadow-sm',
  },
};

export default function Storyteller() {
  const { selectedWords, toggleSelectWord, clearSelectedWords, apiKey, addNotification, t, voicePreset, setVoicePreset, voicePresets, audioSpeed, setAudioSpeed } = useApp();
  const [genre, setGenre] = useState('detective');
  const [cefrLevel, setCefrLevel] = useState('B2');
  const [storyLength, setStoryLength] = useState('epic'); // 'short' (3), 'medium' (5), 'epic' (8)
  const [showArabic, setShowArabic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isPlayingFullStory, setIsPlayingFullStory] = useState(false);

  // Reader Experience Customizer State
  const [readingTheme, setReadingTheme] = useState('sepia');
  const [fontSize, setFontSize] = useState('text-base'); // text-sm, text-base, text-lg, text-xl
  const [isFocusReaderMode, setIsFocusReaderMode] = useState(false);
  const [activeChapterTab, setActiveChapterTab] = useState(0); // 0 to N-1

  // Initial Multi-Chapter Long Epic Novel Sample
  const [storyLines, setStoryLines] = useState([
    {
      sceneNumber: 1,
      sceneTitle: 'Chapter 1: The Echo of the Sealed Letter',
      text: 'Late into the rainy night, Detective Jameson stood near his desk inspecting an unusual wax-sealed envelope. The mysterious letter requested his unique ability to decode an ancient manuscript that had puzzled scholars for over a century. Intrigued by the prospect of an unmapped adventure, he immediately agreed to embark on the secret investigation.',
      arabic: 'في وقت متأخر من الليل الممطر، وقف المحقق جيمسون بالقرب من مكتبه يعاين مظروفًا غامضًا مختومًا والشمع. طلبت الرسالة الغامضة قدرته الفريدة على فك تشفير مخطوطة قديمة تحيرت بها العلماء لأكثر من قرن. ومُثارًا باحتمال خوض مغامرة غير مستكشفة، وافق فورًا على البدء في التحقيق السري.',
      focusWord: 'ability',
      comprehensionQuestion: 'What unique skill did the mysterious letter request from Jameson?',
      options: [
        'His ability to decode an ancient manuscript',
        'His ability to drive fast vehicles',
        'His ability to speak five foreign languages',
        'His ability to paint historic portraits'
      ],
      correctAnswer: 'His ability to decode an ancient manuscript',
      wordTranslations: { ability: 'قدرة', adventure: 'مغامرة', inspect: 'معاينة', manuscript: 'مخطوطة' }
    },
    {
      sceneNumber: 2,
      sceneTitle: 'Chapter 2: The Crossing to Eldoria',
      text: 'To achieve his ultimate objective, Jameson knew he must abandon his comfortable city life. Traveling deep into the misty pine forests of Eldoria, he confronted harsh terrain and unpredictable weather, yet his resolve remained unshakable.',
      arabic: 'لتحقيق هدفه النهائي، علم جيمسون أنه يجب عليه التخلي عن حياته المريحة في المدينة. وسافرت عميقًا في غابات الصنوبر الضبابية في إلدوريا، مواجهًا تضاريس قاسية وطقسًا غير متوقع، لكن عزيمته ظلت لا تتزعزع.',
      focusWord: 'achieve',
      comprehensionQuestion: 'Where did Jameson travel after leaving his comfortable city life?',
      options: [
        'To a coastal tropical island',
        'Into the misty pine forests of Eldoria',
        'To a busy underground subway station',
        'To a desert fortress in Egypt'
      ],
      correctAnswer: 'Into the misty pine forests of Eldoria',
      wordTranslations: { achieve: 'تحقيق', abandon: 'التخلي', terrain: 'تضاريس', objective: 'هدف' }
    }
  ]);

  const [activeLineIndex, setActiveLineIndex] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lineSpeechResults, setLineSpeechResults] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);

  // Random Words Picker
  const handlePickRandomWords = () => {
    const shuffled = [...oxford3000Data].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 5);
    picked.forEach((w) => toggleSelectWord(w));
    addNotification(`Selected 5 random words for Epic AI Novel!`, 'info');
  };

  // Generate Long Epic AI Story
  const handleGenerateStory = async () => {
    setLoading(true);
    setLineSpeechResults({});
    setUserAnswers({});
    setQuizScore(null);
    setActiveLineIndex(null);
    setActiveChapterTab(0);

    try {
      const wordsToUse = selectedWords.length > 0 ? selectedWords : ['abandon', 'ability', 'achieve', 'adventure'];
      const lines = await generateStory(wordsToUse, genre, cefrLevel, apiKey, storyLength);
      if (lines && lines.length > 0) {
        setStoryLines(lines);
        addNotification(`Generated ${lines.length}-Chapter Epic AI ${genre} Novel (${cefrLevel})`, 'success');
      } else {
        addNotification('Failed to generate epic novel.', 'error');
      }
    } catch (err) {
      addNotification('Error generating epic novel with AI.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Play Individual Chapter Audio
  const handlePlayLine = (text) => {
    playAudio(text, { speed: audioSpeed, presetId: voicePreset });
  };

  // Play Full Story Audio Narration
  const handlePlayFullStory = async () => {
    if (isPlayingFullStory) {
      stopAudio();
      setIsPlayingFullStory(false);
      return;
    }

    setIsPlayingFullStory(true);
    for (let i = 0; i < storyLines.length; i++) {
      setActiveChapterTab(i);
      setActiveLineIndex(i);
      await playAudio(storyLines[i].text, { speed: audioSpeed, presetId: voicePreset });
    }
    setIsPlayingFullStory(false);
    setActiveLineIndex(null);
  };

  // Mic Speech Practice
  const handleRecordLine = (index, targetText) => {
    if (isRecording && activeLineIndex === index) {
      stopListening();
      setIsRecording(false);
      setActiveLineIndex(null);
      return;
    }

    setIsRecording(true);
    setActiveLineIndex(index);

    recordAndEvaluateSpeech(
      targetText,
      (res) => {
        setIsRecording(false);
        setActiveLineIndex(null);
        setLineSpeechResults((prev) => ({ ...prev, [index]: res }));
      },
      (err) => {
        setIsRecording(false);
        setActiveLineIndex(null);
        addNotification(`Speech error: ${err.message || err}`, 'warning');
      }
    );
  };

  const handleAnswerQuestion = (sceneIndex, option) => {
    setUserAnswers((prev) => ({ ...prev, [sceneIndex]: option }));
  };

  const handleCheckQuizResults = () => {
    let correct = 0;
    storyLines.forEach((line, idx) => {
      if (userAnswers[idx] === line.correctAnswer) {
        correct++;
      }
    });
    const finalScore = Math.round((correct / storyLines.length) * 100);
    setQuizScore(finalScore);
    if (finalScore >= 80) {
      addNotification(`Awesome! Novel Quiz Score: ${finalScore}% 🎉`, 'success');
    } else {
      addNotification(`Quiz Score: ${finalScore}%. Review chapters and try again!`, 'info');
    }
  };

  const currentTheme = READING_THEMES[readingTheme] || READING_THEMES.sepia;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="card-theme-target p-6 sm:p-8 rounded-3xl border shadow-xl">
        <div className="flex items-center gap-3.5 mb-2">
          <div className="p-3.5 theme-btn-primary rounded-2xl shadow-md">
            <Book className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              <span>{t('storyTitle')}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full theme-btn-primary font-mono font-bold">
                eBook Reader
              </span>
            </h2>
            <p className="text-xs sm:text-sm opacity-80 mt-1 font-arabic">
              استوديو الروايات التفاعلية الطويلة بالذكاء الاصطناعي مع وضع القراءة الورقي الهادئ واختبارات المفردات
            </p>
          </div>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="card-theme-target p-6 rounded-3xl border space-y-5 shadow-xl">
        {/* Selected Words Bar */}
        <div>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <label className="block text-xs font-black uppercase tracking-wider opacity-80">
              {t('selectedWordsLabel')} ({selectedWords.length} / 5)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePickRandomWords}
                className="text-xs theme-btn-secondary px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition-all active:scale-95"
              >
                <Dice5 className="w-3.5 h-3.5 text-cyan-500" />
                <span>اختر 5 كلمات عشوائية</span>
              </button>
              {selectedWords.length > 0 && (
                <button
                  onClick={clearSelectedWords}
                  className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {t('clearAll')}
                </button>
              )}
            </div>
          </div>

          {selectedWords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedWords.map((w, idx) => {
                const term = typeof w === 'string' ? w : w.word;
                return (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl theme-btn-primary text-xs font-black flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> {term}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl border bg-black/5 text-xs italic opacity-80 flex items-center justify-between gap-2 font-bold">
              <span>اختر كلمات من الكتالوج أو أنقر على "اختر 5 كلمات عشوائية" لتوليد روايتك!</span>
            </div>
          )}
        </div>

        {/* Story Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2 opacity-80">
              طول الرواية (Story Length)
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'short', label: 'قصيرة (3)' },
                { id: 'medium', label: 'متوسطة (5)' },
                { id: 'epic', label: 'ملحمية (8)' },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => setStoryLength(l.id)}
                  className={`py-2 rounded-lg text-[11px] font-black transition-all border ${
                    storyLength === l.id
                      ? 'theme-btn-primary shadow-sm'
                      : 'theme-btn-secondary opacity-70 hover:opacity-100'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2 opacity-80">
              {t('genreLabel')}
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full glass-input px-3 py-2.5 rounded-xl text-xs font-bold border bg-slate-900 text-white"
            >
              <option value="detective">🕵️ Detective & Mystery (غموض وجريمة)</option>
              <option value="sci-fi">🚀 Sci-Fi & Cyberpunk (خيال علمي وروبوتات)</option>
              <option value="fantasy">🧙 Epic Fantasy (مغامرة وأسطورة)</option>
              <option value="business">💼 Corporate Strategy (أعمال وتجارة)</option>
              <option value="survival">🏕️ Wilderness Survival (بقاء ومغامرة)</option>
              <option value="campus">🏫 Campus Life (حياة جامعية)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2 opacity-80">
              {t('difficultyLabel')}
            </label>
            <div className="grid grid-cols-4 gap-1">
              {['A1', 'A2', 'B1', 'B2'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setCefrLevel(lvl)}
                  className={`py-2 rounded-lg text-xs font-black transition-all border ${
                    cefrLevel === lvl
                      ? 'theme-btn-primary shadow-sm'
                      : 'theme-btn-secondary opacity-70 hover:opacity-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2 opacity-80">
              Audio Speed (سرعة القراءة)
            </label>
            <AudioSpeedControl speed={audioSpeed} onSpeedChange={setAudioSpeed} compact={false} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleGenerateStory}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl theme-btn-primary text-sm font-black transition-all shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-300" />}
            <span>توليد رواية طويلة بالذكاء الاصطناعي ({storyLength === 'epic' ? '8 فصول' : storyLength === 'medium' ? '5 فصول' : '3 فصول'})</span>
          </button>

          <button
            onClick={handlePlayFullStory}
            className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs font-extrabold transition-all border ${
              isPlayingFullStory
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black animate-pulse'
                : 'theme-btn-secondary'
            }`}
          >
            {isPlayingFullStory ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 text-cyan-400" />}
            <span>{isPlayingFullStory ? 'إيقاف الصوت' : 'استمع للرواية كاملة بصوت الراوي'}</span>
          </button>
        </div>
      </div>

      {/* eBook Reader Toolbar (Typography & Reading Themes) */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 px-2">
            <BookOpen className="w-4 h-4 text-amber-400" /> مظهر ورقة القراءة:
          </span>
          {Object.values(READING_THEMES).map((th) => (
            <button
              key={th.id}
              onClick={() => setReadingTheme(th.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                readingTheme === th.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
              }`}
            >
              {th.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
            <Type className="w-4 h-4 text-cyan-400" /> حجم الخط:
          </span>
          {[
            { id: 'text-sm', label: 'عادي (A)' },
            { id: 'text-base', label: 'متوسط (A+)' },
            { id: 'text-lg', label: 'كبير (A++)' },
            { id: 'text-xl', label: 'ضخم (A+++)' },
          ].map((fs) => (
            <button
              key={fs.id}
              onClick={() => setFontSize(fs.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                fontSize === fs.id
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
                  : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
              }`}
            >
              {fs.label}
            </button>
          ))}

          <button
            onClick={() => setShowArabic(!showArabic)}
            className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
              showArabic ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{showArabic ? 'إخفاء الترجمة' : 'إظهار الترجمة'}</span>
          </button>
        </div>
      </div>

      {/* Novel eBook Reader Document Area */}
      <div
        className={`rounded-3xl p-6 sm:p-10 border shadow-2xl transition-all duration-300 space-y-8 font-serif leading-relaxed ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border}`}
      >
        {/* eBook Chapter Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-black/10 no-scrollbar">
          {storyLines.map((ch, idx) => (
            <button
              key={idx}
              onClick={() => setActiveChapterTab(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-sans font-bold shrink-0 transition-all border ${
                activeChapterTab === idx
                  ? `${currentTheme.accent} font-extrabold shadow-sm ring-2 ring-amber-500/40`
                  : 'opacity-70 hover:opacity-100 border-transparent'
              }`}
            >
              فصل {idx + 1}
            </button>
          ))}
        </div>

        {/* Selected Chapter Content */}
        {storyLines[activeChapterTab] && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 font-sans border-b border-black/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-mono font-black text-sm shadow-sm">
                  {storyLines[activeChapterTab].sceneNumber || activeChapterTab + 1}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold font-serif">
                  {storyLines[activeChapterTab].sceneTitle || `Chapter ${activeChapterTab + 1}`}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlayLine(storyLines[activeChapterTab].text)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-800 border border-amber-500/40 flex items-center gap-1.5 text-xs font-bold active:scale-95"
                >
                  <Volume2 className="w-4 h-4 text-amber-700" />
                  <span>قراءة الفصل</span>
                </button>

                <button
                  onClick={() => handleRecordLine(activeChapterTab, storyLines[activeChapterTab].text)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                    isRecording && activeLineIndex === activeChapterTab
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-black/5 hover:bg-black/10'
                  }`}
                >
                  {isRecording && activeLineIndex === activeChapterTab ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-rose-600" />}
                  <span>{isRecording && activeLineIndex === activeChapterTab ? 'جاري التسجيل...' : 'تمرن بالنطق'}</span>
                </button>
              </div>
            </div>

            {/* Paragraph Text with Interactive Token Viewer */}
            <div className={`p-6 rounded-2xl border border-black/10 bg-black/[0.03] ${fontSize} ${currentTheme.text} leading-loose font-extrabold`}>
              <SentenceTokenViewer
                sentence={storyLines[activeChapterTab].text}
                targetWords={selectedWords.length > 0 ? selectedWords : [storyLines[activeChapterTab].focusWord]}
                wordTranslations={storyLines[activeChapterTab].wordTranslations}
                showInlineTranslationBadges={true}
                size="md"
              />
            </div>

            {/* Arabic Paragraph Translation */}
            {showArabic && storyLines[activeChapterTab].arabic && (
              <div className="p-5 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-right dir-rtl font-arabic space-y-1">
                <span className="text-xs font-black text-amber-700 dark:text-amber-400 block">ترجمة الفصل إلى العربية:</span>
                <p className={`text-base font-black ${currentTheme.arText} leading-relaxed`}>
                  {storyLines[activeChapterTab].arabic}
                </p>
              </div>
            )}

            {/* Word Breakdown Dictionary */}
            {showArabic && storyLines[activeChapterTab].wordTranslations && Object.keys(storyLines[activeChapterTab].wordTranslations).length > 0 && (
              <div className="p-4 rounded-2xl border border-black/10 bg-black/[0.03] space-y-2 dir-rtl font-arabic font-sans">
                <span className="text-xs font-black text-amber-800 dark:text-amber-300 block">
                  🔤 قاموس مفردات هذا الفصل (أنقر على أي كلمة أعلاه لسماع نطقها):
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {Object.entries(storyLines[activeChapterTab].wordTranslations).map(([enWord, arTrans], wIdx) => (
                    <span
                      key={wIdx}
                      className={`px-3 py-1 rounded-xl border border-amber-500/40 bg-amber-500/15 text-xs font-black ${currentTheme.arText} flex items-center gap-1.5`}
                    >
                      <span dir="ltr" className="font-sans font-black ltr-isolate">{enWord}</span>: {arTrans}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mic Speech Score Visualizer */}
            {lineSpeechResults[activeChapterTab] && (
              <SpeechScoreVisualizer
                targetText={storyLines[activeChapterTab].text}
                speechResult={lineSpeechResults[activeChapterTab]}
                onClose={() => setLineSpeechResults((prev) => ({ ...prev, [activeChapterTab]: null }))}
              />
            )}

            {/* Chapter Multiple Choice Quiz */}
            {storyLines[activeChapterTab].comprehensionQuestion && (
              <div className="p-5 rounded-2xl border border-purple-500/40 bg-purple-500/10 font-sans space-y-3">
                <div className={`flex items-center gap-2 font-black text-sm ${currentTheme.quizText}`}>
                  <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>اختبار استيعاب الفصل: {storyLines[activeChapterTab].comprehensionQuestion}</span>
                </div>

                {storyLines[activeChapterTab].options && Array.isArray(storyLines[activeChapterTab].options) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {storyLines[activeChapterTab].options.map((opt, oIdx) => {
                      const selectedOption = userAnswers[activeChapterTab];
                      const isSelected = selectedOption === opt;
                      const isCorrect = opt === storyLines[activeChapterTab].correctAnswer;
                      const showFeedback = selectedOption !== undefined;

                      let btnStyle = currentTheme.optBtn;
                      if (showFeedback) {
                        if (isCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 font-black ring-2 ring-emerald-500/50';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'border-rose-500 bg-rose-500/20 text-rose-950 dark:text-rose-300 font-black ring-2 ring-rose-500/50';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleAnswerQuestion(activeChapterTab, opt)}
                          className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between gap-2 active:scale-95 ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {showFeedback && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Chapter Navigation Pagination Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-black/10 font-sans">
              <button
                disabled={activeChapterTab === 0}
                onClick={() => setActiveChapterTab((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/10 bg-black/5 hover:bg-black/10 text-xs font-extrabold disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>الفصل السابق</span>
              </button>

              <span className="text-xs font-mono font-bold">
                {activeChapterTab + 1} / {storyLines.length}
              </span>

              <button
                disabled={activeChapterTab === storyLines.length - 1}
                onClick={() => setActiveChapterTab((prev) => Math.min(storyLines.length - 1, prev + 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/10 bg-black/5 hover:bg-black/10 text-xs font-extrabold disabled:opacity-30 transition-all"
              >
                <span>الفصل التالي</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quiz Final Score Summary */}
      {Object.keys(userAnswers).length > 0 && (
        <div className="p-6 rounded-3xl border border-emerald-500/40 bg-emerald-950/30 text-center space-y-3 shadow-2xl">
          <div className="flex items-center justify-center gap-2">
            <Award className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-black text-white">نتيجة اختبار الرواية والمفردات</h3>
          </div>
          <p className="text-xs text-slate-300">
            أجبت على {Object.keys(userAnswers).length} من أصل {storyLines.length} أسئلة فصول الرواية
          </p>
          <button
            onClick={handleCheckQuizResults}
            className="px-6 py-2.5 rounded-xl theme-btn-primary text-xs font-black transition-all shadow-lg hover:brightness-110"
          >
            احسب الدرجة النهائية 🏆
          </button>

          {quizScore !== null && (
            <div className="pt-2 text-2xl font-black text-emerald-400 font-mono">
              درجتك النهائية: {quizScore}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}
