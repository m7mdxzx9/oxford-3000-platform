import React, { useState, useMemo } from 'react';
import { playAudio } from '../services/audioService';
import { oxford3000Data } from '../data/oxford3000Data';
import { fetchMissingTerm } from '../services/geminiService';
import { CORE_ARABIC_DICTIONARY, stemEnglishWord } from '../utils/arabicTranslationDictionary';
import { EXTENDED_WORD_MEANINGS } from '../utils/wordMeaningsDictionary';

// Fast lookup map for local Oxford 3000 word translations
const localTranslationMap = new Map();
if (Array.isArray(oxford3000Data)) {
  oxford3000Data.forEach((item) => {
    if (item && item.word && item.arabic) {
      const cleanKey = item.word.toLowerCase().trim();
      if (!localTranslationMap.has(cleanKey)) {
        localTranslationMap.set(cleanKey, item.arabic);
      }
    }
  });
}

/**
 * SentenceTokenViewer Component
 * Splits a sentence into interactive clickable word tokens with strict LTR CSS isolation
 * and interactive word-by-word Arabic translation tooltips.
 */
export const SentenceTokenViewer = React.memo(function SentenceTokenViewer({
  sentence = '',
  targetWords = [],
  wordTranslations = {}, // AI-generated or custom word-to-arabic map
  evaluationResult = null,
  wordBreakdown = null,
  activeWordIndex = null,
  onWordClick = null,
  onWordPractice = null,
  onPracticeWord = null,
  size = 'md',
  interactive = true,
  showInlineTranslationBadges = false,
  className = '',
}) {
  const [playingWord, setPlayingWord] = useState(null);
  const [activeTooltipWord, setActiveTooltipWord] = useState(null);

  // Normalize target words array for fast lookup
  const normalizedTargets = useMemo(() => {
    return new Set(
      (targetWords || [])
        .map((w) => {
          if (typeof w === 'string') return w.toLowerCase();
          if (w && typeof w.word === 'string') return w.word.toLowerCase();
          return '';
        })
        .filter(Boolean)
    );
  }, [targetWords]);

  // Extract effective word breakdown list
  const effectiveBreakdown = useMemo(() => {
    if (evaluationResult && Array.isArray(evaluationResult.wordBreakdown)) {
      return evaluationResult.wordBreakdown;
    }
    if (Array.isArray(evaluationResult)) {
      return evaluationResult;
    }
    if (Array.isArray(wordBreakdown)) {
      return wordBreakdown;
    }
    return null;
  }, [evaluationResult, wordBreakdown]);

  // Map word breakdown array to lookup map if provided
  const breakdownMap = useMemo(() => {
    if (!effectiveBreakdown) return null;
    const map = new Map();
    effectiveBreakdown.forEach((item) => {
      if (item && item.word) {
        map.set(item.word.toLowerCase(), item.match);
      }
    });
    return map;
  }, [effectiveBreakdown]);

  // Normalize AI wordTranslations prop keys to lowercase
  const normalizedAiTranslations = useMemo(() => {
    if (!wordTranslations || typeof wordTranslations !== 'object') return {};
    const result = {};
    Object.entries(wordTranslations).forEach(([k, v]) => {
      if (k && v) result[k.toLowerCase().trim()] = v;
    });
    return result;
  }, [wordTranslations]);

  // State to store dynamically resolved translations for words not in static map
  const [dynamicTranslations, setDynamicTranslations] = useState({});

  if (!sentence) return null;

  // Function to resolve Arabic translation for any English word
  const getWordTranslation = (token) => {
    if (!token) return '';
    const cleanToken = token.toLowerCase().replace(/[^a-z0-9]/gi, '').trim();
    if (!cleanToken) return '';

    // 1. High-precision exact core dictionary lookup
    if (CORE_ARABIC_DICTIONARY[cleanToken]) {
      return CORE_ARABIC_DICTIONARY[cleanToken];
    }

    // 2. Curated Extended Meanings dictionary lookup
    if (EXTENDED_WORD_MEANINGS && EXTENDED_WORD_MEANINGS[cleanToken]?.primary) {
      return EXTENDED_WORD_MEANINGS[cleanToken].primary;
    }

    // 3. AI contextual translations lookup
    if (normalizedAiTranslations[cleanToken]) {
      return normalizedAiTranslations[cleanToken];
    }

    // 4. Dynamic cached translations lookup
    if (dynamicTranslations[cleanToken]) {
      return dynamicTranslations[cleanToken];
    }

    // 5. Local Oxford 3000 translation map lookup
    if (localTranslationMap.has(cleanToken)) {
      return localTranslationMap.get(cleanToken);
    }

    // 6. Stemming / Lemmatization (e.g. "practicing" -> "practice", "skills" -> "skill")
    const stemmed = stemEnglishWord(cleanToken);
    if (stemmed && stemmed !== cleanToken) {
      if (CORE_ARABIC_DICTIONARY[stemmed]) {
        return CORE_ARABIC_DICTIONARY[stemmed];
      }
      if (EXTENDED_WORD_MEANINGS && EXTENDED_WORD_MEANINGS[stemmed]?.primary) {
        return EXTENDED_WORD_MEANINGS[stemmed].primary;
      }
      if (localTranslationMap.has(stemmed)) {
        return localTranslationMap.get(stemmed);
      }
      if (normalizedAiTranslations[stemmed]) {
        return normalizedAiTranslations[stemmed];
      }
    }

    // 7. Partial key matches in AI translations
    const partialKey = Object.keys(normalizedAiTranslations).find((k) => k.includes(cleanToken) || cleanToken.includes(k));
    if (partialKey) return normalizedAiTranslations[partialKey];

    return '';
  };

  const handleWordClick = async (e, word, tokenIndex) => {
    e.stopPropagation();
    if (!interactive) return;

    const clean = word.toLowerCase().replace(/[^a-z0-9]/gi, '').trim();
    let translation = getWordTranslation(word);

    // If translation not yet in cache, set loading state and query dynamic translation API
    if (!translation && clean) {
      setActiveTooltipWord({ word, translation: 'جاري استخراج المعنى الدقيق...', index: tokenIndex, loading: true });
      fetchMissingTerm(clean).then((res) => {
        if (res && res.arabic) {
          setDynamicTranslations((prev) => ({ ...prev, [clean]: res.arabic }));
          setActiveTooltipWord({ word, translation: res.arabic, index: tokenIndex });
        } else {
          setActiveTooltipWord({ word, translation: clean, index: tokenIndex });
        }
      });
    } else {
      setActiveTooltipWord((prev) => (prev && prev.index === tokenIndex ? null : { word, translation: translation || clean, index: tokenIndex }));
    }

    if (onWordClick) {
      onWordClick(word, e, tokenIndex);
      return;
    }

    try {
      setPlayingWord(word);
      await playAudio(word, { speed: 0.85 });
    } catch (err) {
      console.error('Word audio playback error:', err);
    } finally {
      setPlayingWord(null);
    }
  };

  const handleContextMenu = (e, word, tokenIndex) => {
    if (onWordPractice || onPracticeWord) {
      e.preventDefault();
      e.stopPropagation();
      const handler = onWordPractice || onPracticeWord;
      handler(word, e, tokenIndex);
    }
  };

  const tokens = sentence.match(/(\b[A-Za-z0-9'-]+\b|[^\w\s]+|\s+)/g) || [sentence];

  const sizeClasses =
    {
      sm: 'text-xs leading-relaxed',
      md: 'text-sm leading-relaxed',
      lg: 'text-base sm:text-lg leading-relaxed',
    }[size] || 'text-sm leading-relaxed';

  let wordCounter = -1;

  return (
    <div className="space-y-2">
      <div
        dir="ltr"
        style={{ direction: 'ltr', unicodeBidi: 'isolate', textAlign: 'left' }}
        className={`ltr-isolate ltr-token flex flex-wrap items-center gap-y-1.5 gap-x-0.5 font-sans ${sizeClasses} ${className}`}
      >
        {tokens.map((token, index) => {
          const isWord = /^\b[A-Za-z0-9'-]+\b$/.test(token);

          if (!isWord) {
            return (
              <span key={index} className="opacity-80 text-current select-none">
                {token}
              </span>
            );
          }

          wordCounter++;
          const currentWordIndex = wordCounter;
          const lowerToken = token.toLowerCase();
          const isTarget = normalizedTargets.has(lowerToken);
          const matchStatus = breakdownMap ? breakdownMap.get(lowerToken) : undefined;
          const isPlaying =
            (activeWordIndex !== null && activeWordIndex === currentWordIndex) ||
            playingWord === token;
          const arabicTranslation = getWordTranslation(token);
          const isTooltipActive = activeTooltipWord && activeTooltipWord.index === currentWordIndex;

          let tokenStyle =
            'text-[var(--text-main)] font-bold hover:bg-cyan-500/20 hover:text-cyan-600 dark:hover:text-cyan-300 rounded px-1.5 py-0.5 transition-all duration-150 border border-transparent';

          if (breakdownMap && matchStatus !== undefined) {
            if (matchStatus === true) {
              tokenStyle =
                'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/50 rounded px-1.5 font-black shadow-sm';
            } else {
              tokenStyle =
                'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/50 rounded px-1.5 font-black line-through decoration-rose-500 shadow-sm';
            }
          } else if (isTarget) {
            tokenStyle =
              'theme-btn-primary rounded-xl px-2 py-0.5 font-black shadow-md scale-105 text-base';
          }

          if (isPlaying) {
            tokenStyle += ' ring-2 ring-cyan-400 animate-pulse font-black';
          }

          return (
            <span key={index} className="relative inline-block mx-0.5 my-0.5">
              <button
                type="button"
                dir="ltr"
                style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
                onClick={(e) => handleWordClick(e, token, currentWordIndex)}
                onContextMenu={(e) => handleContextMenu(e, token, currentWordIndex)}
                disabled={!interactive}
                className={`ltr-isolate inline-flex items-center gap-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${tokenStyle}`}
                title={arabicTranslation ? `"${token}" ➔ ${arabicTranslation}` : `Click to listen: "${token}"`}
              >
                <span>{token}</span>
                {breakdownMap && matchStatus !== undefined && (
                  <span className={`text-[10px] ml-0.5 font-bold ${matchStatus ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {matchStatus ? '✓' : '✗'}
                  </span>
                )}
              </button>

              {/* Click-Activated Tooltip Badge for Selected Word */}
              {isTooltipActive && arabicTranslation && (
                <span
                  dir="rtl"
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap font-arabic text-[11px] text-amber-700 dark:text-amber-300 font-black card-theme-target border border-amber-500/60 px-2.5 py-1 rounded-xl shadow-2xl z-30 animate-in fade-in"
                >
                  {arabicTranslation}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Active Selected Word Translation Popover Card */}
      {activeTooltipWord && (
        <div className="p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-2 text-xs font-black text-amber-700 dark:text-amber-300 font-arabic dir-rtl">
          <span>
            ترجمة الكلمة: <strong dir="ltr" className="ltr-isolate font-bold mx-1">({activeTooltipWord.word})</strong> = {activeTooltipWord.translation}
          </span>
          <button
            onClick={() => setActiveTooltipWord(null)}
            className="text-[11px] opacity-70 hover:opacity-100 px-2 py-0.5 rounded-lg border theme-btn-secondary"
          >
            ✕ إغلاق
          </button>
        </div>
      )}
    </div>
  );
});

export default SentenceTokenViewer;
