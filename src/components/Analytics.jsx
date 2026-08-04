import React from 'react';
import { BarChart3, CheckCircle2, Star, BookOpen, Sparkles, PieChart, ShieldCheck } from 'lucide-react';
import { OXFORD_3000 } from '../data/oxford3000';
import { useApp } from '../context/AppContext';

export default function Analytics() {
  const { mastered, favorites, customWords, masteredCount, favoritesCount } = useApp();

  const allWords = [...customWords, ...OXFORD_3000];
  const totalWordsCount = allWords.length;

  // Breakdown by CEFR Level
  const cefrLevels = ['A1', 'A2', 'B1', 'B2'];
  const cefrStats = cefrLevels.map((lvl) => {
    const levelWords = allWords.filter((w) => w.cefr === lvl);
    const masteredInLevel = levelWords.filter((w) => mastered.includes(w.word));
    const percentage = levelWords.length > 0 ? Math.round((masteredInLevel.length / levelWords.length) * 100) : 0;

    return {
      level: lvl,
      total: levelWords.length,
      mastered: masteredInLevel.length,
      percentage,
    };
  });

  // Overall Mastery Percentage
  const overallPercentage = totalWordsCount > 0 ? Math.round((masteredCount / totalWordsCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Progress Analytics & Mastery</h2>
          </div>
          <p className="text-slate-400 text-sm max-w-lg">
            Track your journey through the complete Oxford 3000 CEFR Lexicon dataset with real-time statistics.
          </p>
        </div>

        {/* Big Overall Badge */}
        <div className="flex items-center justify-center p-6 bg-slate-900/90 border border-cyan-900/40 rounded-3xl shrink-0 text-center min-w-[140px]">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Overall Mastery</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400">{overallPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-3xl border border-cyan-900/30 space-y-1">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit mb-2">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-semibold block">Total Lexicon</span>
          <span className="text-2xl font-extrabold text-white">{totalWordsCount}</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-emerald-900/30 space-y-1">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-semibold block">Mastered Terms</span>
          <span className="text-2xl font-extrabold text-emerald-400">{masteredCount}</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-amber-900/30 space-y-1">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl w-fit mb-2">
            <Star className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-semibold block">Favorites</span>
          <span className="text-2xl font-extrabold text-amber-400">{favoritesCount}</span>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-purple-900/30 space-y-1">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl w-fit mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs text-slate-400 font-semibold block">AI Custom Terms</span>
          <span className="text-2xl font-extrabold text-purple-400">{customWords.length}</span>
        </div>
      </div>

      {/* CEFR Level Mastery Breakdown */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-900/40 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-cyan-400" /> CEFR Level Progress Breakdown
        </h3>

        <div className="space-y-5">
          {cefrStats.map((stat) => (
            <div key={stat.level} className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-white flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold">
                    CEFR {stat.level}
                  </span>
                  <span>{stat.mastered} of {stat.total} words mastered</span>
                </span>
                <span className="text-cyan-400 font-bold">{stat.percentage}%</span>
              </div>

              <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
