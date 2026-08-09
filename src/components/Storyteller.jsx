import React, { useState } from 'react';
import { BookOpen, Sparkles, RefreshCw, Volume2, Mic, MicOff, Languages, Trash2, HelpCircle, CheckCircle, Plus, Dice5 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateStory } from '../services/geminiService';
import { playAudio } from '../services/audioService';
import { recordAndEvaluateSpeech, stopListening } from '../services/speechEvaluation';
import { oxford3000Data } from '../data/oxford3000';
import SentenceTokenViewer from './SentenceTokenViewer';
import SpeechScoreVisualizer from './SpeechScoreVisualizer';

export default function Storyteller() {
  const { selectedWords, toggleSelectWord, clearSelectedWords, apiKey, addNotification, t, voicePreset, setVoicePreset, voicePresets } = useApp();
  const [genre, setGenre] = useState('adventure');
  const [cefrLevel, setCefrLevel] = useState('B1');
  const [showArabic, setShowArabic] = useState(true);
  const [loading, setLoading] = useState(false);

  const [storyLines, setStoryLines] = useState([
    {
      sceneNumber: 1,
      text: 'Once upon a time on a thrilling adventure, the brave team decided to explore the ancient ruins.',
      arabic: 'في يوم من الأيام في مغامرة مثيرة، قرر الفريق الشجاع استكشاف الأنقاض القديمة.',
      focusWord: 'adventure',
      comprehensionQuestion: 'What did the brave team decide to explore?',
      correctAnswer: 'The ancient ruins'
    },
    {
      sceneNumber: 2,
      text: 'They knew that to achieve their ultimate goal, they could not abandon their initial strategy.',
      arabic: 'كانوا يعلمون أنه لتحقيق هدفهم النهائي، لا يمكنهم التخلي عن استراتيجيتهم الأولية.',
      focusWord: 'achieve',
      comprehensionQuestion: 'What could they not abandon?',
      correctAnswer: 'Their initial strategy'
    }
  ]);

  const [activeLineIndex, setActiveLineIndex] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lineSpeechResults, setLineSpeechResults] = useState({});
  const [showAnswers, setShowAnswers] = useState({});

  const handlePickRandomWords = () => {
    const shuffled = [...oxford3000Data].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 4);
    picked.forEach(w => toggleSelectWord(w));
    addNotification(`Selected 4 random words for AI Story!`, 'info');
  };

  const handleGenerateStory = async () => {
    setLoading(true);
    setLineSpeechResults({});
    setActiveLineIndex(null);

    try {
      const wordsToUse = selectedWords.length > 0 ? selectedWords : ['abandon', 'achieve', 'adventure', 'goal'];
      const lines = await generateStory(wordsToUse, genre, cefrLevel, apiKey);
      if (lines && lines.length > 0) {
        setStoryLines(lines);
        addNotification(`Generated real AI ${genre} story in CEFR ${cefrLevel}`, 'success');
      } else {
        addNotification('Failed to generate story with Gemini AI.', 'error');
      }
    } catch (err) {
      addNotification('Error generating story with Gemini AI.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayLine = (text) => {
    playAudio(text, { presetId: voicePreset });
  };

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 theme-btn-primary rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t('storyTitle')}</h2>
            <p className="text-xs sm:text-sm opacity-80 mt-1">{t('storySubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-panel p-6 rounded-3xl border space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider opacity-75">
              {t('selectedWordsLabel')} ({selectedWords.length} / 5)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePickRandomWords}
                className="text-xs theme-btn-secondary px-2.5 py-1 flex items-center gap-1 transition-all"
              >
                <Dice5 className="w-3.5 h-3.5" /> Pick 4 Random Words
              </button>
              {selectedWords.length > 0 && (
                <button
                  onClick={clearSelectedWords}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-bold"
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
                    className="px-3 py-1 theme-btn-primary text-xs font-bold flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" /> {term}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="p-3 border rounded-xl bg-black/5 text-xs italic opacity-75 flex items-center justify-between gap-2">
              <span>No words selected. Click words in the Lexicon Catalog or click "Pick 4 Random Words"!</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 opacity-75">
              {t('genreLabel')}
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full glass-input px-4 py-3 text-xs font-extrabold"
            >
              <option value="adventure" className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">Adventure & Quest</option>
              <option value="sci-fi" className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">Sci-Fi & Future</option>
              <option value="daily life" className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">Daily Life & Social</option>
              <option value="mystery" className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">Mystery & Detective</option>
              <option value="business" className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">Business & Career</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 opacity-75">
              {t('difficultyLabel')}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {['A1', 'A2', 'B1', 'B2'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setCefrLevel(lvl)}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
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
            <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 opacity-75">
              Narrator Voice
            </label>
            <select
              value={voicePreset}
              onChange={(e) => setVoicePreset(e.target.value)}
              className="w-full glass-input px-3 py-3 text-xs font-extrabold"
            >
              {voicePresets.map((vp) => (
                <option key={vp.id} value={vp.id} className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">
                  {vp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleGenerateStory}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 theme-btn-primary text-sm font-black transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {t('generateStoryBtn')}
          </button>

          <button
            onClick={() => setShowArabic(!showArabic)}
            className="flex items-center justify-center gap-2 px-5 py-3.5 theme-btn-secondary text-xs font-bold transition-all"
          >
            <Languages className="w-5 h-5" />
            {showArabic ? t('hideArabic') : t('showArabic')}
          </button>
        </div>
      </div>

      {/* Story Scene Cards */}
      <div className="space-y-4">
        {storyLines.map((line, idx) => {
          const res = lineSpeechResults[idx];
          const hasAnswer = showAnswers[idx];

          return (
            <div key={idx} className="card-theme-target glass-card p-6 rounded-3xl border space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full theme-btn-primary flex items-center justify-center font-mono text-xs">
                    {line.sceneNumber || idx + 1}
                  </span>
                  Scene {idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <button onClick={() => handlePlayLine(line.text)} className="p-2 theme-btn-primary rounded-xl" title="Listen Narrator">
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleRecordLine(idx, line.text)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                      isRecording && activeLineIndex === idx ? 'bg-rose-600 text-white animate-pulse' : 'theme-btn-secondary'
                    }`}
                  >
                    {isRecording && activeLineIndex === idx ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    {isRecording && activeLineIndex === idx ? 'Listening...' : 'Practice'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl border bg-black/5 space-y-2">
                <SentenceTokenViewer
                  sentence={line.text}
                  targetWord={line.focusWord}
                  wordTranslations={line.wordTranslations}
                  showInlineTranslationBadges={true}
                />
              </div>

              {/* Word-by-Word Arabic Translation Breakdown */}
              {showArabic && line.wordTranslations && Object.keys(line.wordTranslations).length > 0 && (
                <div className="p-3 rounded-xl border bg-black/5 space-y-1.5 dir-rtl">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1 font-arabic">
                    🔤 ترجمة كلمات المشهد (انقر على الكلمة لسماعها وترجمتها):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(line.wordTranslations).map(([enWord, arTrans], wIdx) => (
                      <span
                        key={wIdx}
                        className="px-2 py-0.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs font-extrabold text-amber-300 font-arabic flex items-center gap-1"
                      >
                        <span dir="ltr" className="font-sans text-white ltr-isolate">{enWord}</span>: {arTrans}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {res && (
                <SpeechScoreVisualizer
                  targetText={line.text}
                  speechResult={res}
                  onClose={() => setLineSpeechResults((prev) => ({ ...prev, [idx]: null }))}
                />
              )}

              {/* Comprehension Quiz Item */}
              {line.comprehensionQuestion && (
                <div className="p-3.5 rounded-2xl border bg-black/5 text-xs space-y-2">
                  <div className="flex items-center justify-between font-extrabold">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-500" /> {line.comprehensionQuestion}
                    </span>
                    <button
                      onClick={() => setShowAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                      className="opacity-80 hover:opacity-100 underline text-[11px]"
                    >
                      {hasAnswer ? 'Hide Answer' : 'Check Answer'}
                    </button>
                  </div>
                  {hasAnswer && (
                    <div className="p-2 rounded-xl border bg-emerald-500/10 text-emerald-600 font-extrabold">
                      ✓ {line.correctAnswer}
                    </div>
                  )}
                </div>
              )}

              {showArabic && line.arabic && (
                <div className="p-3.5 rounded-xl border bg-black/5 text-right dir-rtl font-arabic">
                  <span className="text-[11px] opacity-75 font-semibold block mb-0.5">ترجمة النص الكامل للمشهد:</span>
                  <p className="text-base font-extrabold text-amber-300">{line.arabic}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
