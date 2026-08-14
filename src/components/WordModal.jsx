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
  const { isFavorite, toggleFavorite, isMastered, toggleMastered, addNotification, voicePreset, setVoicePreset, voicePresets, audioSpeed, setAudioSpeed, apiKey, addXp } = useApp();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="card-theme-target w-full max-w-2xl border rounded-3xl p-5 sm:p-7 shadow-2xl relative flex flex-col max-h-[92vh] overflow-y-auto overscroll-contain">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-2 rounded-xl theme-btn-secondary opacity-70 hover:opacity-100 transition-all z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3 pe-8">
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

        {/* Word Title & IPA Visualizer with Silent Letters */}
        <div className="flex items-baseline justify-between gap-2 mb-3 flex-wrap">
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
        <div dir="rtl" className="rtl-text mb-4 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-center font-arabic">
          <span className="text-[11px] opacity-75 font-bold block mb-0.5">الترجمة العربية والسياق</span>
          <p className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-300">
            {word.arabic || word.translation}
          </p>
        </div>

        {/* Visual Mnemonic Hook (Feature 33) */}
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-medium space-y-1 font-arabic">
          <div className="flex items-center gap-1.5 font-bold">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>الربط بالصورة الذهنية (Visual Mnemonic):</span>
          </div>
          <p className="leading-relaxed">
            {getMnemonicForWord(word.word, word.arabic, word.example).hook}
          </p>
        </div>

        {/* Synonyms & Antonyms from Dictionary Service */}
        {datamuseData && (datamuseData.synonyms?.length > 0 || datamuseData.antonyms?.length > 0) && (
          <div className="mb-4 p-3.5 rounded-2xl border bg-black/5 space-y-2 text-xs font-black">
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
        <div className="p-4 rounded-2xl border bg-black/5 mb-4 space-y-3">
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
                <Volume2 className="w-4 h-4" /> Listen Audio ({audioSpeed}x)
              </button>

              {freeDictData?.audioUrl && (
                <button
                  onClick={() => {
                    const a = new Audio(freeDictData.audioUrl);
                    a.play();
                  }}
                  className="min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 theme-btn-secondary rounded-xl text-xs font-black shadow-sm active:scale-95 transition-all"
                >
                  <Volume2 className="w-4 h-4 text-amber-500" /> MP3 Audio 🔊
                </button>
              )}
            </div>

            <button
              onClick={handleRecordSpeech}
              className={`min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 border ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse font-black shadow-md'
                  : 'theme-btn-secondary'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-rose-500" />}
              {isRecording ? 'Stop Recording' : 'Mic Practice'}
            </button>
          </div>
        </div>

        {/* Speech Evaluation Score */}
        {speechResult && (
          <div className="mb-4 p-3.5 rounded-2xl border bg-black/5 space-y-1.5 text-xs font-bold">
            <div className="flex items-center justify-between">
              <span className="opacity-80">Speech Accuracy Score:</span>
              <span className={`text-sm px-2.5 py-0.5 rounded-lg font-black font-mono border ${
                speechResult.score >= 80 ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' : 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
              }`}>
                {speechResult.score}%
              </span>
            </div>
            <p className="opacity-75 italic">Transcribed: "{speechResult.transcript || 'None'}"</p>
          </div>
        )}

        {/* AI Sentence Generator & Interactive Tokens Block */}
        <div className="mb-4 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="block text-xs font-black uppercase tracking-wider opacity-80">
              {customAiSentence ? `✨ AI Sentence (${sentenceLevel})` : 'Context Example'}
            </label>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* CEFR Level Quick Selector */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-xl border theme-btn-secondary">
                {['A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setSentenceLevel(lvl);
                      handleGenerateAiSentence(lvl);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-black rounded-lg transition-all ${
                      sentenceLevel === lvl
                        ? 'theme-btn-primary shadow-sm'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleGenerateAiSentence(sentenceLevel)}
                disabled={generatingSentence}
                className="flex items-center gap-1.5 px-3 py-1 theme-btn-primary rounded-xl text-xs font-black shadow-sm active:scale-95 disabled:opacity-50"
              >
                {generatingSentence ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {generatingSentence ? 'Generating...' : customAiSentence ? '🔄 Change' : '✨ AI Sentence'}
              </button>
            </div>
          </div>

          {activeSentence && (
            <div className="p-3.5 rounded-2xl border bg-black/5 space-y-2">
              <SentenceTokenViewer
                sentence={activeSentence}
                targetWord={word.word}
                wordTranslations={activeWordTranslations}
                showInlineTranslationBadges={true}
              />

              {activeArabicSentence && (
                <div dir="rtl" className="rtl-text mt-2 pt-2 border-t border-black/10 text-right font-arabic">
                  <span className="text-[10px] opacity-75 block mb-0.5 font-bold">الترجمة العربية للجملة:</span>
                  <p className="text-xs font-black text-amber-600 dark:text-amber-300">{activeArabicSentence}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-3 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(word.word)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${
                fav
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40'
                  : 'theme-btn-secondary opacity-75 hover:opacity-100'
              }`}
            >
              <Star className={`w-4 h-4 ${fav ? 'fill-amber-400 text-amber-400' : ''}`} />
              {fav ? 'Favorited' : 'Add Favorite'}
            </button>

            <button
              onClick={() => toggleMastered(word.word)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${
                mst
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
                  : 'theme-btn-secondary opacity-75 hover:opacity-100'
              }`}
            >
              <CheckCircle className={`w-4 h-4 ${mst ? 'text-emerald-500' : ''}`} />
              {mst ? 'Mastered' : 'Mark Mastered'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 theme-btn-primary rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
