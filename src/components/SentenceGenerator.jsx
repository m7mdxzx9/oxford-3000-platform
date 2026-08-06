import React, { useState } from 'react';
import { Sparkles, RefreshCw, Volume2, Mic, MicOff, Check, BookOpen, Dice5 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateSentence } from '../services/geminiService';
import { playAudio } from '../services/audioService';
import { recordAndEvaluateSpeech, stopListening } from '../services/speechEvaluation';
import { oxford3000Data } from '../data/oxford3000';
import SentenceTokenViewer from './SentenceTokenViewer';
import SpeechScoreVisualizer from './SpeechScoreVisualizer';

export default function SentenceGenerator() {
  const { apiKey, addNotification, t, voicePreset, setVoicePreset, voicePresets } = useApp();
  const [targetWord, setTargetWord] = useState('abandon');
  const [length, setLength] = useState('medium');
  const [position, setPosition] = useState('any');
  const [style, setStyle] = useState('Casual Conversation');
  const [tense, setTense] = useState('Present');

  const [aiResult, setAiResult] = useState({
    sentence: 'They decided not to abandon their ambitious project after receiving support.',
    arabic: 'قرروا عدم التخلي عن مشروعهم الطموح بعد تلقي الدعم.',
    grammarNote: 'Natural B2 verb usage in complex past clause.'
  });

  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechResult, setSpeechResult] = useState(null);

  const handlePickRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * oxford3000Data.length);
    const randomTerm = oxford3000Data[randomIndex]?.word || 'achieve';
    setTargetWord(randomTerm);
    addNotification(`Selected random word: "${randomTerm}"`, 'info');
  };

  const handleGenerate = async () => {
    if (!targetWord.trim()) {
      addNotification('Please enter a target word.', 'warning');
      return;
    }

    setLoading(true);
    setSpeechResult(null);

    try {
      const res = await generateSentence(targetWord, length, position, style, tense, apiKey);
      if (typeof res === 'object') {
        setAiResult(res);
      } else {
        setAiResult({ sentence: res, arabic: '', grammarNote: '' });
      }
      addNotification(`AI generated new sentence for "${targetWord}"`, 'success');
    } catch (err) {
      addNotification('Failed to generate sentence with Gemini AI.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySentence = () => {
    if (aiResult?.sentence) {
      playAudio(aiResult.sentence, { presetId: voicePreset });
    }
  };

  const handleRecordSentence = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    setSpeechResult(null);

    recordAndEvaluateSpeech(
      aiResult.sentence,
      (res) => {
        setIsRecording(false);
        setSpeechResult(res);
      },
      (err) => {
        setIsRecording(false);
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
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t('sentenceTitle')}</h2>
            <p className="text-xs sm:text-sm opacity-80 mt-1">{t('sentenceSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Advanced Control Panel */}
      <div className="glass-panel p-6 rounded-3xl border space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold uppercase tracking-wider opacity-75">
                {t('targetWordLabel')}
              </label>
              <button
                onClick={handlePickRandomWord}
                className="text-xs theme-btn-secondary px-2 py-0.5 flex items-center gap-1"
              >
                <Dice5 className="w-3.5 h-3.5" /> Random Word
              </button>
            </div>
            <input
              type="text"
              value={targetWord}
              onChange={(e) => setTargetWord(e.target.value)}
              className="w-full glass-input px-4 py-3 text-sm font-extrabold ltr-token"
              placeholder="e.g. abandon, achieve, resilient..."
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 opacity-75">
              {t('styleLabel')}
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full glass-input px-4 py-3 text-xs font-extrabold"
            >
              <option value="Casual Conversation" className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">Casual Conversation</option>
              <option value="Simple A1/A2" className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">Simple A1/A2 Level</option>
              <option value="Academic B2" className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">Academic B2 Level</option>
              <option value="Business" className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">Business Context</option>
              <option value="Story Format" className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">Story Format</option>
            </select>
          </div>

          <div className="w-full sm:w-44">
            <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 opacity-75">
              Grammar Tense
            </label>
            <select
              value={tense}
              onChange={(e) => setTense(e.target.value)}
              className="w-full glass-input px-4 py-3 text-xs font-extrabold"
            >
              <option value="Present" className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">Present Simple</option>
              <option value="Past" className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">Past Simple</option>
              <option value="Future" className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">Future Tense</option>
              <option value="Present Perfect" className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">Present Perfect</option>
              <option value="Conditional" className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">Conditional</option>
            </select>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 opacity-75">
              {t('lengthLabel')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'short', label: t('shortLength') },
                { id: 'medium', label: t('medLength') },
                { id: 'long', label: t('longLength') },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLength(opt.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all border ${
                    length === opt.id
                      ? 'theme-btn-primary shadow-sm'
                      : 'theme-btn-secondary opacity-70 hover:opacity-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 opacity-75">
              {t('positionLabel')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'beginning', label: 'Start' },
                { id: 'middle', label: 'Middle' },
                { id: 'end', label: 'End' },
                { id: 'any', label: 'Any' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPosition(opt.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all border ${
                    position === opt.id
                      ? 'theme-btn-primary shadow-sm'
                      : 'theme-btn-secondary opacity-70 hover:opacity-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 theme-btn-primary text-sm font-black transition-all disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {t('generateBtn')}
        </button>
      </div>

      {/* Result Card */}
      {aiResult && aiResult.sentence && (
        <div className="card-theme-target glass-card p-6 sm:p-8 rounded-3xl border space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" /> Interactive Token Breakdown
            </span>

            <button
              onClick={handleGenerate}
              className="flex items-center gap-1.5 text-xs font-bold opacity-80 hover:opacity-100 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> {t('regenerateBtn')}
            </button>
          </div>

          <div className="p-5 rounded-2xl border bg-black/5">
            <SentenceTokenViewer sentence={aiResult.sentence} targetWord={targetWord} />
          </div>

          {/* Arabic Translation */}
          {aiResult.arabic && (
            <div className="p-4 rounded-2xl border bg-black/5 text-right dir-rtl font-arabic">
              <p className="text-base font-extrabold">{aiResult.arabic}</p>
            </div>
          )}

          {/* Grammar Note */}
          {aiResult.grammarNote && (
            <div className="p-3 rounded-xl border bg-black/5 text-xs flex items-center gap-2 font-bold">
              <BookOpen className="w-4 h-4 shrink-0 opacity-80" />
              <span>{aiResult.grammarNote}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <select
                value={voicePreset}
                onChange={(e) => setVoicePreset(e.target.value)}
                className="glass-input text-xs font-extrabold p-2.5 rounded-xl border"
              >
                {voicePresets.map((vp) => (
                  <option key={vp.id} value={vp.id} className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">
                    {vp.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handlePlaySentence}
                className="flex items-center gap-2 px-5 py-2.5 theme-btn-primary rounded-xl font-bold transition-all shadow-md text-xs"
              >
                <Volume2 className="w-4 h-4" /> {t('listenSentence')}
              </button>
            </div>

            <button
              onClick={handleRecordSentence}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                isRecording ? 'bg-rose-600 text-white animate-pulse' : 'theme-btn-secondary'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {t('readSentence')}
            </button>
          </div>

          {speechResult && (
            <SpeechScoreVisualizer
              targetText={aiResult.sentence}
              speechResult={speechResult}
              onClose={() => setSpeechResult(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
