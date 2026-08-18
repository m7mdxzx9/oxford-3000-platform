import React from 'react';
import { Volume2, RefreshCw, CheckCircle2, XCircle, Mic } from 'lucide-react';
import { playAudio } from '../services/audioService';

/**
 * SpeechScoreVisualizer Component
 * Displays:
 * 1. Accuracy Score % with color indicator
 * 2. Words spoken correctly (Green ✓)
 * 3. Words missed or mispronounced (Red ✗) with click-to-listen
 * 4. Full recognized transcript from the microphone
 * 5. Retry and Listen actions
 */
export const SpeechScoreVisualizer = React.memo(function SpeechScoreVisualizer({
  evaluationResult = null,
  evalResult = null,
  targetSentence = '',
  expectedText = '',
  spokenText = '',
  liveTranscript = '',
  onRetry = null,
  onListenReference = null,
  onPracticeWord = null,
  className = '',
}) {
  const result = evaluationResult || evalResult;
  const sentence = targetSentence || expectedText;

  if (!result && !liveTranscript) return null;

  const score = result ? result.score : 0;
  const wordBreakdown = result ? result.wordBreakdown || [] : [];
  const recognizedText = (result && result.transcript) || spokenText || liveTranscript;

  const correctWords = wordBreakdown.filter((w) => w && w.match);
  const missedWords = wordBreakdown.filter((w) => w && !w.match);

  let themeStyle = {
    badge: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40',
    bar: 'bg-emerald-500',
    label: 'نطق ممتاز ومتقن! 🎉',
    subLabel: 'Excellent Pronunciation!',
    textColor: 'text-emerald-500',
  };

  if (score < 60) {
    themeStyle = {
      badge: 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/40',
      bar: 'bg-rose-500',
      label: 'يحتاج إلى مزيد من التدريب 💪',
      subLabel: 'Needs Practice. Try again!',
      textColor: 'text-rose-500',
    };
  } else if (score < 85) {
    themeStyle = {
      badge: 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40',
      bar: 'bg-amber-500',
      label: 'محاولة جيدة جداً، اقتربت من الإتقان! 👍',
      subLabel: 'Good Effort — Almost Perfect!',
      textColor: 'text-amber-500',
    };
  }

  const handlePlayWord = (word) => {
    playAudio(word, { speed: 0.85 });
    if (onPracticeWord) onPracticeWord(word);
  };

  const handlePlayFullSentence = () => {
    if (sentence) playAudio(sentence, { speed: 0.9 });
    if (onListenReference) onListenReference();
  };

  return (
    <div className={`card-theme-target p-4 sm:p-5 rounded-3xl border shadow-xl space-y-4 font-arabic text-start ${className}`}>
      {/* Top Header: Score % and Status */}
      <div className="flex items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl theme-btn-primary flex items-center justify-center font-black text-lg shadow-md shrink-0">
            {score}%
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black flex items-center gap-2">
              <span>{themeStyle.label}</span>
            </h4>
            <p className="text-[11px] opacity-75 font-mono">{themeStyle.subLabel}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 ms-auto">
          {sentence && (
            <button
              onClick={handlePlayFullSentence}
              className="px-3 py-1.5 rounded-xl theme-btn-secondary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="استمع للنطق الصحيح للجملة"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>استمع للجملة</span>
            </button>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1.5 rounded-xl theme-btn-primary text-xs font-black flex items-center gap-1.5 shadow-sm hover:brightness-110 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة التدريب</span>
            </button>
          )}
        </div>
      </div>

      {/* Accuracy Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold opacity-80">
          <span>دقة النطق والكلمات المتطابقة:</span>
          <span className="font-mono font-black">
            {correctWords.length} من {wordBreakdown.length} كلمات ({score}%)
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 border">
          <div
            className={`h-full transition-all duration-700 ${themeStyle.bar}`}
            style={{ width: `${Math.max(5, score)}%` }}
          />
        </div>
      </div>

      {/* 🟢 1. Correctly Spoken Words Breakdown */}
      {correctWords.length > 0 && (
        <div className="space-y-1.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>الكلمات التي نطقتها بشكل صحيح ({correctWords.length}):</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {correctWords.map((item, idx) => (
              <span
                key={idx}
                className="ltr-token px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1 shadow-sm"
              >
                <span>✓</span>
                <span>{item.word}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 🔴 2. Missed / Incorrectly Spoken Words Breakdown */}
      {missedWords.length > 0 && (
        <div className="space-y-1.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <div className="flex items-center justify-between text-xs font-black text-rose-600 dark:text-rose-400">
            <span className="flex items-center gap-1.5">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>الكلمات التي لم تُنطق أو تحتاج لتحسين ({missedWords.length}):</span>
            </span>
            <span className="text-[10px] opacity-70">اضغط على أي كلمة للاستماع لنطقها</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {missedWords.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handlePlayWord(item.word)}
                className="ltr-token px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-200 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer shadow-sm"
                title={`استمع لنطق كلمة ${item.word}`}
              >
                <Volume2 className="w-3 h-3 text-rose-500" />
                <span>{item.word}</span>
                <span className="text-rose-400 text-[10px]">✗</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 🎙️ 3. Full Live Recognized Microphone Transcript */}
      {recognizedText && (
        <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold opacity-75">
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span>ما تم التقاطه من صوتك في المايك (Transcribed Speech):</span>
          </div>
          <p className="font-mono text-xs sm:text-sm font-bold text-cyan-500 dark:text-cyan-300 ltr-token p-2 rounded-xl bg-black/10 dark:bg-white/10 border border-black/5">
            "{recognizedText}"
          </p>
        </div>
      )}
    </div>
  );
});

export default SpeechScoreVisualizer;
