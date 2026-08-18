import React, { useState, useMemo } from 'react';
import { Volume2, Star, CheckCircle2, Eye, EyeOff, Lightbulb, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { oxford3000Data } from '../data/oxford3000Data';
import { playWordAudio } from '../services/audioService';
import { analyzeSilentLetters } from '../utils/phoneticsUtils';
import { getMnemonicForWord } from '../utils/mnemonicsData';
import LiveEqualizer from './LiveEqualizer';

export default function WordOfTheDayWidget({ onOpenWordDetails }) {
  const { isFavorite, toggleFavorite, isMastered, toggleMastered, voicePreset, audioSpeed } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSilentLetters, setShowSilentLetters] = useState(true);
  const [showMnemonic, setShowMnemonic] = useState(false);

  // Deterministic daily word selection
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

  const isFav = isFavorite(dailyWord.word);
  const isMst = isMastered(dailyWord.word);

  return (
    <div className="card-theme-target p-4 sm:p-5 rounded-2xl border shadow-md space-y-3 font-sans">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-bold font-arabic opacity-90">كلمة اليوم الذكية</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black px-2 py-0.5 rounded-lg theme-btn-primary font-mono">
            {dailyWord.cefr}
          </span>
          <span className="text-[11px] font-mono opacity-70 px-2 py-0.5 rounded-lg border bg-black/5 dark:bg-white/5">
            {dailyWord.pos}
          </span>
        </div>
      </div>

      {/* Main Word & Pronunciation Row */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="space-y-0.5">
          <h2 dir="ltr" className="ltr-token text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
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
          <div dir="ltr" className="ltr-token text-xs sm:text-sm font-mono text-cyan-600 dark:text-cyan-400 font-bold">
            {dailyWord.ipa}
          </div>
        </div>

        {/* Audio Player Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <LiveEqualizer isPlaying={isPlaying} />
          <button
            type="button"
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className="p-2.5 sm:px-3 sm:py-2 rounded-xl theme-btn-primary flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            title="استمع للنطق"
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-xs font-bold hidden sm:inline font-arabic">نطق</span>
          </button>
        </div>
      </div>

      {/* Meaning & Example */}
      <div className="space-y-1.5 pt-1">
        <div dir="rtl" className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-arabic">
          {dailyWord.arabic}
        </div>
        <div dir="ltr" className="text-xs sm:text-sm italic opacity-80 ltr-token pl-2 border-l-2 border-cyan-500">
          "{dailyWord.example}"
        </div>
      </div>

      {/* Mnemonic Accordion */}
      {showMnemonic && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium space-y-1 font-arabic dropdown-animate">
          <div className="flex items-center gap-1.5 font-bold">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>الربط بالصورة الذهنية (Mnemonic Hook):</span>
          </div>
          <p className="leading-relaxed">{mnemonic.hook}</p>
        </div>
      )}

      {/* Actions & Utilities Bar */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t flex-wrap">
        {/* Toggle helpers */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowSilentLetters(!showSilentLetters)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 ${
              showSilentLetters ? 'theme-btn-primary' : 'theme-btn-secondary opacity-80'
            }`}
            title="تمييز الحروف الصامتة"
          >
            {showSilentLetters ? <EyeOff className="w-3 h-3 text-rose-300" /> : <Eye className="w-3 h-3" />}
            <span className="font-arabic">الحروف الصامتة</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMnemonic(!showMnemonic)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 ${
              showMnemonic ? 'theme-btn-primary' : 'theme-btn-secondary opacity-80'
            }`}
            title="عرض الصورة الذهنية المساعدة"
          >
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span className="font-arabic">الذاكرة</span>
          </button>
        </div>

        {/* Action icons & Study button */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => toggleFavorite(dailyWord.word)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
              isFav ? 'bg-amber-500/20 text-amber-500 border-amber-500/40' : 'theme-btn-secondary'
            }`}
            title="المفضلة"
          >
            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => toggleMastered(dailyWord.word)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
              isMst ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40' : 'theme-btn-secondary'
            }`}
            title="متقنة"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isMst ? 'fill-current' : ''}`} />
          </button>

          {onOpenWordDetails && (
            <button
              type="button"
              onClick={() => onOpenWordDetails(dailyWord)}
              className="px-3 py-1.5 rounded-xl theme-btn-primary text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 font-arabic"
            >
              <span>تفاصيل</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
