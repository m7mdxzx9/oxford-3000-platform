import React, { useState } from 'react';
import { Sparkles, RefreshCw, Volume2, Mic, MicOff, Check, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateSentence } from '../services/geminiService';
import { playAudio } from '../services/audioService';
import { recordAndEvaluateSpeech, stopListening } from '../services/speechEvaluation';
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
      addNotification('Failed to generate sentence.', 'error');
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
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t('sentenceTitle')}</h2>
        </div>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl">{t('sentenceSubtitle')}</p>
      </div>

      {/* Advanced Control Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-900/30 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {t('targetWordLabel')}
            </label>
            <input
              type="text"
              value={targetWord}
              onChange={(e) => setTargetWord(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 ltr-token font-semibold"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {t('styleLabel')}
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Casual Conversation">Casual Conversation</option>
              <option value="Simple A1/A2">Simple A1/A2 Level</option>
              <option value="Academic B2">Academic B2 Level</option>
              <option value="Business">Business Context</option>
              <option value="Story Format">Story Format</option>
            </select>
          </div>

          <div className="w-full sm:w-44">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Grammar Tense
            </label>
            <select
              value={tense}
              onChange={(e) => setTense(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Present">Present Simple</option>
              <option value="Past">Past Simple</option>
              <option value="Future">Future Tense</option>
              <option value="Present Perfect">Present Perfect</option>
              <option value="Conditional">Conditional</option>
            </select>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
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
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    length === opt.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
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
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                    position === opt.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
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
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold rounded-2xl shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {t('generateBtn')}
        </button>
      </div>

      {/* Result Card */}
      {aiResult && aiResult.sentence && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" /> Interactive Token Breakdown
            </span>

            <button
              onClick={handleGenerate}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> {t('regenerateBtn')}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-900/40">
            <SentenceTokenViewer sentence={aiResult.sentence} targetWord={targetWord} />
          </div>

          {/* Arabic Translation */}
          {aiResult.arabic && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-right dir-rtl">
              <p className="text-base font-bold text-amber-300">{aiResult.arabic}</p>
            </div>
          )}

          {/* Grammar Note */}
          {aiResult.grammarNote && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-center gap-2">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>{aiResult.grammarNote}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <select
                value={voicePreset}
                onChange={(e) => setVoicePreset(e.target.value)}
                className="bg-slate-900 text-xs text-slate-300 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
              >
                {voicePresets.map((vp) => (
                  <option key={vp.id} value={vp.id}>
                    {vp.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handlePlaySentence}
                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-all shadow-lg"
              >
                <Volume2 className="w-5 h-5" /> {t('listenSentence')}
              </button>
            </div>

            <button
              onClick={handleRecordSentence}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-rose-400" />}
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
