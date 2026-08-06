import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Award, Activity, Sliders, Type } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { playAudio } from '../services/audioService';
import { evaluateSpeech, recordAndEvaluateSpeech, stopListening } from '../services/speechEvaluation';
import SentenceTokenViewer from './SentenceTokenViewer';
import SpeechScoreVisualizer from './SpeechScoreVisualizer';

export default function PronunciationStudio() {
  const { apiKey, addNotification, voicePreset, setVoicePreset, voicePresets, t } = useApp();
  const [targetSentence, setTargetSentence] = useState('They decided not to abandon their ambitious project after receiving support.');
  const [manualSpokenInput, setManualSpokenInput] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speed, setSpeed] = useState(0.9);
  const [pitch, setPitch] = useState(1.0);
  const [isRecording, setIsRecording] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

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
    setLiveTranscript('');
    setEvalResult(null);

    recordAndEvaluateSpeech(
      targetSentence,
      (res) => {
        setIsRecording(false);
        setEvalResult(res);
        if (res.transcript) setManualSpokenInput(res.transcript);
        if (res.score >= 80) {
          addNotification(`Outstanding Pronunciation! Score: ${res.score}%`, 'success');
        } else {
          addNotification(`Score: ${res.score}%. Practice stressed syllables.`, 'info');
        }
      },
      (err) => {
        setIsRecording(false);
        addNotification(`Mic Note: ${err.message || err}`, 'info');
      },
      (liveText) => {
        setLiveTranscript(liveText);
      }
    );
  };

  const handleEvaluateManualInput = () => {
    if (!manualSpokenInput.trim()) {
      addNotification('Please enter or speak a sentence first.', 'warning');
      return;
    }
    const res = evaluateSpeech(targetSentence, manualSpokenInput);
    setEvalResult(res);
    addNotification(`Evaluated spoken text: ${res.score}% Score`, 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Studio Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 theme-btn-primary rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Pronunciation & Speech Studio</h2>
            <p className="text-xs sm:text-sm opacity-80 mt-1">
              Real-time Speech Recognition & Live Transcription Engine with Levenshtein phonetic alignment.
            </p>
          </div>
        </div>
      </div>

      {/* Target Sentence Input & Dual TTS Engine Controls */}
      <div className="glass-panel p-6 rounded-3xl border space-y-6">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 opacity-75">
            Target Practice Sentence or Word
          </label>
          <textarea
            value={targetSentence}
            onChange={(e) => setTargetSentence(e.target.value)}
            rows={2}
            className="w-full glass-input p-3.5 text-sm font-extrabold ltr-token"
          />
        </div>

        {/* TTS Customization Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl border bg-black/5">
          <div>
            <label className="block text-[11px] font-extrabold uppercase mb-1 opacity-75">Human Voice Preset</label>
            <select
              value={voicePreset}
              onChange={(e) => setVoicePreset(e.target.value)}
              className="w-full glass-input text-xs font-extrabold p-2"
            >
              {voicePresets.map((vp) => (
                <option key={vp.id} value={vp.id} className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">
                  {vp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase mb-1 opacity-75">Speed Rate ({speed}x)</label>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase mb-1 opacity-75">Pitch Level ({pitch})</label>
            <input
              type="range"
              min="0.8"
              max="1.2"
              step="0.05"
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons & Waveform */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <button
            onClick={handlePlayTTS}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 theme-btn-primary text-xs font-bold transition-all"
          >
            <Volume2 className="w-4 h-4" /> Play TTS Audio
          </button>

          {/* Live Waveform Canvas */}
          <div className={`w-full sm:w-48 h-9 rounded-xl border border-black/10 bg-black/5 p-1 flex items-center justify-center transition-all ${isRecording ? 'opacity-100' : 'opacity-0 pointer-events-none hidden sm:flex'}`}>
            <canvas ref={canvasRef} width={180} height={32} />
          </div>

          <button
            onClick={handleStartRecording}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all border ${
              isRecording ? 'bg-rose-600 text-white animate-pulse' : 'theme-btn-primary'
            }`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {isRecording ? 'Stop Recording' : '🎙️ Record Voice'}
          </button>
        </div>

        {/* Live Transcription Bar while recording */}
        {isRecording && (
          <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 space-y-1 animate-pulse">
            <span className="text-xs font-black uppercase text-amber-500 flex items-center gap-1.5">
              <Mic className="w-4 h-4 animate-spin" /> Live Transcribing Your Speech (يكتب ما تقوله الآن):
            </span>
            <p dir="ltr" className="ltr-isolate text-sm font-black font-mono text-amber-600">
              "{liveTranscript || 'Listening... Speak clearly into your microphone...'}"
            </p>
          </div>
        )}

        {/* Manual Spoken Input & Fallback Text Evaluation */}
        <div className="p-4 rounded-2xl border bg-black/5 space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider opacity-75 flex items-center gap-1.5">
            <Type className="w-4 h-4" /> Or Type / Edit Spoken Speech (كتابة الكلام المنطوق يدويًا):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={manualSpokenInput}
              onChange={(e) => setManualSpokenInput(e.target.value)}
              className="flex-1 glass-input px-4 py-2.5 text-xs font-extrabold ltr-token"
              placeholder="e.g. They decided not to abandon their project..."
            />
            <button
              onClick={handleEvaluateManualInput}
              className="theme-btn-primary px-4 py-2.5 text-xs font-extrabold whitespace-nowrap"
            >
              Evaluate Spoken Text
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Token breakdown */}
      <div className="glass-panel p-6 rounded-3xl border space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Click individual tokens to evaluate word pronunciation
        </span>
        <div className="p-5 rounded-2xl border bg-black/5">
          <SentenceTokenViewer sentence={targetSentence} evaluationResult={evalResult} />
        </div>
      </div>

      {/* Speech Evaluation Results Dashboard */}
      {evalResult && (
        <SpeechScoreVisualizer
          evaluationResult={evalResult}
          expectedText={targetSentence}
          spokenText={evalResult.transcript || manualSpokenInput}
          liveTranscript={liveTranscript}
          onRetry={handleStartRecording}
          onListenReference={handlePlayTTS}
        />
      )}
    </div>
  );
}
