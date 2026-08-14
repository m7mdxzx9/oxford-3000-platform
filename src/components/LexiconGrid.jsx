import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Check, Star, Volume2, Sparkles, RefreshCw, Mic, BookOpen, Download, Flame, Compass, Zap } from 'lucide-react';
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
import EmptyState from './EmptyState';
import WordOfTheDayWidget from './WordOfTheDayWidget';
import { getWordExample } from '../utils/exampleSentenceService';
import { normalizeArabicText } from '../utils/arabicTranslationDictionary';

// CEFR Level Color Badge Mapping with High-Contrast Dual-Mode Support
const CEFR_BADGES = {
  A1: {
    bg: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    label: 'A1 Beginner',
  },
  A2: {
    bg: 'bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30',
    label: 'A2 Elementary',
  },
  B1: {
    bg: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30',
    label: 'B1 Intermediate',
  },
  B2: {
    bg: 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30',
    label: 'B2 Upper-Int',
  },
  C1: {
    bg: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
    label: 'C1 Advanced',
  },
};

// Part of Speech Badge Styling with High-Contrast Dual-Mode Support
const POS_STYLES = {
  n: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30',
  noun: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30',
  v: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
  verb: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
  adj: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
  adjective: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
  adv: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
  adverb: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
  prep: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
  preposition: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
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
    t,
  } = useApp();

  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [spokenTranscript, setSpokenTranscript] = useState('');

  // Dynamic photo state for this word card
  const [cardImg, setCardImg] = useState(() => getCuratedWordImage(wordObj.word));

  // AI Sentence Generator State for this card
  const [customAiSentence, setCustomAiSentence] = useState(null);
  const [isGeneratingAiSentence, setIsGeneratingAiSentence] = useState(false);

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

  const activeSentence = customAiSentence?.sentence || getWordExample(wordObj);
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
      className={`card-theme-target group relative flex flex-col justify-between p-4 sm:p-5 pb-5 rounded-2xl cursor-pointer transition-all duration-300 glass-card-interactive ${
        selected
          ? 'ring-2 ring-indigo-500/80 border-indigo-500/60 shadow-lg'
          : mastered
          ? 'border-emerald-500/50'
          : ''
      }`}
    >
      {/* Top Header Row (Word Title + Action Buttons Group) */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Word Title & POS/CEFR Badges */}
        <div>
          <h3 dir="ltr" className="ltr-isolate text-xl sm:text-2xl font-black tracking-tight text-[var(--text-main)] leading-none mb-1">
            {wordObj.word}
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span dir="ltr" className={`ltr-isolate text-[10px] font-extrabold px-2 py-0.5 rounded-md border capitalize ${posStyle}`}>
              {wordObj.pos || 'word'}
            </span>
            <span dir="ltr" className={`ltr-isolate text-[10px] font-black px-2 py-0.5 rounded-md border shadow-sm ${cefrStyle.bg}`}>
              {wordObj.cefr || 'A1'}
            </span>
          </div>
        </div>

        {/* Action Controls Group (Story, Mastered, Favorite) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleSelectWord}
            className={`px-2 py-1 rounded-lg text-xs font-black border transition-all active:scale-95 shadow-sm ${
              selected
                ? 'theme-btn-primary'
                : 'theme-btn-secondary opacity-80 hover:opacity-100'
            }`}
            title={selected ? 'Remove from Storyteller' : 'Select for AI Storyteller'}
          >
            <Plus className="w-3.5 h-3.5 inline mr-0.5" />
            <span>{t('storyBtn')}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMastered(wordObj.word);
            }}
            className={`p-1.5 rounded-lg border transition-all active:scale-90 flex items-center justify-center ${
              mastered
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                : 'theme-btn-secondary opacity-70 hover:opacity-100'
            }`}
            title={mastered ? t('markMastered') : t('markMastered')}
          >
            <Check className={`w-3.5 h-3.5 ${mastered ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(wordObj.word);
            }}
            className={`p-1.5 rounded-lg border transition-all active:scale-90 flex items-center justify-center ${
              favorited
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-sm'
                : 'theme-btn-secondary opacity-70 hover:opacity-100'
            }`}
            title={favorited ? t('addFavorite') : t('addFavorite')}
          >
            <Star className={`w-3.5 h-3.5 ${favorited ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="space-y-3">
        {/* Pronunciation & Audio TTS Row */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div>
            {wordObj.ipa && <IpaSyllableVisualizer ipa={wordObj.ipa} />}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <AudioSpeedControl compact={true} />
            <button
              onClick={handlePlayWord}
              disabled={isPlayingWord}
              className={`p-1.5 rounded-lg border transition-all active:scale-90 flex items-center justify-center ${
                isPlayingWord
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md animate-pulse'
                  : 'theme-btn-secondary opacity-90 hover:opacity-100'
              }`}
              title={t('listenAudio')}
            >
              <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Arabic Translation Block (RTL Isolated) */}
        <div dir="rtl" className="rtl-text rtl-isolate p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-center">
          <p className="text-lg font-black tracking-wide font-arabic text-amber-950 dark:text-amber-300">
            {wordObj.arabic}
          </p>
        </div>

        {/* AI Sentence Generator & Interactive Tokens Block */}
        <div dir="ltr" className="ltr-isolate bg-slate-100 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-300 dark:border-slate-800/60 text-xs text-slate-950 dark:text-slate-200 space-y-2.5 font-extrabold">
          <div className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-400 font-bold flex-wrap gap-1.5">
            <span className="font-black flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
              {customAiSentence ? t('aiSentenceBtn') : t('exampleSentence')}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCreateNewAiSentence}
                disabled={isGeneratingAiSentence}
                className="px-2.5 py-1 rounded-xl text-xs font-black transition-all border flex items-center gap-1 bg-purple-500/20 text-purple-950 dark:text-purple-300 border-purple-500/40 hover:bg-purple-500/30 active:scale-95 shadow-sm"
                title="Generate new custom AI sentence for this word"
              >
                <span>{isGeneratingAiSentence ? t('generating') : customAiSentence ? t('changeSentence') : t('aiSentenceBtn')}</span>
              </button>

              {activeSentence && (
                <>
                  <button
                    type="button"
                    onClick={handlePlayExample}
                    disabled={isPlayingExample}
                    className="px-2 py-1 rounded-lg text-[11px] font-black text-indigo-900 dark:text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all flex items-center gap-1 active:scale-95"
                    title={t('listenSentence')}
                  >
                    <span>{isPlayingExample ? t('generating') : t('playBtn')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStartPractice}
                    className="px-2 py-1 rounded-lg text-[11px] font-black text-amber-950 dark:text-amber-300 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center gap-1 active:scale-95"
                    title={t('practiceVoice')}
                  >
                    <span>{t('micBtn')}</span>
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
              <span className="text-[10px] opacity-75 font-semibold block mb-0.5 text-amber-500">{t('arabicSentenceTranslation')}</span>
              <p className="text-xs font-extrabold text-amber-700 dark:text-amber-300">{activeArabic}</p>
            </div>
          )}

          {customAiSentence?.needsApiKey && (
            <div className="mt-2 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[11px] space-y-1.5 dir-rtl font-arabic">
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
                <span className="text-[11px] font-semibold text-slate-400">{t('speechPractice')}</span>
                <button
                  type="button"
                  onClick={handleClosePractice}
                  className="text-[10px] text-slate-500 hover:text-slate-300"
                >
                  {t('close')}
                </button>
              </div>
              {isListening && (
                <div className="flex items-center space-x-2 text-xs text-indigo-400 animate-pulse bg-indigo-950/30 p-2 rounded-lg border border-indigo-800/40">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                  <span>{t('listening')}</span>
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
  const { customWords, addCustomWord, apiKey, selectedWords, setActiveTab, addNotification, t, language } = useApp();

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
      // 1. Search Query Filter (English word or Arabic translation with diacritics ignored)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const normQuery = normalizeArabicText(query);
        const matchesWord = item.word.toLowerCase().includes(query);

        const itemArabicNorm = item.arabic ? normalizeArabicText(item.arabic) : '';
        const matchesArabic = item.arabic && (
          item.arabic.toLowerCase().includes(query) ||
          (normQuery && itemArabicNorm.includes(normQuery))
        );

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
      {/* Feature 39: Smart Word of the Day Widget */}
      <WordOfTheDayWidget onOpenWordDetails={(w) => setActiveModalWord(w)} />

      {/* Header & Search Bar Section */}
      <div className="card-theme-target p-4 sm:p-6 rounded-3xl border space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight flex items-center gap-2 flex-wrap text-slate-900 dark:text-slate-100 font-arabic">
              <span>{t('gridTitle')}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full theme-btn-primary font-mono font-bold">
                {totalFilteredItems} {t('words')}
              </span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium font-arabic">
              {t('gridSubtitle')}
            </p>
          </div>

          {/* Actions Bar: Export Deck & Items Per Page (Clean Mobile Layout) */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl theme-btn-primary text-xs font-bold transition-all shadow-sm shrink-0"
              title="تصدير قائمة الكلمات"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('exportWords')}</span>
            </button>

            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border bg-black/5 dark:bg-white/5 text-xs font-bold shrink-0">
              <span className="opacity-70 font-arabic text-[11px]">{t('showLabel')}</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent border-0 text-xs font-bold text-[var(--text-main)] focus:outline-none cursor-pointer pe-1"
              >
                <option value={16} className="bg-[var(--bg-card)] text-[var(--text-main)]">16</option>
                <option value={20} className="bg-[var(--bg-card)] text-[var(--text-main)]">20</option>
                <option value={24} className="bg-[var(--bg-card)] text-[var(--text-main)]">24</option>
                <option value={32} className="bg-[var(--bg-card)] text-[var(--text-main)]">32</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interactive Search Bar & Clear Action */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-500">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('searchPlaceholder')}
            className="w-full ps-10 pe-20 py-2.5 sm:py-3 rounded-2xl glass-input text-xs sm:text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute inset-y-0 right-3 flex items-center px-2 text-xs font-black opacity-70 hover:opacity-100"
            >
              {t('clearSearch')}
            </button>
          )}
        </div>

        {/* CEFR Level Filter Buttons - Mobile Perfect 5-Col Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('cefrFilter')}</span>
            {(selectedCefr !== 'ALL' || selectedLetter !== 'ALL' || searchQuery) && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t('resetFilters')}
              </button>
            )}
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
            {['ALL', 'A1', 'A2', 'B1', 'B2'].map((cefr) => {
              const isActive = selectedCefr === cefr;
              return (
                <button
                  key={cefr}
                  onClick={() => handleCefrSelect(cefr)}
                  className={`py-2 px-1 sm:px-4 rounded-xl text-xs font-black transition-all border text-center ${
                    isActive
                      ? 'theme-btn-primary shadow-md scale-102 font-black'
                      : 'theme-btn-secondary opacity-80 hover:opacity-100'
                  }`}
                >
                  {cefr === 'ALL' ? (language === 'ar' ? 'الكل' : 'ALL') : cefr}
                </button>
              );
            })}
          </div>
        </div>

        {/* A-Z Letter Filter Bar (Smooth Touch Scrollable Strip) */}
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('alphabetFilter')}</span>
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1.5 no-scrollbar" dir="ltr">
            {alphabet.map((letter) => {
              const isActive = selectedLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => handleLetterSelect(letter)}
                  className={`min-w-[34px] h-[34px] sm:min-w-[36px] sm:h-[36px] px-1 flex items-center justify-center rounded-xl text-xs font-black transition-all border shrink-0 ${
                    isActive
                      ? 'theme-btn-primary shadow-sm scale-105 font-black'
                      : 'theme-btn-secondary opacity-75 hover:opacity-100'
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
        <div className="glass-panel p-4 rounded-xl border border-indigo-500/30 flex items-center justify-between gap-4 shadow-md">
          <div className="flex items-center space-x-3 gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              {selectedWords.length}
            </span>
            <div>
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                {t('selectedForStory')} ({selectedWords.length}/5):
              </p>
              <p dir="ltr" className="ltr-isolate text-xs text-slate-600 dark:text-slate-300 font-medium">
                {selectedWords.map((w) => (typeof w === 'string' ? w : w.word)).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('story')}
            className="px-4 py-2 rounded-xl text-xs font-bold theme-btn-primary transition-all shadow-md"
          >
            {t('generateStoryAction')}
          </button>
        </div>
      )}

      {/* Grid Summary Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <div>
          {t('showing')} <span className="font-semibold text-slate-900 dark:text-slate-200">{paginatedWords.length ? (safeCurrentPage - 1) * itemsPerPage + 1 : 0}</span> {t('to')}{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-200">{Math.min(safeCurrentPage * itemsPerPage, totalFilteredItems)}</span> {t('of')}{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-200">{totalFilteredItems}</span> {t('words')}
        </div>
        <div>
          {t('page')} <span className="font-semibold text-indigo-600 dark:text-indigo-400">{safeCurrentPage}</span> {t('of')}{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-200">{totalPages}</span>
        </div>
      </div>

      {/* Catalog Grid Cards Rendering */}
      {paginatedWords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {paginatedWords.map((wordObj) => (
            <LexiconCard
              key={`${wordObj.word}-${wordObj.id}`}
              wordObj={wordObj}
              onCardClick={setActiveModalWord}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          type="search"
          searchQuery={searchQuery.trim()}
          onReset={clearFilters}
          onAiFetch={searchQuery.trim() ? handleFetchMissingTerm : null}
          isFetchingTerm={isFetchingTerm}
        />
      )}

      {/* Virtual Pagination Controls */}
      {totalPages > 1 && (
        <div className="card-theme-target p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={safeCurrentPage === 1}
            className="px-3.5 py-2 rounded-xl text-xs font-black theme-btn-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {t('firstPage')}
          </button>

          <div className="flex items-center space-x-1.5 gap-1 overflow-x-auto max-w-full no-scrollbar">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="px-3.5 py-2 rounded-xl text-xs font-black theme-btn-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {t('prevPage')}
            </button>

            {/* Page number buttons window */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - safeCurrentPage) <= 2 || p === 1 || p === totalPages)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="px-1 opacity-50 text-xs font-bold">...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-black transition-all border ${
                        safeCurrentPage === p
                          ? 'theme-btn-primary shadow-sm scale-105'
                          : 'theme-btn-secondary opacity-75 hover:opacity-100'
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
              className="px-3.5 py-2 rounded-xl text-xs font-black theme-btn-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {t('nextPage')}
            </button>
          </div>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage === totalPages}
            className="px-3.5 py-2 rounded-xl text-xs font-black theme-btn-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {t('lastPage')}
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
