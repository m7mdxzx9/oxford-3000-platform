import React from 'react';
import { playAudio } from '../services/audioService';

/**
 * SpeechScoreVisualizer Component
 * Visualizes accuracy score (0-100%) with score meter badge, status label (Green for >=90%, Teal for 70-89%, Amber/Rose for <70%),
 * Green ✓ (match) and Red ✗ (mismatch) badges, recognized spoken transcript display, mispronounced words practice list, and retry trigger (onRetry).
 */
export const SpeechScoreVisualizer = ({
  evaluationResult = null,
  expectedText = '',
  spokenText = '',
  liveTranscript = '',
  onRetry = null,
  onListenReference = null,
  onPracticeWord = null,
  className = '',
}) => {
  if (!evaluationResult && !liveTranscript) return null;

  const score = evaluationResult ? evaluationResult.score : 0;
  const wordBreakdown = evaluationResult ? evaluationResult.wordBreakdown || [] : [];
  const recognizedText = (evaluationResult && evaluationResult.transcript) || spokenText || liveTranscript;

  // Grade styling thresholds per spec: Green for >=90%, Teal for 70-89%, Amber/Rose for <70%
  let gradeTheme = {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10',
    bar: 'bg-emerald-500',
    label: 'Excellent Pronunciation!',
    icon: '🎉',
  };

  if (score < 70) {
    gradeTheme = {
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/10',
      bar: 'bg-rose-500',
      label: 'Needs Practice. Keep Trying!',
      icon: '💪',
    };
  } else if (score < 90) {
    gradeTheme = {
      badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-teal-500/10',
      bar: 'bg-teal-500',
      label: 'Good Effort — Almost Perfect!',
      icon: '👍',
    };
  }

  const matchedCount = wordBreakdown.filter((w) => w && w.match).length;
  const totalCount = wordBreakdown.length;
  const missedWords = wordBreakdown.filter((w) => w && !w.match);

  const handlePracticeSingleWord = (word) => {
    playAudio(word, { speed: 0.85 });
    if (onPracticeWord) onPracticeWord(word);
  };

  return (
    <div className={`card-theme-target p-5 rounded-3xl border space-y-4 shadow-xl ${className}`}>
      {/* Top Header & Score Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl theme-btn-primary flex items-center justify-center text-2xl shadow-inner shrink-0">
            {gradeTheme.icon}
          </div>
          <div>
            <h4 className="text-base font-extrabold tracking-tight flex items-center gap-2">
              <span>Speech Evaluation Result</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${gradeTheme.badge}`}>
                {score}% Score
              </span>
            </h4>
            <p className="text-xs opacity-75 mt-0.5 font-bold">{gradeTheme.label}</p>
          </div>
        </div>

        {/* Action Controls (Listen Reference & Retry) */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {onListenReference && (
            <button
              type="button"
              onClick={onListenReference}
              className="flex-1 sm:flex-initial px-3.5 py-2 theme-btn-secondary text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M12 6v12l-4-4H5a1 1 0 01-1-1v-4a1 1 0 011-1h3l4-4z" />
              </svg>
              <span>Listen</span>
            </button>
          )}

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex-1 sm:flex-initial px-4 py-2 theme-btn-primary text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Accuracy Bar */}
      {totalCount > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-extrabold opacity-80">
            <span>Accuracy Progress</span>
            <span>
              {matchedCount} of {totalCount} words matched
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden border border-black/10 bg-black/10">
            <div
              className={`h-full transition-all duration-500 ${gradeTheme.bar}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}

      {/* Word Breakdown Badges Grid (Green ✓ vs Red ✗) */}
      {wordBreakdown.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-xs font-extrabold uppercase tracking-wider opacity-75 block">
            Word Match Breakdown
          </span>
          <div className="flex flex-wrap gap-2">
            {wordBreakdown.map((item, idx) => {
              const isMatch = item && item.match;
              const wordStr = (item && item.word) || '';
              return (
                <span
                  key={idx}
                  dir="ltr"
                  style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
                  className={`ltr-isolate inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold border transition-all ${
                    isMatch
                      ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40 shadow-sm'
                      : 'bg-rose-500/20 text-rose-600 border-rose-500/40 shadow-sm'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isMatch ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {isMatch ? '✓' : '✗'}
                  </span>
                  <span>{wordStr}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Recognized Spoken Transcript Display */}
      {recognizedText && (
        <div className="p-3.5 rounded-xl border bg-black/5 space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-wider opacity-75 block">
            🎙️ Live Recognized Spoken Speech (الكلام المنطوق):
          </span>
          <p dir="ltr" style={{ direction: 'ltr', unicodeBidi: 'isolate' }} className="ltr-isolate text-sm font-black font-mono text-amber-500">
            "{recognizedText}"
          </p>
        </div>
      )}

      {/* Mispronounced Words Practice List */}
      {missedWords.length > 0 && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs space-y-2">
          <span className="font-extrabold text-rose-600 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Mispronounced Words Practice List ({missedWords.length}):
          </span>
          <div className="flex flex-wrap gap-2 pt-1">
            {missedWords.map((item, i) => (
              <button
                key={`missed-${i}-${item.word}`}
                type="button"
                onClick={() => handlePracticeSingleWord(item.word)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-600 text-white font-bold transition-all cursor-pointer shadow-sm hover:scale-105"
                title={`Click to listen to pronunciation for "${item.word}"`}
              >
                <span>{item.word}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeechScoreVisualizer;
