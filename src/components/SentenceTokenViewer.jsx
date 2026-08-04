import React, { useState } from 'react';
import { playAudio } from '../services/audioService';

/**
 * SentenceTokenViewer Component
 * Splits a sentence into interactive clickable word tokens with strict LTR CSS isolation.
 * Props:
 *  - sentence: string
 *  - targetWords: Array<string | { word: string }>
 *  - evaluationResult: { score: number, wordBreakdown: Array<{ word: string, match: boolean }> } | Array<{ word: string, match: boolean }>
 *  - activeWordIndex: number | null
 *  - onWordClick: function(wordToken, event, index)
 *  - onWordPractice: function(wordToken, event, index)
 *  - className: string
 */
export const SentenceTokenViewer = ({
  sentence = '',
  targetWords = [],
  evaluationResult = null,
  wordBreakdown = null, // backward compatibility alias
  activeWordIndex = null,
  onWordClick = null,
  onWordPractice = null,
  onPracticeWord = null, // backward compatibility alias
  size = 'md',
  interactive = true,
  className = '',
}) => {
  const [playingWord, setPlayingWord] = useState(null);

  if (!sentence) return null;

  // Normalize target words array for fast lookup
  const normalizedTargets = new Set(
    (targetWords || [])
      .map((w) => {
        if (typeof w === 'string') return w.toLowerCase();
        if (w && typeof w.word === 'string') return w.word.toLowerCase();
        return '';
      })
      .filter(Boolean)
  );

  // Extract effective word breakdown list
  const effectiveBreakdown = React.useMemo(() => {
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
  const breakdownMap = React.useMemo(() => {
    if (!effectiveBreakdown) return null;
    const map = new Map();
    effectiveBreakdown.forEach((item) => {
      if (item && item.word) {
        map.set(item.word.toLowerCase(), item.match);
      }
    });
    return map;
  }, [effectiveBreakdown]);

  // Split sentence into words, punctuation, and whitespace tokens
  const tokens = sentence.match(/(\b[A-Za-z0-9'-]+\b|[^\w\s]+|\s+)/g) || [sentence];

  const handleWordClick = async (e, word, tokenIndex) => {
    e.stopPropagation();
    if (!interactive) return;

    if (onWordClick) {
      onWordClick(word, e, tokenIndex);
      return;
    }

    try {
      setPlayingWord(word);
      await playAudio(word, 'en-US', 0.85);
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

  // Font sizing styles
  const sizeClasses =
    {
      sm: 'text-xs leading-relaxed',
      md: 'text-sm leading-relaxed',
      lg: 'text-base sm:text-lg leading-relaxed',
    }[size] || 'text-sm leading-relaxed';

  let wordCounter = -1;

  return (
    <div
      dir="ltr"
      style={{ direction: 'ltr', unicodeBidi: 'isolate', textAlign: 'left' }}
      className={`ltr-isolate ltr-token inline-flex flex-wrap items-center gap-y-1 font-sans ${sizeClasses} ${className}`}
    >
      {tokens.map((token, index) => {
        const isWord = /^\b[A-Za-z0-9'-]+\b$/.test(token);

        if (!isWord) {
          // Render punctuation or whitespace as static span
          return (
            <span key={index} className="text-slate-400 select-none">
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

        // Dynamic token styling based on target (cyan), evaluation match (emerald green ✓), mismatch (rose red ✗)
        let tokenStyle =
          'text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-300 rounded px-1 transition-all duration-150 border border-transparent';

        if (breakdownMap && matchStatus !== undefined) {
          if (matchStatus === true) {
            tokenStyle =
              'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded px-1.5 font-medium shadow-sm';
          } else {
            tokenStyle =
              'bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded px-1.5 font-medium line-through decoration-rose-400/60 shadow-sm';
          }
        } else if (isTarget) {
          tokenStyle =
            'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 rounded px-1.5 font-semibold shadow-sm hover:bg-cyan-500/30 ring-1 ring-cyan-400/30';
        }

        if (isPlaying) {
          tokenStyle += ' ring-2 ring-cyan-400 animate-pulse bg-cyan-500/30 text-white font-bold';
        }

        return (
          <button
            key={index}
            type="button"
            dir="ltr"
            style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
            onClick={(e) => handleWordClick(e, token, currentWordIndex)}
            onContextMenu={(e) => handleContextMenu(e, token, currentWordIndex)}
            disabled={!interactive}
            className={`ltr-isolate inline-flex items-center gap-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${tokenStyle}`}
            title={interactive ? `Click to listen: "${token}"` : undefined}
          >
            <span>{token}</span>
            {breakdownMap && matchStatus !== undefined && (
              <span className={`text-[10px] ml-0.5 font-bold ${matchStatus ? 'text-emerald-400' : 'text-rose-400'}`}>
                {matchStatus ? '✓' : '✗'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SentenceTokenViewer;
