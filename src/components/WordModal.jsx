import React, { useState } from 'react';
import { Volume2, Mic, MicOff, Star, CheckCircle, X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playAudio } from '../services/audioService';
import { evaluateSpeech } from '../services/speechEvaluation';
import SentenceTokenViewer from './SentenceTokenViewer';

export default function WordModal({ word, onClose }) {
  const { isFavorite, toggleFavorite, isMastered, toggleMastered, addNotification } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [speechResult, setSpeechResult] = useState(null);
  const [activeSpeed, setActiveSpeed] = useState(0.9);

  if (!word) return null;

  const fav = isFavorite(word.word);
  const mst = isMastered(word.word);

  const handlePlayWord = (rate = activeSpeed) => {
    setActiveSpeed(rate);
    playAudio(word.word, { rate });
  };

  const handleRecordSpeech = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    setSpeechResult(null);

    evaluateSpeech(
      word.word,
      (res) => {
        setIsRecording(false);
        setSpeechResult(res);
        if (res.score >= 80) {
          addNotification(`Great pronunciation! Score: ${res.score}%`, 'success');
        } else {
          addNotification(`Keep practicing! Score: ${res.score}%`, 'info');
        }
      },
      (err) => {
        setIsRecording(false);
        addNotification(`Speech recognition error: ${err}`, 'warning');
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl bg-[#0a1636]/90 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Badges */}
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            CEFR {word.cefr || 'B1'}
          </span>
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-300 italic">
            {word.pos}
          </span>
          {word.isCustom && (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Generated
            </span>
          )}
        </div>

        {/* Word & Phonetic */}
        <div className="flex items-baseline justify-between gap-4 mb-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight ltr-token">
            {word.word}
          </h2>
          <span className="text-lg text-cyan-400/90 font-mono ltr-token">
            {word.ipa || `/${word.word}/`}
          </span>
        </div>

        {/* Translation */}
        <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-right">
          <span className="text-xs text-slate-400 block mb-1">الترجمة العربية</span>
          <p className="text-xl font-bold text-amber-300 dir-rtl">{word.arabic}</p>
        </div>

        {/* Audio TTS Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePlayWord(0.9)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-cyan-600/20"
            >
              <Volume2 className="w-5 h-5" /> Normal Speed (0.9x)
            </button>
            <button
              onClick={() => handlePlayWord(0.6)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-medium transition-all"
            >
              Slow (0.6x)
            </button>
          </div>

          <button
            onClick={handleRecordSpeech}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-rose-400" />}
            {isRecording ? 'Listening...' : 'Practice Voice'}
          </button>
        </div>

        {/* Speech Score Visualizer */}
        {speechResult && (
          <div className="mb-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">Pronunciation Score</span>
              <span
                className={`text-lg font-bold ${
                  speechResult.score >= 80 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {speechResult.score}%
              </span>
            </div>
            <p className="text-xs text-slate-400 italic mb-2">"{speechResult.transcript}"</p>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  speechResult.score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${speechResult.score}%` }}
              />
            </div>
          </div>
        )}

        {/* Example Sentence with Interactive Tokens */}
        {word.example && (
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Context Example (Click tokens to evaluate words)
            </label>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-900/30">
              <SentenceTokenViewer sentence={word.example} targetWord={word.word} />
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="mt-auto pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(word.word)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                fav
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Star className={`w-4 h-4 ${fav ? 'fill-amber-400 text-amber-400' : ''}`} />
              {fav ? 'Favorited' : 'Add Favorite'}
            </button>

            <button
              onClick={() => toggleMastered(word.word)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                mst
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle className={`w-4 h-4 ${mst ? 'text-emerald-400' : ''}`} />
              {mst ? 'Mastered' : 'Mark Mastered'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
