import React, { useState, useRef, useEffect } from 'react';
import { UserCheck, Send, Volume2, Mic, MicOff, AlertCircle, Languages, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTutorResponse } from '../services/geminiService';
import { playAudio } from '../services/audioService';
import { startListening, stopListening } from '../services/speechEvaluation';
import SentenceTokenViewer from './SentenceTokenViewer';

const SCENARIOS = [
  { id: 'Job Interview', title: 'Job Interview', arTitle: 'مقابلة عمل' },
  { id: 'Ordering Coffee', title: 'Ordering Coffee', arTitle: 'طلب قهوة' },
  { id: 'Airport & Travel', title: 'Airport & Travel', arTitle: 'المطار والسفر' },
  { id: 'Daily Casual Chat', title: 'Daily Casual Chat', arTitle: 'محادثة يومية' },
  { id: 'Academic Debate', title: 'Academic Debate', arTitle: 'نقاش أكاديمي' },
];

export default function PersonalTutor() {
  const { apiKey, addNotification, t, voicePreset, setVoicePreset, voicePresets, language, addXp } = useApp();
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
        arabic: `مرحباً بك في جلسة ${sc.arTitle || sc.title}! كيف يمكنني مساعدتك في هذا السيناريو اليوم؟`,
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
        wordTranslations: res.wordTranslations || {},
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
        addNotification(`Speech input note: ${err.message || err}`, 'info');
      }
    );
  };

  const latestTutorMsg = [...messages].reverse().find(m => m.sender === 'tutor');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="card-theme-target p-6 sm:p-8 rounded-3xl border shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 theme-btn-primary rounded-2xl shadow-md">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black">{t('tutorTitle')}</h2>
            <p className="text-xs sm:text-sm font-medium opacity-80 mt-1">{t('tutorSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Scenario Buttons & Voice Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${
                scenario === sc.id
                  ? 'theme-btn-primary shadow-sm scale-102'
                  : 'theme-btn-secondary opacity-75 hover:opacity-100'
              }`}
            >
              {language === 'ar' && sc.arTitle ? sc.arTitle : sc.title}
            </button>
          ))}
        </div>

        <select
          value={voicePreset}
          onChange={(e) => setVoicePreset(e.target.value)}
          className="glass-input text-xs font-black p-2.5 rounded-xl border focus:outline-none w-full sm:w-auto"
        >
          {voicePresets.map((vp) => (
            <option key={vp.id} value={vp.id} className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">
              {vp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Container */}
      <div className="card-theme-target rounded-3xl border overflow-hidden flex flex-col min-h-[380px] max-h-[540px] h-[55vh] shadow-2xl">
        <div className="p-4 border-b flex items-center justify-between bg-black/5">
          <span className="text-xs sm:text-sm font-black flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            {t('roleplayScenario')} {scenario}
          </span>

          <button
            onClick={() => setShowArabic(!showArabic)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
              showArabic ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary opacity-80'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            {showArabic ? t('showArabic') : t('hideArabic')}
          </button>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[88%] sm:max-w-[82%] p-4 rounded-2xl text-xs sm:text-sm font-bold shadow-md border ${
                  msg.sender === 'user'
                    ? 'theme-btn-primary rounded-br-none'
                    : 'card-theme-target rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-70">
                    {msg.sender === 'user' ? 'You' : 'AI Tutor'}
                  </span>
                  {msg.sender === 'tutor' && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 theme-btn-secondary rounded-md text-[10px] font-black border">
                        CEFR {msg.cefrRating || 'B1'}
                      </span>
                      <button
                        onClick={() => playAudio(msg.text, { presetId: voicePreset })}
                        className="p-1 hover:scale-110 transition-transform text-cyan-600 dark:text-cyan-400"
                        title="Listen"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 leading-relaxed">
                  <SentenceTokenViewer
                    sentence={msg.text}
                    wordTranslations={msg.wordTranslations}
                    showInlineTranslationBadges={showArabic}
                  />
                </div>

                {/* Phrase Corrections */}
                {msg.corrections && msg.corrections.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
                    <span className="font-black text-amber-600 dark:text-amber-300 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Phrase Suggestion:
                    </span>
                    {msg.corrections.map((c, i) => (
                      <div key={i} className="opacity-90">
                        <span className="line-through text-rose-500">{c.original}</span> ➔{' '}
                        <span className="text-emerald-500 font-black">{c.improved}</span>
                        <p className="text-[11px] opacity-75 italic">{c.reason}</p>
                      </div>
                    ))}
                  </div>
                )}

                {showArabic && msg.arabic && (
                  <div dir="rtl" className="rtl-text mt-2 pt-2 border-t border-black/10 text-right font-arabic">
                    <span className="text-[10px] opacity-75 block mb-0.5 font-bold">ترجمة الرد الكامل:</span>
                    <p className="text-xs font-black text-amber-600 dark:text-amber-300">{msg.arabic}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs font-black text-cyan-600 dark:text-cyan-400 animate-pulse p-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Gemini AI is crafting response...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Quick Replies Chips */}
        {latestTutorMsg && latestTutorMsg.suggestedReplies && latestTutorMsg.suggestedReplies.length > 0 && (
          <div className="px-4 py-2 border-t flex items-center gap-2 overflow-x-auto bg-black/5 no-scrollbar">
            <span className="text-[10px] uppercase font-black shrink-0 flex items-center gap-1 opacity-70">
              <Sparkles className="w-3 h-3 text-cyan-500" /> Ideas:
            </span>
            {latestTutorMsg.suggestedReplies.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sug)}
                className="px-3 py-1 theme-btn-secondary rounded-full text-xs font-bold shrink-0 transition-all ltr-token border"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t flex items-center gap-2 bg-black/5">
          <button
            onClick={handleMicInput}
            className={`p-3 rounded-2xl transition-all border ${
              isRecording ? 'bg-rose-600 text-white animate-pulse' : 'theme-btn-secondary'
            }`}
            title="Mic Input"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-rose-500" />}
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t('typeMessage')}
            className="flex-1 glass-input px-4 py-3 text-sm font-bold ltr-token rounded-2xl"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || loading}
            className="p-3.5 theme-btn-primary font-black rounded-2xl disabled:opacity-40 transition-all shadow-md active:scale-95 shrink-0"
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
