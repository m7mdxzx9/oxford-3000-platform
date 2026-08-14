import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Feature 74: Smart AI Words Flash Loader
 * Displays fast cycling English keywords while processing AI actions.
 */
const FLASH_WORDS = [
  'Synthesizing...',
  'Pronouncing...',
  'Analyzing Phonemes...',
  'Evaluating Grammar...',
  'Calibrating CEFR Level...',
  'Generating Context...',
  'Mastering Oxford 3000™...',
  'Refining Vocabulary...',
];

export default function AiWordLoader({ message = 'جاري المعالجة بالذكاء الاصطناعي...' }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % FLASH_WORDS.length);
    }, 700);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3 glass-panel rounded-2xl border text-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin flex items-center justify-center" />
        <Sparkles className="w-5 h-5 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
      </div>
      <div className="space-y-1">
        <div className="text-sm font-black font-mono text-cyan-400 tracking-wider transition-all duration-300">
          {FLASH_WORDS[index]}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-arabic">
          {message}
        </p>
      </div>
    </div>
  );
}
