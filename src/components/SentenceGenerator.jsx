import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Sparkles, RefreshCw, Volume2, Mic, MicOff, Check, BookOpen, Dice5, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateSentence } from '../services/geminiService';
import { playAudio } from '../services/audioService';
import { recordAndEvaluateSpeech, stopListening } from '../services/speechEvaluation';
import { oxford3000Data } from '../data/oxford3000';
import SentenceTokenViewer from './SentenceTokenViewer';
import SpeechScoreVisualizer from './SpeechScoreVisualizer';

export default function SentenceGenerator() {
  const { apiKey, addNotification, t, voicePreset, setVoicePreset, voicePresets, setIsApiKeyModalOpen } = useApp();
  const [targetWord, setTargetWord] = useState('abandon');
  const [length, setLength] = useState('medium');
  const [position, setPosition] = useState('any');
  const [style, setStyle] = useState('Casual Conversation');
  const [tense, setTense] = useState('Present');

  const [cefrLevel, setCefrLevel] = useState('B1');

  const [aiResult, setAiResult] = useState({
    sentence: 'They decided not to abandon their ambitious project after receiving support.',
    arabic: 'قرروا عدم التخلي عن مشروعهم الطموح بعد تلقي الدعم.',
    grammarNote: 'Natural B2 verb usage in complex past clause.'
  });

  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechResult, setSpeechResult] = useState(null);

  // Autocomplete suggestions dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute matching autocomplete words from Oxford 3000 catalog
  const wordSuggestions = useMemo(() => {
    if (!targetWord || !targetWord.trim()) return oxford3000Data.slice(0, 12);
    const query = targetWord.trim().toLowerCase();

    const startsWith = [];
    const contains = [];

    for (let i = 0; i < oxford3000Data.length; i++) {
      const item = oxford3000Data[i];
      if (!item || !item.word) continue;
      const lowerWord = item.word.toLowerCase();
      const lowerArabic = item.arabic ? item.arabic.toLowerCase() : '';
      
      if (lowerWord.startsWith(query)) {
        startsWith.push(item);
      } else if (lowerWord.includes(query) || lowerArabic.includes(query)) {
        contains.push(item);
      }

      if (startsWith.length + contains.length >= 20) break;
    }

    return [...startsWith, ...contains].slice(0, 15);
  }, [targetWord]);

  const handlePickRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * oxford3000Data.length);
    const randomTerm = oxford3000Data[randomIndex]?.word || 'achieve';
    setTargetWord(randomTerm);
    setIsDropdownOpen(false);
    addNotification(`Selected random word: "${randomTerm}"`, 'info');
  };

  const handleSelectSuggestion = (wordObj) => {
    setTargetWord(wordObj.word);
    setIsDropdownOpen(false);
    addNotification(`Selected "${wordObj.word}" (${wordObj.arabic})`, 'info');
  };

  const handleClearTargetInput = () => {
    setTargetWord('');
    setIsDropdownOpen(true);
  };

  const handleGenerate = async () => {
    if (!targetWord.trim()) {
      addNotification('Please enter a target word.', 'warning');
      return;
    }

    setIsDropdownOpen(false);
    setLoading(true);
    setSpeechResult(null);

    try {
      const res = await generateSentence(targetWord, length, position, style, tense, apiKey, cefrLevel);
      if (typeof res === 'object') {
        setAiResult(res);
      } else {
        setAiResult({ sentence: res, arabic: '', grammarNote: '' });
      }
      addNotification(`AI generated new ${cefrLevel} sentence for "${targetWord}"`, 'success');
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
      addNotification('Microphone recording stopped.', 'info');
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
        {/* CEFR Difficulty Level Selector Bar */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase tracking-wider opacity-75 flex items-center justify-between">
            <span>🎯 AI Sentence Difficulty Level (مستوى صعوبة الجملة):</span>
            <span className="text-amber-500 font-bold">{cefrLevel} Level</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[
              { id: 'A1', label: 'A1 Easy' },
              { id: 'A2', label: 'A2 Elem' },
              { id: 'B1', label: 'B1 Inter' },
              { id: 'B2', label: 'B2 Upper' },
              { id: 'C1', label: 'C1 Adv' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setCefrLevel(lvl.id)}
                className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all border text-center ${
                  cefrLevel === lvl.id
                    ? 'theme-btn-primary shadow-md scale-105'
                    : 'theme-btn-secondary opacity-70 hover:opacity-100'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Target Word Input with Interactive Autocomplete Dropdown */}
          <div className="flex-1 space-y-2 relative" ref={dropdownRef}>
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

            <div className="relative">
              <input
                type="text"
                value={targetWord}
                onChange={(e) => {
                  setTargetWord(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full glass-input px-4 py-3 text-sm font-extrabold ltr-token pr-16"
                placeholder="Type letter or word (e.g. c, car, resilient)..."
              />
              <div className="absolute inset-y-0 right-3 flex items-center gap-1">
                {targetWord && (
                  <button
                    type="button"
                    onClick={handleClearTargetInput}
                    className="p-1 rounded-full hover:bg-black/10 text-xs font-bold opacity-60 hover:opacity-100"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <Search className="w-4 h-4 opacity-50 pointer-events-none" />
              </div>
            </div>

            {/* Floating Autocomplete Dropdown */}
            {isDropdownOpen && wordSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 glass-panel border rounded-2xl shadow-2xl max-h-72 overflow-y-auto p-1.5 space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-extrabold opacity-75 flex items-center justify-between border-b border-black/10">
                  <span>Matching Words in Oxford 3000 ({wordSuggestions.length}):</span>
                  <span>Click to select</span>
                </div>
                {wordSuggestions.map((item) => (
                  <button
                    key={item.id || item.word}
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-black/10 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm group-hover:text-amber-500 transition-colors">
                        {item.word}
                      </span>
                      {item.pos && (
                        <span className="text-[10px] opacity-75 font-mono px-1.5 py-0.5 rounded border border-black/10">
                          {item.pos}
                        </span>
                      )}
                      {item.cefr && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded border theme-btn-primary">
                          {item.cefr}
                        </span>
                      )}
                    </div>
                    {item.arabic && (
                      <span className="text-xs font-extrabold text-amber-500 font-arabic dir-rtl">
                        {item.arabic}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" /> Interactive Sentence & Word Tokens
              </span>
              {aiResult?.isRealAi !== false ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-purple-400" /> Live Gemini 2.5 Flash AI
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Offline Context Mode
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                className="flex items-center gap-1.5 text-xs font-bold opacity-80 hover:opacity-100 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> {t('regenerateBtn')}
              </button>
            </div>
          </div>

          {aiResult?.needsApiKey && (
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 space-y-3">
              <p className="text-xs font-extrabold dir-rtl font-arabic leading-relaxed">
                ⚠️ انتهت حصة اليوم لمفتاح Gemini API الافتراضي (Google HTTP 429 Quota Exceeded). للحصول على إنشاء حي ومباشر 100% بالذكاء الاصطناعي دون قوالب، يرجى إضافة مفتاحك المجاني بنقرة واحدة من Google AI Studio:
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsApiKeyModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  🔑 إضافة مفتاح Gemini API مجاني الآن
                </button>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-400 underline font-bold hover:text-amber-300"
                >
                  احصل على مفتاح مجاني في 5 ثوانٍ ➔
                </a>
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl border bg-black/5 space-y-2">
            <SentenceTokenViewer
              sentence={aiResult.sentence}
              targetWord={targetWord}
              wordTranslations={aiResult.wordTranslations}
              showInlineTranslationBadges={true}
            />
          </div>

          {/* Word-by-word Arabic Translations Chips */}
          {aiResult.wordTranslations && Object.keys(aiResult.wordTranslations).length > 0 && (
            <div className="p-4 rounded-2xl border bg-black/5 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 dir-rtl font-arabic">
                🔤 ترجمة كلمات الجملة (كلمة بكلمة):
              </span>
              <div className="flex flex-wrap gap-2 dir-rtl">
                {Object.entries(aiResult.wordTranslations).map(([enWord, arTrans], idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs font-extrabold text-amber-300 font-arabic flex items-center gap-1"
                  >
                    <span dir="ltr" className="font-sans text-white ltr-isolate">{enWord}</span>: {arTrans}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Arabic Translation */}
          {aiResult.arabic && (
            <div className="p-4 rounded-2xl border bg-black/5 text-right dir-rtl font-arabic">
              <span className="text-xs opacity-75 font-semibold block mb-1">الترجمة العربية الكاملة للجملة:</span>
              <p className="text-base font-extrabold text-amber-300">{aiResult.arabic}</p>
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
                isRecording ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30' : 'theme-btn-secondary'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-rose-400" />}
              {isRecording ? '🛑 إلغاء / توقف المايك' : t('readSentence')}
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
