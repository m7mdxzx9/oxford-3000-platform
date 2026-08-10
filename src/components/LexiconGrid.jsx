import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Check, Star, Volume2, Sparkles, RefreshCw, Mic, BookOpen, Download } from 'lucide-react';
import { oxford3000Data } from '../data/oxford3000';
import { useApp } from '../context/AppContext';
import { playAudio } from '../services/audioService';
import { fetchMissingTerm, generateSentence } from '../services/geminiService';
import { startListening, stopListening, evaluateSpeech, isSpeechRecognitionSupported } from '../services/speechEvaluation';
import { getCuratedWordImage, fetchWordImage } from '../services/imageService';
import SentenceTokenViewer from './SentenceTokenViewer';
import SpeechScoreVisualizer from './SpeechScoreVisualizer';
import WordModal from './WordModal';
import ExportModal from './ExportModal';
import IpaSyllableVisualizer from './IpaSyllableVisualizer';
import AudioSpeedControl from './AudioSpeedControl';

// CEFR Level Color Badge Mapping
const CEFR_BADGES = {
  A1: {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    label: 'A1 Beginner',
  },
  A2: {
    bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    label: 'A2 Elementary',
  },
  B1: {
    bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    label: 'B1 Intermediate',
  },
  B2: {
    bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    label: 'B2 Upper-Int',
  },
  C1: {
    bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    label: 'C1 Advanced',
  },
};

// Part of Speech Badge Styling
const POS_STYLES = {
  n: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  noun: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  v: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  verb: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  adj: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  adjective: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  adv: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  adverb: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  prep: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  preposition: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

// Individual Interactive Lexicon Card Component
const LexiconCard = React.memo(({ wordObj, onCardClick }) => {
  const {
    isFavorite,
    toggleFavorite,
    isMastered,
    toggleMastered,
    isSelectedWord,
    toggleSelectWord,
    selectedWordsCount,
    addNotification,
    voicePreset,
    apiKey,
    setIsApiKeyModalOpen,
  } = useApp();

  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [spokenTranscript, setSpokenTranscript] = useState('');

  // Dynamic photo state for this word card
  const [cardImg, setCardImg] = useState(() => getCuratedWordImage(wordObj.word));

  useEffect(() => {
    let isMounted = true;
    fetchWordImage(wordObj.word).then((url) => {
      if (isMounted && url) {
        setCardImg(url);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [wordObj.word]);

  const favorited = isFavorite(wordObj.word);
  const mastered = isMastered(wordObj.word);
  const selected = isSelectedWord(wordObj);

  const cefrStyle = CEFR_BADGES[wordObj.cefr] || {
    bg: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    label: wordObj.cefr || 'CEFR',
  };

  const posStyle = POS_STYLES[wordObj.pos?.toLowerCase()] || 'bg-slate-500/15 text-slate-300 border-slate-500/30';

  const activeSentence = customAiSentence?.sentence || wordObj.example;
  const activeArabic = customAiSentence?.arabic;
  const activeWordTranslations = customAiSentence?.wordTranslations;

  const handlePlayWord = async (e) => {
    e.stopPropagation();
    try {
      setIsPlayingWord(true);
      await playAudio(wordObj.word, { speed: 0.85, presetId: voicePreset });
    } catch (err) {
      console.error('TTS playback error:', err);
    } finally {
      setIsPlayingWord(false);
    }
  };

  const handlePlayExample = async (e) => {
    if (e) e.stopPropagation();
    if (!activeSentence) return;
    try {
      setIsPlayingExample(true);
      await playAudio(activeSentence, { speed: 0.9, presetId: voicePreset });
    } catch (err) {
      console.error('TTS example playback error:', err);
    } finally {
      setIsPlayingExample(false);
    }
  };

  const handleStartPractice = (e) => {
    if (e) e.stopPropagation();
    if (!activeSentence) return;
    setIsPracticing(true);
    setIsListening(true);
    setEvalResult(null);

    startListening(
      (spoken) => {
        setSpokenTranscript(spoken);
        setIsListening(false);
        const result = evaluateSpeech(activeSentence, spoken);
        setEvalResult(result);
      },
      (err) => {
        setIsListening(false);
        console.error('Speech recognition error:', err);
      }
    );
  };

  const handleClosePractice = (e) => {
    if (e) e.stopPropagation();
    stopListening();
    setIsPracticing(false);
    setIsListening(false);
    setEvalResult(null);
  };

  const handleSelectWord = (e) => {
    e.stopPropagation();
    if (!selected && selectedWordsCount >= 5) {
      addNotification('Maximum 5 words can be selected for Storytelling.', 'warning');
      return;
    }
    toggleSelectWord(wordObj);
  };

  const handleCreateNewAiSentence = async (e) => {
    if (e) e.stopPropagation();
    setIsGeneratingAiSentence(true);
    try {
      const res = await generateSentence(wordObj.word, 'medium', 'any', 'Casual Conversation', 'Present', apiKey, wordObj.cefr || 'B1');
      if (res && res.sentence) {
        setCustomAiSentence(res);
        addNotification(`Generated new AI sentence for "${wordObj.word}"`, 'success');
      }
    } catch (err) {
      addNotification('Failed to generate AI sentence.', 'warning');
    } finally {
      setIsGeneratingAiSentence(false);
    }
  };

  return (
    <div
      onClick={() => onCardClick && onCardClick(wordObj)}
      className={`card-theme-target group relative flex flex-col justify-between p-5 pb-6 rounded-2xl cursor-pointer transition-all duration-300 glass-card-interactive ${
        selected
          ? 'ring-2 ring-indigo-500/80 border-indigo-500/60 shadow-lg'
          : mastered
          ? 'border-emerald-500/50'
          : ''
      }`}
    >
      {/* Top Bar Controls (Storyteller Select Checkbox, Mastered Toggle, Favorite Toggle) */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Storyteller Select Checkbox */}
        <button
          onClick={handleSelectWord}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all active:scale-95 shadow-sm ${
            selected
              ? 'theme-btn-primary'
              : 'theme-btn-secondary opacity-90 hover:opacity-100'
          }`}
          title={selected ? 'Remove from Storyteller' : 'Select for AI Storyteller (Max 5)'}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Story</span>
        </button>

        {/* Action Icons (Mastered & Favorite) */}
        <div className="flex items-center space-x-1.5">
          {/* Mastered Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMastered(wordObj.word);
            }}
            className={`p-2 rounded-xl border transition-all active:scale-90 flex items-center justify-center ${
              mastered
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                : 'theme-btn-secondary opacity-70 hover:opacity-100'
            }`}
            title={mastered ? 'Marked as Mastered' : 'Mark as Mastered'}
          >
            <Check className={`w-4 h-4 ${mastered ? 'text-emerald-400' : ''}`} />
          </button>

          {/* Favorite Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(wordObj.word);
            }}
            className={`p-2 rounded-xl border transition-all active:scale-90 flex items-center justify-center ${
              favorited
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                : 'theme-btn-secondary opacity-70 hover:opacity-100'
            }`}
            title={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <Star className={`w-4 h-4 ${favorited ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Contextual Visual Aid Photo Banner */}
      <div className="relative w-full h-24 mb-3 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
        <img
          src={cardImg}
          alt={wordObj.word}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80';
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>

      {/* Main Card Content */}
      <div className="space-y-3">
        {/* Word Title & Audio Play Button & Speed Controls */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 dir="ltr" className="ltr-isolate text-xl font-extrabold tracking-tight transition-colors">
              {wordObj.word}
            </h3>
            {wordObj.ipa && <IpaSyllableVisualizer ipa={wordObj.ipa} />}
          </div>

          {/* Audio TTS Button & Speed Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            <AudioSpeedControl compact={true} />
            <button
              onClick={handlePlayWord}
              disabled={isPlayingWord}
              className={`p-2 rounded-xl border transition-all active:scale-90 flex items-center justify-center ${
                isPlayingWord
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md animate-pulse'
                  : 'theme-btn-secondary opacity-90 hover:opacity-100'
              }`}
              title="Listen to pronunciation (TTS)"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Badges Row (POS & CEFR) */}
        <div className="flex items-center flex-wrap gap-2">
          {/* POS Tag */}
          <span dir="ltr" className={`ltr-isolate text-xs font-semibold px-2.5 py-0.5 rounded-lg border capitalize ${posStyle}`}>
            {wordObj.pos || 'word'}
          </span>

          {/* CEFR Level Tag */}
          <span dir="ltr" className={`ltr-isolate text-xs font-bold px-2.5 py-0.5 rounded-lg border shadow-sm ${cefrStyle.bg}`}>
            {wordObj.cefr || 'A1'}
          </span>
        </div>

        {/* Arabic Translation Block (RTL Isolated) */}
        <div dir="rtl" className="rtl-text rtl-isolate p-3 rounded-2xl border border-white/[0.08] mt-2 bg-slate-950/40">
          <p className="text-lg font-extrabold tracking-wide font-arabic text-amber-300">
            {wordObj.arabic}
          </p>
        </div>

        {/* AI Sentence Generator & Interactive Tokens Block */}
        <div dir="ltr" className="ltr-isolate bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/60 text-xs text-slate-300 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium flex-wrap gap-1.5">
            <span className="font-extrabold flex items-center gap-1.5 text-cyan-400">
              {customAiSentence ? '✨ AI Sentence' : 'Example Sentence'}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCreateNewAiSentence}
                disabled={isGeneratingAiSentence}
                className="px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-1 bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25 active:scale-95 shadow-sm"
                title="Generate new custom AI sentence for this word"
              >
                <span>{isGeneratingAiSentence ? 'Generating...' : customAiSentence ? '🔄 Change' : '✨ AI Sentence'}</span>
              </button>

              {activeSentence && (
                <>
                  <button
                    type="button"
                    onClick={handlePlayExample}
                    disabled={isPlayingExample}
                    className="px-2 py-1 rounded-lg text-[11px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 transition-all flex items-center gap-1 active:scale-95"
                    title="Listen to full example sentence"
                  >
                    <span>{isPlayingExample ? 'Playing...' : 'Play'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStartPractice}
                    className="px-2 py-1 rounded-lg text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 transition-all flex items-center gap-1 active:scale-95"
                    title="Practice speaking sentence with mic"
                  >
                    <span>Mic</span>
                  </button>
                </>
              )}
            </div>
          </div>


          {/* Interactive Word Tokens */}
          {activeSentence && (
            <SentenceTokenViewer
              sentence={activeSentence}
              targetWords={[wordObj.word]}
              wordTranslations={activeWordTranslations}
              wordBreakdown={evalResult?.wordBreakdown}
              showInlineTranslationBadges={Boolean(customAiSentence)}
              size="sm"
            />
          )}

          {/* AI Generated Arabic Sentence Translation */}
          {activeArabic && (
            <div dir="rtl" className="mt-2 pt-2 border-t border-slate-800/60 text-right font-arabic">
              <span className="text-[10px] opacity-75 font-semibold block mb-0.5 text-amber-500">الترجمة العربية للجملة:</span>
              <p className="text-xs font-extrabold text-amber-300">{activeArabic}</p>
            </div>
          )}

          {customAiSentence?.needsApiKey && (
            <div className="mt-2 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[11px] space-y-1.5 dir-rtl font-arabic">
              <p className="font-bold">⚠️ انتهت حصة المفتاح الافتراضي لليوم (HTTP 429). أضف مفتاحك المجاني لتوليد الجمل حية 100%:</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsApiKeyModalOpen(true); }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] hover:bg-amber-400 transition-all flex items-center gap-1 active:scale-95 shadow-sm"
              >
                🔑 إضافة مفتاح Gemini API جديد
              </button>
            </div>
          )}

          {/* Speech Evaluation Modal Drawer */}
          {isPracticing && (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">Speech Practice</span>
                <button
                  type="button"
                  onClick={handleClosePractice}
                  className="text-[10px] text-slate-500 hover:text-slate-300"
                >
                  Close
                </button>
              </div>
              {isListening && (
                <div className="flex items-center space-x-2 text-xs text-cyan-400 animate-pulse bg-cyan-950/30 p-2 rounded-lg border border-cyan-800/40">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>Listening... Speak the example sentence now.</span>
                </div>
              )}
              {evalResult && (
                <SpeechScoreVisualizer
                  evaluationResult={evalResult}
                  expectedText={activeSentence}
                  spokenText={spokenTranscript}
                  onRetry={handleStartPractice}
                  onListenReference={handlePlayExample}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export const LexiconGrid = () => {
  const { customWords, addCustomWord, apiKey, selectedWords, setActiveTab, addNotification } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [selectedCefr, setSelectedCefr] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);

  // Gemini Missing Term State
  const [isFetchingTerm, setIsFetchingTerm] = useState(false);
  const [activeModalWord, setActiveModalWord] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Merge static oxford3000 dataset with dynamic custom words
  const fullDataset = useMemo(() => {
    const combined = [...customWords, ...oxford3000Data];
    const seen = new Set();
    return combined.filter((item) => {
      if (!item || !item.word) return false;
      const lower = item.word.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
  }, [customWords]);

  // Alphabet letter list (ALL, A-Z)
  const alphabet = useMemo(() => ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')], []);

  // Filtered dataset calculation
  const filteredWords = useMemo(() => {
    return fullDataset.filter((item) => {
      // 1. Search Query Filter (English word or Arabic translation)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesWord = item.word.toLowerCase().includes(query);
        const matchesArabic = item.arabic && item.arabic.toLowerCase().includes(query);
        if (!matchesWord && !matchesArabic) return false;
      }

      // 2. A-Z Letter Filter
      if (selectedLetter !== 'ALL') {
        if (item.word.charAt(0).toUpperCase() !== selectedLetter) return false;
      }

      // 3. CEFR Level Filter
      if (selectedCefr !== 'ALL') {
        if (item.cefr.toUpperCase() !== selectedCefr.toUpperCase()) return false;
      }

      return true;
    });
  }, [fullDataset, searchQuery, selectedLetter, selectedCefr]);

  // Handle filter changes and reset page
  const handleLetterSelect = (letter) => {
    setSelectedLetter(letter);
    setCurrentPage(1);
  };

  const handleCefrSelect = (cefr) => {
    setSelectedCefr(cefr);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLetter('ALL');
    setSelectedCefr('ALL');
    setCurrentPage(1);
  };

  // Virtual Pagination calculations
  const totalFilteredItems = filteredWords.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredItems / itemsPerPage));

  // Ensure valid current page range
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedWords = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredWords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWords, safeCurrentPage, itemsPerPage]);

  // Handle Fetch Missing Term with Gemini AI
  const handleFetchMissingTerm = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsFetchingTerm(true);
      const fetched = await fetchMissingTerm(searchQuery.trim(), apiKey);
      if (fetched) {
        addCustomWord(fetched);
      }
    } catch (err) {
      console.error('Error fetching missing term:', err);
      addNotification('Failed to fetch word with Gemini AI.', 'error');
    } finally {
      setIsFetchingTerm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search Bar Section */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Oxford 3000™ Lexicon Catalog</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                {totalFilteredItems} Words
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Explore the complete Oxford 3000 CEFR vocabulary (A1-B2) with audio TTS, IPA phonetics, and Arabic translations.
            </p>
          </div>

          {/* Actions Bar: Export Deck & Items Per Page */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-btn-primary text-xs font-black transition-all shadow-sm hover:brightness-110 shrink-0"
              title="Export vocabulary deck to PDF, Anki, Markdown, or JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>📥 تصدير الكلمات (Export)</span>
            </button>

            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <span>Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="glass-input px-2.5 py-1.5 rounded-lg text-zinc-200 bg-zinc-900 border border-white/[0.08] focus:border-indigo-500"
              >
                <option value={16}>16 per page</option>
                <option value={20}>20 per page</option>
                <option value={24}>24 per page</option>
                <option value={32}>32 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interactive Search Bar & Clear Action */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search word in English or translation in Arabic..."
            className="w-full pl-10 pr-24 py-3 rounded-xl glass-input text-sm text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute inset-y-0 right-3 flex items-center px-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* CEFR Level Filter Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">CEFR Level Filter</span>
            {(selectedCefr !== 'ALL' || selectedLetter !== 'ALL' || searchQuery) && (
              <button
                onClick={clearFilters}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {['ALL', 'A1', 'A2', 'B1', 'B2'].map((cefr) => {
              const isActive = selectedCefr === cefr;
              return (
                <button
                  key={cefr}
                  onClick={() => handleCefrSelect(cefr)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] scale-105'
                      : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-cyan-500/40 hover:text-white'
                  }`}
                >
                  {cefr === 'ALL' ? 'ALL LEVELS' : cefr}
                </button>
              );
            })}
          </div>
        </div>

        {/* A-Z Letter Filter Bar */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">A-Z Alphabet Filter</span>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 scrollbar-thin">
            {alphabet.map((letter) => {
              const isActive = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => handleLetterSelect(letter)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all border ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:bg-slate-800 hover:text-cyan-300'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Storyteller Selection Quick Floating Bar */}
      {selectedWords.length > 0 && (
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 flex items-center justify-between gap-4 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-sm">
              {selectedWords.length}
            </span>
            <div>
              <p className="text-xs font-semibold text-cyan-200">
                Words selected for AI Storyteller ({selectedWords.length}/5 max):
              </p>
              <p dir="ltr" className="ltr-isolate text-xs text-slate-300 font-medium">
                {selectedWords.map((w) => (typeof w === 'string' ? w : w.word)).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('story')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-md"
          >
            Generate Story →
          </button>
        </div>
      )}

      {/* Grid Summary Info */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="font-semibold text-slate-200">{paginatedWords.length ? (safeCurrentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
          <span className="font-semibold text-slate-200">{Math.min(safeCurrentPage * itemsPerPage, totalFilteredItems)}</span> of{' '}
          <span className="font-semibold text-slate-200">{totalFilteredItems}</span> words
        </div>
        <div>
          Page <span className="font-semibold text-cyan-400">{safeCurrentPage}</span> of{' '}
          <span className="font-semibold text-slate-200">{totalPages}</span>
        </div>
      </div>

      {/* Catalog Grid Cards Rendering */}
      {paginatedWords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {paginatedWords.map((wordObj) => (
            <LexiconCard
              key={`${wordObj.word}-${wordObj.id}`}
              wordObj={wordObj}
              onCardClick={setActiveModalWord}
            />
          ))}
        </div>
      ) : (
        /* Empty State & AI Instant Lexicon Fetcher Card */
        <div className="glass-panel p-8 rounded-2xl border border-cyan-500/30 text-center max-w-lg mx-auto shadow-2xl shadow-cyan-950/40 my-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Instant Lexicon Fetcher
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            No local matches for "{searchQuery.trim() ? <span className="text-cyan-400 ltr-isolate" dir="ltr">{searchQuery.trim()}</span> : 'current filter'}"
          </h3>
          <p className="text-sm text-slate-300 mb-6">
            Word is missing from the local Oxford 3000 dataset. Dynamically query Gemini AI to fetch CEFR level, Arabic translation, IPA phonetic, and usage example.
          </p>

          {searchQuery.trim() ? (
            <button
              onClick={handleFetchMissingTerm}
              disabled={isFetchingTerm}
              className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-medium px-6 py-3.5 rounded-xl shadow-lg transition-all transform active:scale-98"
            >
              {isFetchingTerm ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Fetching '{searchQuery.trim()}' with Gemini AI...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.1a2 2 0 00-1.022.547l-1.8 1.8a2 2 0 001.414 3.414h15.616a2 2 0 001.414-3.414l-1.8-1.8z" />
                  </svg>
                  <span>Fetch '{searchQuery.trim()}' with Gemini AI</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Virtual Pagination Controls */}
      {totalPages > 1 && (
        <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={safeCurrentPage === 1}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white transition-all"
          >
            « First
          </button>

          <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white transition-all"
            >
              ‹ Prev
            </button>

            {/* Page number buttons window */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - safeCurrentPage) <= 2 || p === 1 || p === totalPages)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="px-1 text-slate-500 text-xs">...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                        safeCurrentPage === p
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white transition-all"
            >
              Next ›
            </button>
          </div>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage === totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 hover:text-white transition-all"
          >
            Last »
          </button>
        </div>
      )}

      {/* Interactive Word Modal */}
      {activeModalWord && (
        <WordModal
          word={activeModalWord}
          onClose={() => setActiveModalWord(null)}
        />
      )}

      {/* Vocabulary Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        filteredWords={filteredWords}
      />
    </div>
  );
};

export default LexiconGrid;
