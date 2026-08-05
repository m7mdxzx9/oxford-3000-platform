import React, { useState, useRef, useEffect } from 'react';
import { UserCheck, Send, Volume2, Mic, MicOff, AlertCircle, Languages, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTutorResponse } from '../services/geminiService';
import { playAudio } from '../services/audioService';
import { startListening, stopListening } from '../services/speechEvaluation';

const SCENARIOS = [
  { id: 'Job Interview', title: 'Job Interview' },
  { id: 'Ordering Coffee', title: 'Ordering Coffee' },
  { id: 'Airport & Travel', title: 'Airport & Travel' },
  { id: 'Daily Casual Chat', title: 'Daily Casual Chat' },
  { id: 'Academic Debate', title: 'Academic Debate' },
];

export default function PersonalTutor() {
  const { apiKey, addNotification, t, voicePreset, setVoicePreset, voicePresets } = useApp();
  const [scenario, setScenario] = useState('Job Interview');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'tutor',
      text: 'Hello! Welcome to our Job Interview practice. Could you start by introducing yourself and your professional background?',
      arabic: 'مرحباً! مرحباً بك في تدريب مقابلة العمل. هل يمكنك البدء بتقديم نفسك وخلفيتك المهنية؟',
      corrections: [],
      suggestedReplies: [
        'I am a motivated candidate with experience in communication.',
        'Thank you! I am excited to apply for this position.'
      ],
      cefrRating: 'B1'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [showArabic, setShowArabic] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectScenario = (sc) => {
    setScenario(sc.id);
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'tutor',
        text: `Welcome to the ${sc.title} session! How can I assist you with this scenario today?`,
        arabic: `مرحباً بك في جلسة ${sc.title}! كيف يمكنني مساعدتك في هذا السيناريو اليوم؟`,
        corrections: [],
        suggestedReplies: [`Hello! I would like to practice ${sc.title}.`],
        cefrRating: 'B1'
      }
    ]);
  };

  const handleSendMessage = async (textToSend = inputMessage) => {
    if (!textToSend.trim()) return;

    const userMsg = { id: `user-${Date.now()}`, sender: 'user', text: textToSend.trim() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await getTutorResponse(scenario, userMsg.text, newHistory, apiKey);
      const tutorMsg = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: res.reply,
        arabic: res.arabic,
        corrections: res.corrections || [],
        suggestedReplies: res.suggestedReplies || [],
        cefrRating: res.cefrRating || 'B1'
      };
      setMessages((prev) => [...prev, tutorMsg]);
      playAudio(res.reply, { presetId: voicePreset });
    } catch (err) {
      addNotification('Error receiving tutor response.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMicInput = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    startListening(
      (transcript) => {
        setIsRecording(false);
        if (transcript) handleSendMessage(transcript);
      },
      (err) => {
        setIsRecording(false);
        addNotification(`Speech input error: ${err.message || err}`, 'warning');
      }
    );
  };

  const latestTutorMsg = [...messages].reverse().find(m => m.sender === 'tutor');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t('tutorTitle')}</h2>
        </div>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl">{t('tutorSubtitle')}</p>
      </div>

      {/* Scenario Buttons & Voice Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                scenario === sc.id ? 'bg-indigo-600 text-white shadow-sm border border-indigo-500' : 'bg-zinc-900 text-zinc-400 border border-white/[0.08] hover:text-zinc-200'
              }`}
            >
              {sc.title}
            </button>
          ))}
        </div>

        <select
          value={voicePreset}
          onChange={(e) => setVoicePreset(e.target.value)}
          className="bg-zinc-900 text-xs text-zinc-200 p-2.5 rounded-xl border border-white/[0.08] focus:outline-none w-full sm:w-auto"
        >
          {voicePresets.map((vp) => (
            <option key={vp.id} value={vp.id}>
              {vp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Container */}
      <div className="glass-panel rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col min-h-[380px] max-h-[520px] h-[55vh]">
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            {t('roleplayScenario')} {scenario}
          </span>

          <button
            onClick={() => setShowArabic(!showArabic)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
              showArabic ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            {showArabic ? t('showArabic') : t('hideArabic')}
          </button>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-bl-none'}`}>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                    {msg.sender === 'user' ? 'You' : 'AI Tutor'}
                  </span>
                  {msg.sender === 'tutor' && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-[10px] font-bold">
                        CEFR {msg.cefrRating || 'B1'}
                      </span>
                      <button onClick={() => playAudio(msg.text, { presetId: voicePreset })} className="p-1 hover:bg-slate-800 rounded text-cyan-400">
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="font-medium ltr-token">{msg.text}</p>

                {/* Phrase Corrections */}
                {msg.corrections && msg.corrections.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Phrase Suggestion:
                    </span>
                    {msg.corrections.map((c, i) => (
                      <div key={i} className="text-slate-300">
                        <span className="line-through text-rose-400">{c.original}</span> ➔{' '}
                        <span className="text-emerald-400 font-bold">{c.improved}</span>
                        <p className="text-[11px] text-slate-400 italic">{c.reason}</p>
                      </div>
                    ))}
                  </div>
                )}

                {showArabic && msg.arabic && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-right dir-rtl">
                    <p className="text-xs font-semibold text-amber-300/90">{msg.arabic}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse p-2"><RefreshCw className="w-4 h-4 animate-spin" /> Gemini AI is crafting response...</div>}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Quick Replies Chips */}
        {latestTutorMsg && latestTutorMsg.suggestedReplies && latestTutorMsg.suggestedReplies.length > 0 && (
          <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Ideas:
            </span>
            {latestTutorMsg.suggestedReplies.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sug)}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 rounded-full text-xs font-medium shrink-0 transition-all ltr-token"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2">
          <button
            onClick={handleMicInput}
            className={`p-3 rounded-2xl transition-all ${isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300'}`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-rose-400" />}
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t('typeMessage')}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm ltr-token"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || loading}
            className="p-3 bg-emerald-500 text-slate-950 font-bold rounded-2xl disabled:opacity-40"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
