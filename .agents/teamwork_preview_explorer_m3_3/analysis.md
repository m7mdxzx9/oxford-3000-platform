# Analysis Report: Milestone 3 UI Integration
## Interactive Sentence Word Tokens & Line-by-Line Speech Evaluation Visualization

**Agent**: `teamwork_preview_explorer_m3_3`  
**Milestone**: M3 (Speech Engine & Interactive UI Integration)  
**Date**: August 4, 2026  

---

## 1. Context & Architectural Overview

Milestone 3 requires establishing:
1. **Interactive Sentence Word Tokens**: Splitting English sentences (such as Lexicon Card example sentences or AI-generated sentences) into individual clickable word tokens. Clicking a token plays its individual TTS audio pronunciation.
2. **Line-by-Line Speech Evaluation Visualization**: A visual feedback system integrating `speechEvaluation.js` (`startListening`, `stopListening`, `evaluateSpeech`). The UI highlights target words line-by-line with **Green ✓** for correctly pronounced words and **Red ✗** for missed/mispronounced words, along with an overall percentage score badge.

---

## 2. Technical Requirements & UI Design Specs

### Component A: `InteractiveSentenceTokens.jsx`
- **Location**: `src/components/InteractiveSentenceTokens.jsx`
- **Props**:
  - `sentence`: `string` (Required sentence to tokenize and render)
  - `targetWord`: `string` (Optional word to highlight as target vocabulary)
  - `wordBreakdown`: `Array<{ word: string, match: boolean }>` (Optional speech evaluation result)
  - `onTokenClick`: `function` (Custom callback when token is clicked; defaults to playing word audio)
  - `className`: `string` (Custom outer container styling)
- **Tokenization Mechanics**:
  - Split sentence into tokens while preserving word-adjacent punctuation for natural reading.
  - Clean word term extracted using `token.toLowerCase().replace(/[^\w']/g, '')`.
  - On token click, trigger `playAudio(cleanWord, 'en-US', 0.85)` using `audioService.js`.
- **Visual Styling (Dark Glassmorphic Theme `#060d21`)**:
  - Base Token Badge: `inline-flex items-center px-2 py-1 m-0.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 dir-ltr ltr-isolate border`
  - Normal Token: `bg-slate-900/70 text-slate-200 border-slate-700/60 hover:bg-cyan-950/60 hover:text-cyan-300 hover:border-cyan-500/50 hover:scale-105`
  - Target Word Token: `bg-cyan-950/50 text-cyan-300 border-cyan-400 font-semibold shadow-[0_0_8px_rgba(6,182,212,0.3)]`
  - Evaluation Matched (Green ✓): `bg-emerald-950/50 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.2)]`
  - Evaluation Missed (Red ✗): `bg-rose-950/50 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.2)]`

### Component B: `SpeechEvalVisualizer.jsx`
- **Location**: `src/components/SpeechEvalVisualizer.jsx`
- **Props**:
  - `expectedText`: `string` (Target sentence to evaluate against)
  - `targetWord`: `string` (Optional word term for auto-mastery promotion)
  - `onEvaluationComplete`: `function` (Callback receiving `{ score, wordBreakdown }`)
- **State Management**:
  - `isListening`: `boolean` (Mic active status)
  - `spokenText`: `string` (Web Speech API transcript)
  - `evalResult`: `{ score: number, wordBreakdown: Array<{ word: string, match: boolean }> } | null`
  - `errorMsg`: `string | null`
- **Workflow**:
  1. User clicks **Record / Mic** button -> calls `startListening(onResult, onError)`.
  2. While listening, display animated pulse indicator (`🎙️ Listening...`).
  3. Upon speech result, compute `evalResult = evaluateSpeech(expectedText, transcript)`.
  4. Display overall Score Badge:
     - High Score (>= 80%): `bg-emerald-500/20 text-emerald-300 border-emerald-500/40` (Green ✓ badge)
     - Mid Score (50-79%): `bg-amber-500/20 text-amber-300 border-amber-500/40`
     - Low Score (< 50%): `bg-rose-500/20 text-rose-300 border-rose-500/40` (Red ✗ badge)
  5. Render line-by-line tokens using `InteractiveSentenceTokens` with `wordBreakdown` mapping:
     - Matched words display `✓` icon in green.
     - Missed words display `✗` icon in red.
  6. Auto-Promote to Mastered: If `targetWord` is passed and `score >= 90%`, invoke `toggleMastered(targetWord)`.

---

## 3. Implementation Code Specifications

### 1. `src/components/InteractiveSentenceTokens.jsx`
```jsx
import React from 'react';
import { playAudio } from '../services/audioService';

export const InteractiveSentenceTokens = ({
  sentence = '',
  targetWord = '',
  wordBreakdown = null,
  onTokenClick,
  className = ''
}) => {
  if (!sentence) return null;

  // Split sentence into words and punctuation tokens
  const tokens = sentence.split(/(\s+|[^\w'])/).filter(Boolean);

  // Map word breakdown for quick lookup
  const breakdownMap = React.useMemo(() => {
    if (!wordBreakdown || !Array.isArray(wordBreakdown)) return null;
    const map = new Map();
    wordBreakdown.forEach((item) => {
      if (item && item.word) {
        map.set(item.word.toLowerCase(), item.match);
      }
    });
    return map;
  }, [wordBreakdown]);

  const handleTokenClick = (rawToken, cleanWord) => {
    if (!cleanWord) return;
    if (typeof onTokenClick === 'function') {
      onTokenClick(cleanWord);
    } else {
      playAudio(cleanWord, 'en-US', 0.85);
    }
  };

  return (
    <div dir="ltr" className={`ltr-isolate flex flex-wrap items-center gap-1 leading-relaxed ${className}`}>
      {tokens.map((token, index) => {
        const cleanWord = token.toLowerCase().replace(/[^\w']/g, '');
        const isWhitespaceOrPunct = !cleanWord;

        if (isWhitespaceOrPunct) {
          return (
            <span key={index} className="text-slate-400 select-none">
              {token}
            </span>
          );
        }

        const isTarget = targetWord && cleanWord === targetWord.toLowerCase();
        let matchStatus = null;
        if (breakdownMap && breakdownMap.has(cleanWord)) {
          matchStatus = breakdownMap.get(cleanWord);
        }

        let tokenStyle = 'bg-slate-900/70 text-slate-200 border-slate-700/60 hover:bg-cyan-950/60 hover:text-cyan-300 hover:border-cyan-500/50 hover:scale-105';
        let badgeIcon = null;

        if (matchStatus === true) {
          tokenStyle = 'bg-emerald-950/50 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.2)]';
          badgeIcon = <span className="ml-1 text-[10px] font-bold text-emerald-400">✓</span>;
        } else if (matchStatus === false) {
          tokenStyle = 'bg-rose-950/50 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.2)]';
          badgeIcon = <span className="ml-1 text-[10px] font-bold text-rose-400">✗</span>;
        } else if (isTarget) {
          tokenStyle = 'bg-cyan-950/50 text-cyan-300 border-cyan-400 font-semibold shadow-[0_0_8px_rgba(6,182,212,0.3)]';
        }

        return (
          <button
            key={index}
            onClick={() => handleTokenClick(token, cleanWord)}
            className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border transition-all duration-200 active:scale-95 ${tokenStyle}`}
            title={`Click to listen to "${cleanWord}"`}
          >
            <span>{token}</span>
            {badgeIcon}
          </button>
        );
      })}
    </div>
  );
};

export default InteractiveSentenceTokens;
```

### 2. `src/components/SpeechEvalVisualizer.jsx`
```jsx
import React, { useState } from 'react';
import { startListening, stopListening, evaluateSpeech } from '../services/speechEvaluation';
import { playAudio } from '../services/audioService';
import { InteractiveSentenceTokens } from './InteractiveSentenceTokens';
import { useApp } from '../context/AppContext';

export const SpeechEvalVisualizer = ({
  expectedText = '',
  targetWord = '',
  onEvaluationComplete,
  className = ''
}) => {
  const { toggleMastered, isMastered, addNotification } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [evalResult, setEvalResult] = useState(null);
  const [error, setError] = useState(null);

  const handleStartListening = () => {
    setError(null);
    setIsListening(true);
    setSpokenText('');

    startListening(
      (transcript) => {
        setIsListening(false);
        setSpokenText(transcript);
        const result = evaluateSpeech(expectedText, transcript);
        setEvalResult(result);

        if (typeof onEvaluationComplete === 'function') {
          onEvaluationComplete(result);
        }

        // Auto-promote if score >= 90%
        if (targetWord && result.score >= 90 && !isMastered(targetWord)) {
          toggleMastered(targetWord);
          addNotification(`🎉 Score ${result.score}%! Auto-mastered "${targetWord}"`, 'success');
        }
      },
      (err) => {
        setIsListening(false);
        const msg = err?.message || 'Speech recognition error';
        setError(msg);
        addNotification(msg, 'error');
      }
    );
  };

  const handleStopListening = () => {
    stopListening();
    setIsListening(false);
  };

  const handlePlayReference = () => {
    playAudio(expectedText, 'en-US', 0.9);
  };

  return (
    <div className={`glass-panel p-4 rounded-xl border border-slate-800 space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          {/* Record Button */}
          {!isListening ? (
            <button
              onClick={handleStartListening}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
              <span>Practice Speech</span>
            </button>
          ) : (
            <button
              onClick={handleStopListening}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 border border-cyan-400 animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
              <span>Listening... Stop</span>
            </button>
          )}

          {/* Reference Audio Play Button */}
          <button
            onClick={handlePlayReference}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-all"
            title="Listen to original sentence"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          </button>
        </div>

        {/* Score Badge */}
        {evalResult && (
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              evalResult.score >= 80
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : evalResult.score >= 50
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            Score: {evalResult.score}%
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-xs text-rose-400">{error}</p>}

      {/* Spoken Transcript Preview */}
      {spokenText && (
        <div className="text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Spoken: </span>
          <span className="italic text-slate-200">"{spokenText}"</span>
        </div>
      )}

      {/* Visualization Tokens (Green ✓ / Red ✗) */}
      <InteractiveSentenceTokens
        sentence={expectedText}
        targetWord={targetWord}
        wordBreakdown={evalResult ? evalResult.wordBreakdown : null}
      />
    </div>
  );
};

export default SpeechEvalVisualizer;
```

---

## 4. Integration into `LexiconCard` (`LexiconGrid.jsx`)

In `LexiconCard`, replace static text in example sentence with `InteractiveSentenceTokens` and optionally add a speech evaluation toggle.

```jsx
{wordObj.example && (
  <div dir="ltr" className="ltr-isolate bg-slate-950/40 p-3 rounded-xl border border-slate-800/40 text-xs text-slate-300 space-y-2">
    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
      <span>Example Sentence</span>
      <button
        onClick={handlePlayExample}
        disabled={isPlayingExample}
        className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
        title="Listen to example sentence"
      >
        <span>{isPlayingExample ? 'Playing...' : 'Play'}</span>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        </svg>
      </button>
    </div>

    {/* Interactive Tokens */}
    <InteractiveSentenceTokens
      sentence={wordObj.example}
      targetWord={wordObj.word}
    />

    {/* Speech Practice Visualizer Toggle */}
    <SpeechEvalVisualizer
      expectedText={wordObj.example}
      targetWord={wordObj.word}
    />
  </div>
)}
```

---

## 5. Summary & Hand-off Recommendations
- Implement components `src/components/InteractiveSentenceTokens.jsx` and `src/components/SpeechEvalVisualizer.jsx`.
- Update `src/components/LexiconGrid.jsx` to integrate tokens and speech visualizer.
- Verify with `node test/e2e-runner.js`.
