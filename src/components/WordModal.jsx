import React, { useState } from 'react';
import { Volume2, Mic, MicOff, Star, CheckCircle, X, Sparkles, Image, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playAudio } from '../services/audioService';
import { recordAndEvaluateSpeech, stopListening, isSpeechRecognitionSupported } from '../services/speechEvaluation';
import { generateVisualIllustration } from '../services/imagenService';
import { generateSentence } from '../services/geminiService';
import { getCuratedWordImage } from '../services/imageService';
import SentenceTokenViewer from './SentenceTokenViewer';
import AudioSpeedControl from './AudioSpeedControl';
import IpaSyllableVisualizer from './IpaSyllableVisualizer';

export default function WordModal({ word, onClose }) {
  const { isFavorite, toggleFavorite, isMastered, toggleMastered, addNotification, voicePreset, setVoicePreset, voicePresets, audioSpeed, setAudioSpeed, apiKey } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [speechResult, setSpeechResult] = useState(null);

  // Imagen 4.0 & Contextual Visual Illustration State
  const [illustrationUrl, setIllustrationUrl] = useState(() => getCuratedWordImage(word.word));
  const [generatingImage, setGeneratingImage] = useState(false);

  // Custom AI Sentence State
  const [customAiSentence, setCustomAiSentence] = useState(null);
  const [generatingSentence, setGeneratingSentence] = useState(false);
  const [sentenceLevel, setSentenceLevel] = useState(word.cefr || 'B1');

  if (!word) return null;

  const fav = isFavorite(word.word);
  const mst = isMastered(word.word);

  const activeSentence = customAiSentence?.sentence || word.example;
  const activeArabicSentence = customAiSentence?.arabic;
  const activeWordTranslations = customAiSentence?.wordTranslations;

  const handlePlayWord = (rate = audioSpeed) => {
    playAudio(word.word, { speed: rate, presetId: voicePreset });
  };

  const handleGenerateIllustration = async () => {
    setGeneratingImage(true);
    try {
      const url = await generateVisualIllustration(word.word, word.example || '', apiKey);
      if (url) {
        setIllustrationUrl(url);
        addNotification(`Generated 3D visual illustration for "${word.word}"`, 'success');
      }
    } catch (err) {
      addNotification('Failed to generate visual illustration.', 'warning');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleGenerateAiSentence = async (overrideLevel = sentenceLevel) => {
    setGeneratingSentence(true);
    try {
      const res = await generateSentence(word.word, 'medium', 'any', 'Casual Conversation', 'Present', apiKey, overrideLevel);
      if (res && res.sentence) {
        setCustomAiSentence(res);
        addNotification(`Generated new ${overrideLevel} AI sentence for "${word.word}"`, 'success');
      }
    } catch (err) {
      addNotification('Failed to generate AI sentence.', 'warning');
    } finally {
      setGeneratingSentence(false);
    }
  };

  const handleRecordSpeech = () => {
    if (!isSpeechRecognitionSupported()) {
      addNotification('Web Speech API is not supported on this browser version. You can practice in Chrome/Edge!', 'warning');
      return;
    }

    if (isRecording) {
      stopListening();
      setIsRecording(false);
      addNotification('Microphone recording stopped.', 'info');
      return;
    }

    setIsRecording(true);
    setSpeechResult(null);

    recordAndEvaluateSpeech(
      activeSentence || word.word,
      (res) => {
        setIsRecording(false);
        setSpeechResult(res);
        if (res.score >= 85) {
          addNotification(`Outstanding pronunciation! Score: ${res.score}%`, 'success');
        } else if (res.score >= 60) {
          addNotification(`Good effort! Score: ${res.score}%. Practice stressed syllables.`, 'info');
        } else {
          addNotification(`Score: ${res.score}%. Listen to audio and try again.`, 'warning');
        }
      },
      (err) => {
        setIsRecording(false);
        addNotification(`Recording issue: ${err.message || err}`, 'warning');
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl bg-[#0a1636]/90 border border-cyan-500/30 rounded-3xl p-4 sm:p-8 shadow-2xl relative flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-full transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3 pr-8">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            CEFR {word.cefr || word.level || 'B1'}
          </span>
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-800 text-slate-300 italic">
            {word.pos}
          </span>
          {word.isCustom && (
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Gemini AI Generated
            </span>
          )}
        </div>

        {/* Word & IPA Syllable Stress Visualizer */}
        <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight ltr-token">
            {word.word}
          </h2>
          <IpaSyllableVisualizer ipa={word.ipa || word.phonetic || `/${word.word}/`} />
        </div>

        {/* Arabic Meaning */}
        <div className="mb-4 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-right">
          <span className="text-[11px] text-slate-400 block mb-0.5">الترجمة العربية والتعريف</span>
          <p className="text-lg sm:text-xl font-bold text-amber-300 dir-rtl">{word.arabic || word.translation}</p>
        </div>

        {/* Contextual Visual Aid Photo Banner */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Image className="w-3.5 h-3.5 text-purple-400" /> Contextual Visual Aid
            </span>

            <button
              onClick={handleGenerateIllustration}
              disabled={generatingImage}
              className="flex items-center gap-1.5 px-3 py-1 bg-purple-600/80 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            >
              {generatingImage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {generatingImage ? 'Generating AI Image...' : '3D AI Concept'}
            </button>
          </div>

          {illustrationUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-slate-950 flex items-center justify-center p-2 max-h-48">
              <img
                src={illustrationUrl}
                alt={word.word}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80';
                }}
                className="max-h-44 w-auto object-cover rounded-xl shadow-lg transition-transform hover:scale-105"
              />
            </div>
          )}
        </div>

        {/* Voice Selector & Speed Control Bar */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 mb-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-cyan-300 font-semibold flex items-center gap-1">
              <Volume2 className="w-4 h-4" /> Voice:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <AudioSpeedControl speed={audioSpeed} onSpeedChange={setAudioSpeed} compact={true} />
              <select
                value={voicePreset}
                onChange={(e) => setVoicePreset(e.target.value)}
                className="bg-slate-900 text-xs text-white p-1.5 rounded-xl border border-slate-800 focus:outline-none max-w-[180px] truncate font-bold"
              >
                {voicePresets.map((vp) => (
                  <option key={vp.id} value={vp.id}>
                    {vp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePlayWord(audioSpeed)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
              >
                <Volume2 className="w-4 h-4" /> Listen ({audioSpeed}x)
              </button>
            </div>

            <button
              onClick={handleRecordSpeech}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all active:scale-95 ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-rose-400" />}
              {isRecording ? '🛑 إلغاء / توقف المايك' : 'Mic Practice'}
            </button>
          </div>
        </div>

        {/* Speech Score Result Banner */}
        {speechResult && (
          <div className="mb-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Speech Accuracy Score</span>
              <span
                className={`text-sm px-2.5 py-0.5 rounded-full font-black font-mono border ${
                  speechResult.score >= 85
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : speechResult.score >= 60
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}
              >
                {speechResult.score}%
              </span>
            </div>
            <p className="text-xs text-slate-400 italic">Transcribed: "{speechResult.transcript || 'None'}"</p>
          </div>
        )}

        {/* AI Sentence Generator & Interactive Tokens Block */}
        <div className="mb-5 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {customAiSentence ? `✨ AI Sentence (${sentenceLevel})` : 'Context Example'}
            </label>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* CEFR Level Quick Selector */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {['A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setSentenceLevel(lvl);
                      handleGenerateAiSentence(lvl);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded-lg transition-all ${
                      sentenceLevel === lvl
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleGenerateAiSentence(sentenceLevel)}
                disabled={generatingSentence}
                className="flex items-center gap-1.5 px-3 py-1 bg-purple-600/80 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              >
                {generatingSentence ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {generatingSentence ? 'Generating...' : customAiSentence ? '🔄 Change' : '✨ AI Sentence'}
              </button>
            </div>
          </div>

          {activeSentence && (
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-900/30 space-y-2">
              <SentenceTokenViewer
                sentence={activeSentence}
                targetWord={word.word}
                wordTranslations={activeWordTranslations}
                showInlineTranslationBadges={true}
              />

              {activeArabicSentence && (
                <div dir="rtl" className="mt-2 pt-2 border-t border-slate-800/80 text-right font-arabic">
                  <span className="text-[10px] text-slate-400 block mb-0.5">الترجمة العربية للجملة:</span>
                  <p className="text-xs font-bold text-amber-300">{activeArabicSentence}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(word.word)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                fav
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Star className={`w-4 h-4 ${fav ? 'fill-amber-400 text-amber-400' : ''}`} />
              {fav ? 'Favorited' : 'Add Favorite'}
            </button>

            <button
              onClick={() => toggleMastered(word.word)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                mst
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle className={`w-4 h-4 ${mst ? 'text-emerald-400' : ''}`} />
              {mst ? 'Mastered' : 'Mark Mastered'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
