import React, { useState, useMemo } from 'react';
import { Sparkles, Volume2, Star, CheckCircle2, Eye, EyeOff, BookOpen, Lightbulb, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { oxford3000Data } from '../data/oxford3000';
import { playWordAudio } from '../services/audioService';
import { analyzeSilentLetters } from '../utils/phoneticsUtils';
import { getMnemonicForWord } from '../utils/mnemonicsData';
import LiveEqualizer from './LiveEqualizer';

export default function WordOfTheDayWidget({ onOpenWordDetails }) {
  const { isFavorite, toggleFavorite, isMastered, toggleMastered, voicePreset, audioSpeed } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSilentLetters, setShowSilentLetters] = useState(true);
  const [showMnemonic, setShowMnemonic] = useState(false);

  // Pick deterministic word based on current day of year
  const dailyWord = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const index = (dayOfYear * 7) % oxford3000Data.length;
    return oxford3000Data[index] || oxford3000Data[0];
  }, []);

  const charsAnalysis = useMemo(() => {
    return analyzeSilentLetters(dailyWord.word);
  }, [dailyWord.word]);

  const mnemonic = useMemo(() => {
    return getMnemonicForWord(dailyWord.word, dailyWord.arabic, dailyWord.example);
  }, [dailyWord]);

  const handlePlayAudio = async () => {
    setIsPlaying(true);
    await playWordAudio(dailyWord.word, { preset: voicePreset, speed: audioSpeed });
    setIsPlaying(false);
  };

  const levelColorClass = {
    A1: 'cefr-gradient-a1',
    A2: 'cefr-gradient-a2',
    B1: 'cefr-gradient-b1',
    B2: 'cefr-gradient-b2',
  }[dailyWord.cefr] || 'cefr-gradient-b1';

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-3xl border shadow-xl relative overflow-hidden card-theme-target group">
      {/* Background Subtle Gradient Mesh */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500/20 text-amber-500 font-bold text-xs">
            🌟
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider opacity-80 flex items-center gap-1.5 font-arabic">
              <span>كلمة اليوم الذكية</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 font-mono font-bold">
                Word of the Day
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className={`text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-xl shadow-sm ${levelColorClass}`}>
            {dailyWord.cefr}
          </span>
          <span className="text-[10px] font-mono opacity-70 px-2 py-0.5 rounded-lg border bg-black/5 dark:bg-white/5">
            {dailyWord.pos}
          </span>
        </div>
      </div>

      {/* Word & IPA Row */}
      <div className="flex items-baseline justify-between flex-wrap gap-2 my-2">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Word with Silent Letters Highlight (Feature 23) */}
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight ltr-token">
            {showSilentLetters ? (
              charsAnalysis.map((item, idx) => (
                <span
                  key={idx}
                  className={item.isSilent ? 'silent-letter text-rose-500 dark:text-rose-400' : ''}
                  title={item.note || ''}
                >
                  {item.char}
                </span>
              ))
            ) : (
              dailyWord.word
            )}
          </h2>

          {/* IPA Phonetic */}
          <span className="text-xs sm:text-sm font-mono text-cyan-500 dark:text-cyan-400 opacity-90 ltr-token">
            {dailyWord.ipa}
          </span>
        </div>

        {/* Audio Player with Live Equalizer (Feature 67) */}
        <div className="flex items-center gap-2">
          <LiveEqualizer isPlaying={isPlaying} />
          <button
            onClick={handlePlayAudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-btn-primary text-xs font-bold shadow-md active:scale-95 cursor-pointer"
            title="استمع للنطق الصوتي"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">نطق</span>
          </button>
        </div>
      </div>

      {/* Arabic Meaning */}
      <div className="my-2 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border text-sm sm:text-base font-bold font-arabic text-emerald-600 dark:text-emerald-400">
        {dailyWord.arabic}
      </div>

      {/* Example Sentence */}
      <div className="my-2 text-xs sm:text-sm italic opacity-85 ltr-token pl-2 border-l-2 border-cyan-500">
        "{dailyWord.example}"
      </div>

      {/* Visual Mnemonic Hook (Feature 33) */}
      {showMnemonic && (
        <div className="my-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-medium space-y-1 dropdown-animate font-arabic">
          <div className="flex items-center gap-1.5 font-bold">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>الربط بالصورة الذهنية (Mnemonic Hook):</span>
          </div>
          <p className="leading-relaxed">{mnemonic.hook}</p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t mt-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          {/* Toggle Silent Letter Indicator */}
          <button
            onClick={() => setShowSilentLetters(!showSilentLetters)}
            className="px-2.5 py-1 rounded-xl border text-[11px] font-bold theme-btn-secondary flex items-center gap-1 active:scale-95"
            title="تفعيل/إخفاء تمييز الحروف الصامتة"
          >
            {showSilentLetters ? <EyeOff className="w-3 h-3 text-rose-500" /> : <Eye className="w-3 h-3" />}
            <span className="font-arabic">الحروف الصامتة</span>
          </button>

          {/* Toggle Mnemonic */}
          <button
            onClick={() => setShowMnemonic(!showMnemonic)}
            className="px-2.5 py-1 rounded-xl border text-[11px] font-bold theme-btn-secondary flex items-center gap-1 active:scale-95"
            title="عرض التشبيه البصري والذاكرة"
          >
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span className="font-arabic">الصورة الذهنية</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Favorite toggle */}
          <button
            onClick={() => toggleFavorite(dailyWord.word)}
            className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
              isFavorite(dailyWord.word)
                ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                : 'theme-btn-secondary'
            }`}
            title="إضافة للمفضلة"
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite(dailyWord.word) ? 'fill-current' : ''}`} />
          </button>

          {/* Mastered toggle */}
          <button
            onClick={() => toggleMastered(dailyWord.word)}
            className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
              isMastered(dailyWord.word)
                ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                : 'theme-btn-secondary'
            }`}
            title="تحديد كـ كلمة متقنة"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isMastered(dailyWord.word) ? 'fill-current' : ''}`} />
          </button>

          {/* Open full details if handler provided */}
          {onOpenWordDetails && (
            <button
              onClick={() => onOpenWordDetails(dailyWord)}
              className="px-2.5 py-1 rounded-xl theme-btn-primary text-[11px] font-bold flex items-center gap-1"
            >
              <span className="font-arabic">دراسة الكلمة</span>
              <ArrowRight className="w-3 h-3 rtl:rotate-180" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
