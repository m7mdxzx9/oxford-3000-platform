import React, { useState, useRef, useEffect } from 'react';
import { UserCheck, Sparkles, Send, Volume2, Mic, MicOff, AlertCircle, Languages, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTutorResponse } from '../services/geminiService';
import { playAudio } from '../services/audioService';
import { evaluateSpeech } from '../services/speechEvaluation';

const SCENARIOS = [
  { id: 'Job Interview', title: 'Job Interview', desc: 'Practice professional interview questions and answers.' },
  { id: 'Ordering Coffee', title: 'Ordering Coffee / Food', desc: 'Learn casual dining, cafes, and ordering vocabulary.' },
  { id: 'Airport & Travel', title: 'Airport & Travel', desc: 'Navigate customs, baggage, flight details, and hotels.' },
  { id: 'Daily Casual Chat', title: 'Daily Casual Chat', desc: 'Improve relaxed small talk and daily conversations.' },
  { id: 'Academic Debate', title: 'Academic Debate', desc: 'Express formal opinions, evidence, and counterarguments.' },
  { id: 'Doctor Visit', title: 'Doctor Visit', desc: 'Describe symptoms, medical appointments, and prescriptions.' },
];

export default function PersonalTutor() {
  const { apiKey, addNotification } = useApp();
  const [scenario, setScenario] = useState('Job Interview');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'tutor',
      text: 'Hello! Welcome to our Job Interview practice. Could you start by introducing yourself and sharing your background?',
      arabic: 'مرحباً! مرحباً بك في تدريب مقابلة العمل. هل يمكنك البدء بتقديم نفسك ومشاركة خلفيتك؟',
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

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
    };

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
        if (res && res.transcript) {
          handleSendMessage(res.transcript);
        }
      },
      (err) => {
        setIsRecording(false);
        addNotification(`Speech input error: ${err}`, 'warning');
      }
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">AI Personal Voice & Chat Tutor</h2>
        </div>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
          Roleplay realistic conversational scenarios with your AI tutor. Receive instant grammar suggestions, voice responses, and Arabic translations.
        </p>
      </div>

      {/* Scenarios Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            onClick={() => handleSelectScenario(sc)}
            className={`p-3 rounded-2xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
              scenario === sc.id
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <span>{sc.title}</span>
          </button>
        ))}
      </div>

      {/* Main Chat Panel */}
      <div className="glass-panel rounded-3xl border border-cyan-900/30 overflow-hidden flex flex-col h-[500px]">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold text-white">Roleplay: {scenario}</span>
          </div>

          <button
            onClick={() => setShowArabic(!showArabic)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              showArabic ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            {showArabic ? 'Arabic On' : 'Arabic Off'}
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none'
                    : 'bg-slate-900/90 text-slate-100 border border-slate-800 rounded-bl-none'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                    {msg.sender === 'user' ? 'You' : 'AI Tutor'}
                  </span>
                  {msg.sender === 'tutor' && (
                    <button
                      onClick={() => playAudio(msg.text)}
                      className="p-1 hover:bg-slate-800 rounded text-cyan-400 transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="font-medium ltr-token">{msg.text}</p>

                {/* Grammar Feedback Alert */}
                {msg.grammarFeedback && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{msg.grammarFeedback}</span>
                  </div>
                )}

                {/* Arabic Translation */}
                {showArabic && msg.arabic && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-right dir-rtl">
                    <p className="text-xs font-semibold text-amber-300/90">{msg.arabic}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse p-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> AI Tutor is thinking...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center gap-2">
          <button
            onClick={handleMicInput}
            className={`p-3 rounded-2xl transition-all ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Speech Input"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-rose-400" />}
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your response or use microphone..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm font-medium ltr-token"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || loading}
            className="p-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl transition-all disabled:opacity-40"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
