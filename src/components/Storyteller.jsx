import React, { useState } from 'react';
import { BookOpen, Sparkles, RefreshCw, Volume2, Mic, MicOff, Languages, Trash2, HelpCircle, CheckCircle, Plus, Dice5, Play, Pause, Award, Compass, Gauge } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateStory } from '../services/geminiService';
import { playAudio, stopAudio } from '../services/audioService';
import { recordAndEvaluateSpeech, stopListening } from '../services/speechEvaluation';
import { oxford3000Data } from '../data/oxford3000';
import SentenceTokenViewer from './SentenceTokenViewer';
import SpeechScoreVisualizer from './SpeechScoreVisualizer';
import AudioSpeedControl from './AudioSpeedControl';

export default function Storyteller() {
  const { selectedWords, toggleSelectWord, clearSelectedWords, apiKey, addNotification, t, voicePreset, setVoicePreset, voicePresets, audioSpeed, setAudioSpeed } = useApp();
  const [genre, setGenre] = useState('detective');
  const [cefrLevel, setCefrLevel] = useState('B2');
  const [showArabic, setShowArabic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isPlayingFullStory, setIsPlayingFullStory] = useState(false);

  // Initial Rich Multi-Chapter Story Sample
  const [storyLines, setStoryLines] = useState([
    {
      sceneNumber: 1,
      sceneTitle: 'Chapter 1: The Unexpected Encounter',
      text: 'Detective Jameson received a mysterious letter asking for his ability to solve a centuries-old mystery. Intrigued by the prospect of an adventure, he decided to accept the case.',
      arabic: 'حصل المحقق جيمسون على رسالة غامضة تطلب قدرته على حل لغز قديم منذ قرون. ومُثارًا باحتمال خوض مغامرة، قرر قبول القضية.',
      focusWord: 'ability',
      comprehensionQuestion: 'Why did Detective Jameson decide to accept the case?',
      options: [
        'Because he was bored with his daily routine.',
        'Because he was intrigued by the prospect of an adventure.',
        'Because he needed money urgently.',
        'Because his friend forced him to go.'
      ],
      correctAnswer: 'Because he was intrigued by the prospect of an adventure.',
      wordTranslations: { ability: 'قدرة', adventure: 'مغامرة', accept: 'قبول' }
    },
    {
      sceneNumber: 2,
      sceneTitle: 'Chapter 2: Crossing the Threshold',
      text: 'To achieve his ultimate goal, he had to abandon his comfortable routine and explore the desolate ancient ruins high in the foggy mountains.',
      arabic: 'لتحقيق هدفه النهائي، كان عليه التخلي عن روتينه المريح واستكشاف الأنقاض القديمة المهجورة العالية في الجبال الضبابية.',
      focusWord: 'achieve',
      comprehensionQuestion: 'What did the detective have to abandon to achieve his goal?',
      options: [
        'His old vehicle',
        'His comfortable routine',
        'His official badge',
        'His travel map'
      ],
      correctAnswer: 'His comfortable routine',
      wordTranslations: { achieve: 'تحقيق', abandon: 'التخلي', explore: 'استكشاف' }
    }
  ]);

  const [activeLineIndex, setActiveLineIndex] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lineSpeechResults, setLineSpeechResults] = useState({});
  const [userAnswers, setUserAnswers] = useState({}); // { [sceneIndex]: selectedOption }
  const [quizScore, setQuizScore] = useState(null);

  // Random Word Picker
  const handlePickRandomWords = () => {
    const shuffled = [...oxford3000Data].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 5);
    picked.forEach((w) => toggleSelectWord(w));
    addNotification(`Selected 5 random words for AI Story!`, 'info');
  };

  // Generate Rich Multi-Chapter AI Story
  const handleGenerateStory = async () => {
    setLoading(true);
    setLineSpeechResults({});
    setUserAnswers({});
    setQuizScore(null);
    setActiveLineIndex(null);

    try {
      const wordsToUse = selectedWords.length > 0 ? selectedWords : ['abandon', 'ability', 'achieve', 'adventure'];
      const lines = await generateStory(wordsToUse, genre, cefrLevel, apiKey);
      if (lines && lines.length > 0) {
        setStoryLines(lines);
        addNotification(`Generated ${lines.length}-Chapter AI ${genre} Story (${cefrLevel})`, 'success');
      } else {
        addNotification('Failed to generate story with AI engine.', 'error');
      }
    } catch (err) {
      addNotification('Error generating story with AI engine.', 'error');
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

  // Select Quiz Answer
  const handleAnswerQuestion = (sceneIndex, option) => {
    setUserAnswers((prev) => ({ ...prev, [sceneIndex]: option }));
  };

  // Calculate Quiz Score
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
      addNotification(`Awesome! Story Quiz Score: ${finalScore}% 🎉`, 'success');
    } else {
      addNotification(`Quiz Score: ${finalScore}%. Review chapters and try again!`, 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-950 relative overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 theme-btn-primary rounded-2xl shadow-lg">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{t('storyTitle')}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                Novel Engine
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              مولد القصص الرواية التفاعلية بالذكاء الاصطناعي مع اختبارات المفردات وصوت الراوي
            </p>
          </div>
        </div>
      </div>

      {/* Controls & Words Selector */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-[var(--bg-card)] space-y-5 shadow-xl">
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
                <Dice5 className="w-3.5 h-3.5 text-cyan-400" />
                <span>اختر 5 كلمات عشوائية</span>
              </button>
              {selectedWords.length > 0 && (
                <button
                  onClick={clearSelectedWords}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold"
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
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {term}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/40 text-xs italic opacity-80 flex items-center justify-between gap-2">
              <span>اختر كلمات من الكتالوج أو أنقر على "اختر 5 كلمات عشوائية" لإنشاء روتين قصة مخصصة!</span>
            </div>
          )}
        </div>

        {/* Genre, CEFR Level, Audio Speed & Narrator Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              <option value="campus">🏫 Campus Life (جامعة وصداقة)</option>
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
              Audio Speed (السرعة)
            </label>
            <AudioSpeedControl speed={audioSpeed} onSpeedChange={setAudioSpeed} compact={false} />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2 opacity-80">
              Narrator Voice (صوت الراوي)
            </label>
            <select
              value={voicePreset}
              onChange={(e) => setVoicePreset(e.target.value)}
              className="w-full glass-input px-3 py-2.5 rounded-xl text-xs font-bold border bg-slate-900 text-white truncate"
            >
              {voicePresets.map((vp) => (
                <option key={vp.id} value={vp.id}>
                  {vp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleGenerateStory}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl theme-btn-primary text-sm font-black transition-all shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            <span>إنشاء قصة رواية متكاملة بالذكاء الاصطناعي</span>
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
            <span>{isPlayingFullStory ? 'إيقاف قراءة القصة' : 'قراءة القصة كاملة بالصوت'}</span>
          </button>

          <button
            onClick={() => setShowArabic(!showArabic)}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl theme-btn-secondary text-xs font-bold transition-all"
          >
            <Languages className="w-4 h-4" />
            <span>{showArabic ? t('hideArabic') : t('showArabic')}</span>
          </button>
        </div>
      </div>

      {/* Chapters Render */}
      <div className="space-y-6">
        {storyLines.map((line, idx) => {
          const res = lineSpeechResults[idx];
          const selectedOption = userAnswers[idx];

          return (
            <div
              key={idx}
              className={`card-theme-target p-6 rounded-3xl border transition-all duration-300 bg-[var(--bg-card)] space-y-4 shadow-lg ${
                activeLineIndex === idx ? 'ring-2 ring-purple-500 border-purple-500/80 shadow-2xl' : ''
              }`}
            >
              {/* Chapter Header */}
              <div className="flex items-center justify-between text-xs flex-wrap gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl theme-btn-primary flex items-center justify-center font-mono font-black text-xs">
                    {line.sceneNumber || idx + 1}
                  </span>
                  <h3 className="font-extrabold text-sm text-white">{line.sceneTitle || `Chapter ${idx + 1}`}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlayLine(line.text)}
                    className="px-3 py-1.5 rounded-xl theme-btn-primary flex items-center gap-1.5 text-xs font-extrabold active:scale-95"
                    title="Listen to this chapter"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>

                  <button
                    onClick={() => handleRecordLine(idx, line.text)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border active:scale-95 ${
                      isRecording && activeLineIndex === idx ? 'bg-rose-600 text-white animate-pulse' : 'theme-btn-secondary'
                    }`}
                  >
                    {isRecording && activeLineIndex === idx ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-rose-400" />}
                    <span>{isRecording && activeLineIndex === idx ? 'Listening...' : 'Mic Practice'}</span>
                  </button>
                </div>
              </div>

              {/* Main Chapter Text Paragraph with SentenceTokenViewer */}
              <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 space-y-2">
                <SentenceTokenViewer
                  sentence={line.text}
                  targetWords={selectedWords.length > 0 ? selectedWords : [line.focusWord]}
                  wordTranslations={line.wordTranslations}
                  showInlineTranslationBadges={true}
                  size="md"
                />
              </div>

              {/* Word-by-Word Arabic Translation Pills */}
              {showArabic && line.wordTranslations && Object.keys(line.wordTranslations).length > 0 && (
                <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-1.5 dir-rtl">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1 font-arabic">
                    🔤 ترجمة مفردات هذا الفصل (أنقر فوق أي كلمة في النص أعلاه لرؤية الترجمة وسماع النطق):
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Object.entries(line.wordTranslations).map(([enWord, arTrans], wIdx) => (
                      <span
                        key={wIdx}
                        className="px-2.5 py-1 rounded-xl border border-amber-500/40 bg-slate-950/60 text-xs font-bold text-amber-300 font-arabic flex items-center gap-1"
                      >
                        <span dir="ltr" className="font-sans text-white ltr-isolate font-bold">{enWord}</span>: {arTrans}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Speech Accuracy Score Result */}
              {res && (
                <SpeechScoreVisualizer
                  targetText={line.text}
                  speechResult={res}
                  onClose={() => setLineSpeechResults((prev) => ({ ...prev, [idx]: null }))}
                />
              )}

              {/* Interactive Multiple-Choice Reading Comprehension Quiz */}
              {line.comprehensionQuestion && (
                <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 text-xs space-y-3">
                  <div className="flex items-center gap-2 font-extrabold text-purple-300 text-sm">
                    <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Quiz Question: {line.comprehensionQuestion}</span>
                  </div>

                  {line.options && Array.isArray(line.options) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {line.options.map((opt, oIdx) => {
                        const isSelected = selectedOption === opt;
                        const isCorrect = opt === line.correctAnswer;
                        const showFeedback = selectedOption !== undefined;

                        let btnStyle = 'border-slate-800 bg-slate-900 hover:border-purple-500/50 text-slate-200';
                        if (showFeedback) {
                          if (isCorrect) {
                            btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-black';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'border-rose-500 bg-rose-500/20 text-rose-300 font-bold';
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleAnswerQuestion(idx, opt)}
                            className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-2 active:scale-95 ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {showFeedback && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Full Paragraph Arabic Translation */}
              {showArabic && line.arabic && (
                <div className="p-3.5 rounded-2xl border border-slate-800/80 bg-slate-950/40 text-right dir-rtl font-arabic">
                  <span className="text-[11px] opacity-75 font-bold block mb-0.5 text-amber-400">ترجمة النص الكامل للفصل:</span>
                  <p className="text-sm font-extrabold text-amber-200 leading-relaxed">{line.arabic}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quiz Final Score Banner */}
      {Object.keys(userAnswers).length > 0 && (
        <div className="p-6 rounded-3xl border border-emerald-500/40 bg-emerald-950/30 text-center space-y-3 shadow-2xl">
          <div className="flex items-center justify-center gap-2">
            <Award className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg font-black text-white">اختبار استيعاب القصة والمفردات</h3>
          </div>
          <p className="text-xs text-slate-300">
            أجبت على {Object.keys(userAnswers).length} من أصل {storyLines.length} أسئلة استيعاب
          </p>
          <button
            onClick={handleCheckQuizResults}
            className="px-6 py-2.5 rounded-xl theme-btn-primary text-xs font-black transition-all shadow-lg hover:brightness-110"
          >
            احسب نتيجة الاختبار الكاملة 🏆
          </button>

          {quizScore !== null && (
            <div className="pt-2 text-xl font-black text-emerald-400 font-mono">
              درجتك النهائية: {quizScore}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}
