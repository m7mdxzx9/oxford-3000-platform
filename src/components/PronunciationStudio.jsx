import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Award, Activity, Sliders } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playAudio, stopAudio } from '../services/audioService';
import { evaluateSpeech, recordAndEvaluateSpeech, stopListening } from '../services/speechEvaluation';
import SentenceTokenViewer from './SentenceTokenViewer';

export default function PronunciationStudio() {
  const { apiKey, addNotification, voicePreset, setVoicePreset, voicePresets, t } = useApp();
  const [targetSentence, setTargetSentence] = useState('They decided not to abandon their ambitious project after receiving support.');
  const [speed, setSpeed] = useState(0.9);
  const [pitch, setPitch] = useState(1.0);
  const [isRecording, setIsRecording] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' | 'tokens' | 'matrix'

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Live Canvas Microphone Audio Waveform Animation
  useEffect(() => {
    if (!isRecording || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;

      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      for (let x = 0; x < width; x++) {
        const angle = (x / width) * Math.PI * 4 + phase;
        const amplitude = Math.sin(x * 0.05) * 15 * (0.5 + Math.random() * 0.5);
        const y = mid + Math.sin(angle) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      phase += 0.15;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRecording]);

  const handlePlayTTS = () => {
    playAudio(targetSentence, { speed, pitch, presetId: voicePreset });
  };

  const handleStartRecording = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    setEvalResult(null);

    recordAndEvaluateSpeech(
      targetSentence,
      (res) => {
        setIsRecording(false);
        setEvalResult(res);
        if (res.score >= 80) {
          addNotification(`Outstanding Pronunciation! Score: ${res.score}%`, 'success');
        } else {
          addNotification(`Score: ${res.score}%. Practice stressed syllables.`, 'info');
        }
      },
      (err) => {
        setIsRecording(false);
        addNotification(`Mic Error: ${err.message || err}`, 'warning');
      }
    );
  };

  // Color Coding & Feedback Category
  const getFeedbackCategory = (score) => {
    if (score >= 90) return { label: 'Outstanding (90-100%)', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10', tip: 'Perfect native-like pronunciation!' };
    if (score >= 70) return { label: 'Good (70-89%)', color: 'text-teal-400 border-teal-500/40 bg-teal-500/10', tip: 'Clear pronunciation, slight accent deviation.' };
    if (score >= 50) return { label: 'Needs Practice (50-69%)', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10', tip: 'Understandable, practice vowel/consonant stress.' };
    return { label: 'Try Again (<50%)', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10', tip: 'Re-listen to audio and practice phonetics.' };
  };

  const cat = evalResult ? getFeedbackCategory(evalResult.score) : null;
  const werScore = evalResult ? Math.max(0, 100 - evalResult.score) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Studio Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Pronunciation & Speech Studio</h2>
        </div>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
          Dedicated Speech Lab evaluating Word Error Rate (WER), Levenshtein phonetic alignment, and character-level distance metrics.
        </p>
      </div>

      {/* Target Sentence Input & Dual TTS Engine Controls */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-900/30 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Target Practice Sentence or Word
          </label>
          <textarea
            value={targetSentence}
            onChange={(e) => setTargetSentence(e.target.value)}
            rows={2}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-base font-medium ltr-token"
          />
        </div>

        {/* TTS Customization Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Human Voice Preset</label>
            <select
              value={voicePreset}
              onChange={(e) => setVoicePreset(e.target.value)}
              className="w-full bg-slate-950 text-cyan-300 text-xs p-2 rounded-xl border border-slate-800 focus:outline-none"
            >
              {voicePresets.map((vp) => (
                <option key={vp.id} value={vp.id}>
                  {vp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Speed Rate ({speed}x)</label>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Pitch Level ({pitch})</label>
            <input
              type="range"
              min="0.8"
              max="1.2"
              step="0.05"
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons & Waveform */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={handlePlayTTS}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-cyan-600/20"
          >
            <Volume2 className="w-5 h-5" /> Play TTS Audio
          </button>

          {/* Live Waveform Canvas during recording */}
          {isRecording && (
            <div className="w-full sm:w-48 h-10 bg-slate-950/80 rounded-xl border border-cyan-500/40 p-1 flex items-center justify-center">
              <canvas ref={canvasRef} width={180} height={36} />
            </div>
          )}

          <button
            onClick={handleStartRecording}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {isRecording ? 'Stop Recording' : 'Record Voice'}
          </button>
        </div>
      </div>

      {/* Interactive Token breakdown */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-900/30 space-y-4">
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Click individual tokens to evaluate word pronunciation
        </span>
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <SentenceTokenViewer sentence={targetSentence} evaluationResult={evalResult} />
        </div>
      </div>

      {/* Speech Evaluation Results Dashboard */}
      {evalResult && cat && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/40 space-y-6 animate-in fade-in duration-300">
          {/* Header Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 shrink-0">
                <span className={`text-2xl font-extrabold ${evalResult.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {evalResult.score}%
                </span>
              </div>

              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cat.color}`}>
                  {cat.label}
                </span>
                <p className="text-sm text-slate-300 font-medium mt-1.5">{cat.tip}</p>
              </div>
            </div>

            <div className="text-right sm:border-l border-slate-800 sm:pl-6">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Word Error Rate (WER)</span>
              <span className="text-xl font-extrabold text-rose-400">{werScore}%</span>
            </div>
          </div>

          {/* Transcribed Speech */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Spoken Speech Transcribed:</span>
            <p className="text-sm font-semibold text-cyan-300 ltr-token">"{evalResult.transcript}"</p>
          </div>

          {/* Missing / Mispronounced Words */}
          {evalResult.missingWords && evalResult.missingWords.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Mispronounced or Missing Words:
              </span>
              <div className="flex flex-wrap gap-2">
                {evalResult.missingWords.map((word, i) => (
                  <span key={i} className="px-3 py-1 bg-rose-950 text-rose-300 border border-rose-800 rounded-lg text-xs font-mono">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
