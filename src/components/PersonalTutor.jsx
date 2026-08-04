import React, { useState, useRef, useEffect } from 'react';
import { UserCheck, Send, Volume2, Mic, MicOff, AlertCircle, Languages, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTutorResponse } from '../services/geminiService';
import { playAudio } from '../services/audioService';
import { evaluateSpeech } from '../services/speechEvaluation';

const SCENARIOS = [
  { id: 'Job Interview', title: 'Job Interview' },
  { id: 'Ordering Coffee', title: 'Ordering Coffee' },
  { id: 'Airport & Travel', title: 'Airport & Travel' },
  { id: 'Daily Casual Chat', title: 'Daily Casual Chat' },
  { id: 'Academic Debate', title: 'Academic Debate' },
];

export default function PersonalTutor() {
  const { apiKey, addNotification, t } = useApp();
  const [scenario, setScenario] = useState('Job Interview');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'tutor',
      text: 'Hello! Welcome to our Job Interview practice. Could you start by introducing yourself?',
      arabic: 'مرحباً! مرحباً بك في تدريب مقابلة العمل. هل يمكنك البدء بتقديم نفسك؟',
      grammarFeedback: null
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
        grammarFeedback: null
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
        grammarFeedback: res.grammarFeedback
      };
      setMessages((prev) => [...prev, tutorMsg]);
      playAudio(res.reply);
    } catch (err) {
      addNotification('Error receiving tutor response.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMicInput = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    evaluateSpeech(
      '',
      (res) => {
        setIsRecording(false);
        if (res && res.transcript) handleSendMessage(res.transcript);
      },
      (err) => {
        setIsRecording(false);
        addNotification(`Speech input error: ${err}`, 'warning');
      }
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{t('tutorTitle')}</h2>
        </div>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl">{t('tutorSubtitle')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            onClick={() => handleSelectScenario(sc)}
            className={`p-3 rounded-2xl text-xs font-bold transition-all text-center ${
              scenario === sc.id ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900/80 text-slate-400 border border-slate-800'
            }`}
          >
            {sc.title}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-3xl border border-cyan-900/30 overflow-hidden flex flex-col h-[500px]">
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-sm font-bold text-white">{t('roleplayScenario')} {scenario}</span>

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
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-100 border border-slate-800'}`}>
                <p className="font-medium ltr-token">{msg.text}</p>
                {msg.grammarFeedback && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{msg.grammarFeedback}</span>
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
          {loading && <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse p-2"><RefreshCw className="w-4 h-4 animate-spin" /> Thinking...</div>}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2">
          <button
            onClick={handleMicInput}
            className={`p-3 rounded-2xl ${isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300'}`}
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
