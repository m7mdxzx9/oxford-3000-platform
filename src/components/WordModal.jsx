import React, { useState, useEffect, useMemo } from 'react';
import { Volume2, Mic, MicOff, Star, CheckCircle, X, Sparkles, RefreshCw, Layers, ExternalLink, Lightbulb, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playAudio } from '../services/audioService';
import { recordAndEvaluateSpeech, stopListening, isSpeechRecognitionSupported } from '../services/speechEvaluation';
import { generateSentence } from '../services/geminiService';
import { getCuratedWordImage, fetchWordImage } from '../services/imageService';
import SentenceTokenViewer from './SentenceTokenViewer';
import AudioSpeedControl from './AudioSpeedControl';
import IpaSyllableVisualizer from './IpaSyllableVisualizer';
import { fetchFreeDictDetails, fetchDatamuseDetails } from '../services/dictionaryService';
import { analyzeSilentLetters } from '../utils/phoneticsUtils';
import { getMnemonicForWord } from '../utils/mnemonicsData';

export default function WordModal({ word, onClose }) {
  const {
    isFavorite,
    toggleFavorite,
    isMastered,
    toggleMastered,
    addNotification,
    voicePreset,
    setVoicePreset,
    voicePresets,
    audioSpeed,
    setAudioSpeed,
    apiKey,
    addXp,
  } = useApp();

  const [isRecording, setIsRecording] = useState(false);
  const [speechResult, setSpeechResult] = useState(null);

  // FreeDict & Datamuse API Data State
  const [freeDictData, setFreeDictData] = useState(null);
  const [datamuseData, setDatamuseData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (word && word.word) {
      // Fetch FreeDict details
      fetchFreeDictDetails(word.word).then((data) => {
        if (isMounted && data) setFreeDictData(data);
      });

      // Fetch Datamuse details
      fetchDatamuseDetails(word.word).then((data) => {
        if (isMounted && data) setDatamuseData(data);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [word]);

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
      addNotification('Web Speech API is not supported on this browser version.', 'warning');
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
        if (res.score >= 80) {
          addNotification(`Outstanding pronunciation! Score: ${res.score}%`, 'success');
        } else {
          addNotification(`Score: ${res.score}%. Listen to audio and try again.`, 'info');
        }
      },
      (err) => {
        setIsRecording(false);
        addNotification(`Recording note: ${err.message || err}`, 'info');
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="card-theme-target w-full max-w-2xl border rounded-3xl p-5 sm:p-7 shadow-2xl relative my-auto max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar with Badges and Close Button */}
        <div className="flex items-center justify-between pb-3 border-b mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 text-xs font-black rounded-lg theme-btn-primary">
              CEFR {word.cefr || word.level || 'B1'}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-black rounded-lg theme-btn-secondary uppercase font-mono">
              {word.pos || 'word'}
            </span>
            {word.isCustom && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Gemini AI
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl theme-btn-secondary opacity-75 hover:opacity-100 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto pr-1 space-y-4 flex-1 overscroll-contain">
          {/* Word Title & IPA Visualizer with Silent Letters */}
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <h2 dir="ltr" className="ltr-isolate text-3xl sm:text-4xl font-black tracking-tight">
              {analyzeSilentLetters(word.word).map((ch, i) => (
                <span key={i} className={ch.isSilent ? 'silent-letter text-rose-500' : ''} title={ch.note || ''}>
                  {ch.char}
                </span>
              ))}
            </h2>
            <IpaSyllableVisualizer ipa={word.ipa || word.phonetic || `/${word.word}/`} />
          </div>

          {/* Arabic Translation Block */}
          <div dir="rtl" className="rtl-text p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-center font-arabic">
            <span className="text-[11px] opacity-75 font-bold block mb-0.5">الترجمة العربية والسياق</span>
            <p className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-300">
              {word.arabic || word.translation}
            </p>
          </div>

          {/* Visual Mnemonic Hook (Feature 33) */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-medium space-y-1 font-arabic">
            <div className="flex items-center gap-1.5 font-bold">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>الربط بالصورة الذهنية (Visual Mnemonic):</span>
            </div>
            <p className="leading-relaxed">
              {getMnemonicForWord(word.word, word.arabic, word.example).hook}
            </p>
          </div>

          {/* Synonyms & Antonyms */}
          {datamuseData && (datamuseData.synonyms?.length > 0 || datamuseData.antonyms?.length > 0) && (
            <div className="p-3.5 rounded-2xl border bg-black/5 space-y-2 text-xs font-black">
              {datamuseData.synonyms?.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-cyan-600 dark:text-cyan-400 font-black">المرادفات (Synonyms):</span>
                  {datamuseData.synonyms.slice(0, 5).map((syn, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg theme-btn-secondary text-[11px] font-bold">
                      {syn}
                    </span>
                  ))}
                </div>
              )}
              {datamuseData.antonyms?.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-rose-600 dark:text-rose-400 font-black">المتضادات (Antonyms):</span>
                  {datamuseData.antonyms.slice(0, 5).map((ant, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg theme-btn-secondary text-[11px] font-bold text-rose-500">
                      {ant}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Voice Engine Controls */}
          <div className="p-4 rounded-2xl border bg-black/5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black flex items-center gap-1.5 opacity-80">
                <Volume2 className="w-4 h-4 text-cyan-500" /> Voice Engine:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <AudioSpeedControl speed={audioSpeed} onSpeedChange={setAudioSpeed} compact={true} />
                <select
                  value={voicePreset}
                  onChange={(e) => setVoicePreset(e.target.value)}
                  className="glass-input text-xs font-black p-1.5 rounded-xl border focus:outline-none max-w-[170px] truncate"
                >
                  {voicePresets.map((vp) => (
                    <option key={vp.id} value={vp.id} className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">
                      {vp.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handlePlayWord(audioSpeed)}
                  className="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 theme-btn-primary rounded-xl text-xs font-black shadow-md active:scale-95 transition-all"
                >
                  <Volume2 className="w-4 h-4" /> Listen Audio
                </button>
                <button
                  onClick={() => handlePlayWord(0.75)}
                  className="min-h-[44px] px-3 py-2.5 theme-btn-secondary rounded-xl text-xs font-bold active:scale-95"
                >
                  0.75x Slow
                </button>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => toggleFavorite(word.word)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                    fav ? 'bg-amber-500/20 text-amber-500 border-amber-500/40' : 'theme-btn-secondary'
                  }`}
                >
                  <Star className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                  <span>Favorite</span>
                </button>
                <button
                  onClick={() => toggleMastered(word.word)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                    mst ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40' : 'theme-btn-secondary'
                  }`}
                >
                  <CheckCircle className={`w-4 h-4 ${mst ? 'fill-current' : ''}`} />
                  <span>Mastered</span>
                </button>
              </div>
            </div>
          </div>

          {/* Example Sentence & Token Viewer */}
          <div className="p-4 rounded-2xl border space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Example Sentence:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleGenerateAiSentence('A2')}
                  disabled={generatingSentence}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold border theme-btn-secondary"
                >
                  A2 AI
                </button>
                <button
                  onClick={() => handleGenerateAiSentence('B1')}
                  disabled={generatingSentence}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold border theme-btn-secondary"
                >
                  B1 AI
                </button>
                <button
                  onClick={() => handleGenerateAiSentence('B2')}
                  disabled={generatingSentence}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold border theme-btn-secondary"
                >
                  B2 AI
                </button>
                <button
                  onClick={() => handleGenerateAiSentence()}
                  disabled={generatingSentence}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold theme-btn-primary flex items-center gap-1"
                >
                  {generatingSentence ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  <span>✨ New AI</span>
                </button>
              </div>
            </div>

            <SentenceTokenViewer
              sentence={activeSentence}
              targetWord={word.word}
              arabicTranslation={activeArabicSentence}
              wordTranslations={activeWordTranslations}
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => playAudio(activeSentence, { speed: audioSpeed, presetId: voicePreset })}
                className="min-h-[44px] flex-1 flex items-center justify-center gap-2 py-2 rounded-xl theme-btn-secondary text-xs font-bold active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5" /> Listen Full Sentence
              </button>
              <button
                onClick={handleRecordSpeech}
                className={`min-h-[44px] flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  isRecording ? 'bg-rose-500 text-white animate-pulse' : 'theme-btn-primary shadow-sm'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'Listening...' : 'Practice Speaking'}</span>
              </button>
            </div>

            {speechResult && (
              <div className="p-3 rounded-xl border bg-black/5 space-y-1 text-xs font-bold">
                <div className="flex items-center justify-between">
                  <span>Accuracy Score:</span>
                  <span className={speechResult.score >= 80 ? 'text-emerald-500' : 'text-amber-500'}>
                    {speechResult.score}%
                  </span>
                </div>
                <p className="text-[11px] opacity-80">{speechResult.feedback}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
