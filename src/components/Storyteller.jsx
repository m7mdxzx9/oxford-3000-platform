import React, { useState } from 'react';
import { BookOpen, Sparkles, RefreshCw, Volume2, Mic, MicOff, Languages, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateStory } from '../services/geminiService';
import { playAudio } from '../services/audioService';
import { evaluateSpeech } from '../services/speechEvaluation';
import SentenceTokenViewer from './SentenceTokenViewer';
import SpeechScoreVisualizer from './SpeechScoreVisualizer';

export default function Storyteller() {
  const { selectedWords, clearSelectedWords, apiKey, addNotification, t } = useApp();
  const [genre, setGenre] = useState('adventure');
  const [cefrLevel, setCefrLevel] = useState('B1');
  const [showArabic, setShowArabic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [storyLines, setStoryLines] = useState([
    {
      text: 'Once upon a time in a thrilling adventure, the brave team decided to explore the ancient ruins.',
      arabic: 'في يوم من الأيام في مغامرة مثيرة، قرر الفريق الشجاع استكشاف الأنقاض القديمة.'
    },
    {
      text: 'They knew that to achieve their ultimate goal, they could not abandon their initial strategy.',
      arabic: 'كانوا يعلمون أنه لتحقيق هدفهم النهائي، لا يمكنهم التخلي عن استراتيجيتهم الأولية.'
    }
  ]);

  const [activeLineIndex, setActiveLineIndex] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lineSpeechResults, setLineSpeechResults] = useState({});

  const handleGenerateStory = async () => {
    setLoading(true);
    setLineSpeechResults({});
    setActiveLineIndex(null);

    try {
      const wordsToUse = selectedWords.length > 0 ? selectedWords : ['abandon', 'achieve', 'adventure'];
      const lines = await generateStory(wordsToUse, genre, cefrLevel, apiKey);
      setStoryLines(lines);
      addNotification(`Generated ${genre} story in CEFR ${cefrLevel}`, 'success');
    } catch (err) {
      addNotification('Failed to generate story.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayLine = (text) => playAudio(text);

  const handleRecordLine = (index, targetText) => {
    if (isRecording && activeLineIndex === index) {
      setIsRecording(false);
      setActiveLineIndex(null);
      return;
    }

    setIsRecording(true);
    setActiveLineIndex(index);

    evaluateSpeech(
      targetText,
      (res) => {
        setIsRecording(false);
        setActiveLineIndex(null);
        setLineSpeechResults((prev) => ({ ...prev, [index]: res }));
      },
      (err) => {
        setIsRecording(false);
        setActiveLineIndex(null);
        addNotification(`Speech error: ${err}`, 'warning');
      }
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t('storyTitle')}</h2>
        </div>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl">{t('storySubtitle')}</p>
      </div>

      {/* Controls */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-900/30 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('selectedWordsLabel')} ({selectedWords.length} / 5)
            </label>
            {selectedWords.length > 0 && (
              <button
                onClick={clearSelectedWords}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> {t('clearAll')}
              </button>
            )}
          </div>

          {selectedWords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedWords.map((w, idx) => {
                const term = typeof w === 'string' ? w : w.word;
                return (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-full text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" /> {term}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No words selected from catalog. Click words in the Lexicon Grid to add them, or click generate to use default terms!
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {t('genreLabel')}
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="adventure">Adventure & Quest</option>
              <option value="sci-fi">Sci-Fi & Future</option>
              <option value="daily life">Daily Life & Social</option>
              <option value="mystery">Mystery & Detective</option>
              <option value="business">Business & Career</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {t('difficultyLabel')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['A1', 'A2', 'B1', 'B2'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setCefrLevel(lvl)}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all ${
                    cefrLevel === lvl
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleGenerateStory}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-2xl shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {t('generateStoryBtn')}
          </button>

          <button
            onClick={() => setShowArabic(!showArabic)}
            className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border transition-all text-sm font-semibold ${
              showArabic ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}
          >
            <Languages className="w-5 h-5" />
            {showArabic ? t('hideArabic') : t('showArabic')}
          </button>
        </div>
      </div>

      {/* Story Cards */}
      <div className="space-y-4">
        {storyLines.map((line, idx) => {
          const res = lineSpeechResults[idx];
          return (
            <div key={idx} className="glass-panel p-6 rounded-3xl border border-cyan-900/30 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-amber-400">Line {idx + 1}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handlePlayLine(line.text)} className="p-2 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded-xl">
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleRecordLine(idx, line.text)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isRecording && activeLineIndex === idx ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {isRecording && activeLineIndex === idx ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-rose-400" />}
                    {isRecording && activeLineIndex === idx ? 'Listening...' : 'Practice'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <SentenceTokenViewer sentence={line.text} />
              </div>

              {res && (
                <SpeechScoreVisualizer
                  targetText={line.text}
                  speechResult={res}
                  onClose={() => setLineSpeechResults((prev) => ({ ...prev, [idx]: null }))}
                />
              )}

              {showArabic && line.arabic && (
                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-right dir-rtl">
                  <p className="text-sm font-bold text-amber-300">{line.arabic}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
