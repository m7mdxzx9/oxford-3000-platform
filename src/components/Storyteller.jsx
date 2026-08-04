import React, { useState } from 'react';
import { BookOpen, Sparkles, RefreshCw, Volume2, Mic, MicOff, Languages, Trash2, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateStory } from '../services/geminiService';
import { playAudio } from '../services/audioService';
import { evaluateSpeech } from '../services/speechEvaluation';
import SentenceTokenViewer from './SentenceTokenViewer';
import SpeechScoreVisualizer from './SpeechScoreVisualizer';

export default function Storyteller() {
  const { selectedWords, clearSelectedWords, apiKey, addNotification } = useApp();
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

  // Line Speech Evaluation State
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

  const handlePlayLine = (text) => {
    playAudio(text);
  };

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
        addNotification(`Speech evaluation error: ${err}`, 'warning');
      }
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">AI Interactive Storyteller</h2>
        </div>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
          Craft immersive stories featuring your selected Oxford 3000 words. Read line-by-line with interactive token analysis, audio playback, and instant pronunciation feedback.
        </p>
      </div>

      {/* Control Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-900/30 space-y-5">
        {/* Selected Words Pill Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Selected Words ({selectedWords.length} / 5)
            </label>
            {selectedWords.length > 0 && (
              <button
                onClick={clearSelectedWords}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
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

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Story Genre
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
              <option value="comedy">Comedy & Fun</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              CEFR Difficulty Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['A1', 'A2', 'B1', 'B2'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setCefrLevel(lvl)}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all ${
                    cefrLevel === lvl
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleGenerateStory}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {loading ? 'Crafting Story with Gemini...' : 'Generate Interactive Story'}
          </button>

          <button
            onClick={() => setShowArabic(!showArabic)}
            className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border transition-all text-sm font-semibold ${
              showArabic
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}
          >
            <Languages className="w-5 h-5" />
            {showArabic ? 'Hide Arabic' : 'Show Arabic'}
          </button>
        </div>
      </div>

      {/* Story Line-by-Line Cards */}
      <div className="space-y-4">
        {storyLines.map((line, idx) => {
          const res = lineSpeechResults[idx];
          return (
            <div
              key={idx}
              className="glass-panel p-6 rounded-3xl border border-cyan-900/30 hover:border-cyan-500/30 transition-all space-y-4"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-amber-400">Line {idx + 1}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlayLine(line.text)}
                    className="p-2 bg-cyan-600/80 hover:bg-cyan-500 text-white rounded-xl transition-all"
                    title="Listen to Line"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleRecordLine(idx, line.text)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isRecording && activeLineIndex === idx
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {isRecording && activeLineIndex === idx ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4 text-rose-400" />
                    )}
                    {isRecording && activeLineIndex === idx ? 'Listening...' : 'Practice'}
                  </button>
                </div>
              </div>

              {/* Tokenized Sentence */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                <SentenceTokenViewer sentence={line.text} />
              </div>

              {/* Speech Result */}
              {res && (
                <SpeechScoreVisualizer
                  targetText={line.text}
                  speechResult={res}
                  onClose={() => setLineSpeechResults((prev) => ({ ...prev, [idx]: null }))}
                />
              )}

              {/* Arabic Translation */}
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
