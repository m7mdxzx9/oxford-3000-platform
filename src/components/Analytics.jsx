import React from 'react';
import { BarChart3, CheckCircle2, Star, BookOpen, Sparkles, PieChart, Trophy, Flame, Award, Zap } from 'lucide-react';
import { OXFORD_3000 } from '../data/oxford3000';
import { useApp } from '../context/AppContext';

export default function Analytics() {
  const { mastered, favorites, customWords, masteredCount, favoritesCount, xp, level, dailyStreak, t } = useApp();

  const allWords = [...customWords, ...OXFORD_3000];
  const totalWordsCount = allWords.length;
  const countMastered = typeof masteredCount === 'number' ? masteredCount : (mastered?.length || 0);
  const countFavorites = typeof favoritesCount === 'number' ? favoritesCount : (favorites?.length || 0);

  const cefrLevels = ['A1', 'A2', 'B1', 'B2'];
  const cefrStats = cefrLevels.map((lvl) => {
    const levelWords = allWords.filter((w) => w.cefr === lvl);
    const masteredInLevel = levelWords.filter((w) => (mastered || []).includes(w.word));
    const percentage = levelWords.length > 0 ? Math.round((masteredInLevel.length / levelWords.length) * 100) : 0;

    return {
      level: lvl,
      total: levelWords.length,
      mastered: masteredInLevel.length,
      percentage,
    };
  });

  const overallPercentage = totalWordsCount > 0 ? Math.round((countMastered / totalWordsCount) * 100) : 0;

  // XP progress to next level
  const currentLevelXp = (xp || 0) % 100;
  const nextLevelXp = 100;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="card-theme-target p-6 sm:p-8 rounded-3xl border border-cyan-500/30 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2.5 theme-btn-primary rounded-2xl shadow-md">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">{t('analyticsTitle')}</h2>
          </div>
          <p className="text-xs sm:text-sm font-medium opacity-80 max-w-lg">{t('analyticsSubtitle')}</p>
        </div>

        <div className="flex items-center justify-center p-6 rounded-3xl border theme-btn-secondary shrink-0 text-center min-w-[150px] shadow-lg">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">{t('overallMastery')}</span>
            <span className="text-3xl sm:text-4xl font-black text-emerald-500">{overallPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Gamification & XP Progress Banner */}
      <div className="card-theme-target p-6 rounded-3xl border space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl theme-btn-primary flex items-center justify-center font-black text-lg shadow-md">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold opacity-75">الملف الأكاديمي للمتعلم (Learner Profile)</span>
              <h3 className="text-lg font-black flex items-center gap-2">
                <span>المستوى {level || 1} (Level {level || 1})</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full theme-btn-primary font-mono font-bold">
                  {xp || 0} XP
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl border flex items-center gap-2 font-black text-xs theme-btn-secondary">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>السلسلة اليومية: {dailyStreak || 1} أيام 🔥</span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-bold opacity-80">
            <span>التقدم نحو المستوى التالي ({level ? level + 1 : 2})</span>
            <span>{currentLevelXp} / {nextLevelXp} XP</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3.5 p-0.5 border">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.min(100, Math.max(5, (currentLevelXp / nextLevelXp) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats 4-Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-theme-target p-5 rounded-3xl border space-y-1 shadow-md">
          <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-xl w-fit mb-2">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold opacity-75 block">{t('totalLexicon')}</span>
          <span className="text-2xl font-black">{totalWordsCount}</span>
        </div>

        <div className="card-theme-target p-5 rounded-3xl border space-y-1 shadow-md">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl w-fit mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold opacity-75 block">{t('masteredTerms')}</span>
          <span className="text-2xl font-black text-emerald-500">{countMastered}</span>
        </div>

        <div className="card-theme-target p-5 rounded-3xl border space-y-1 shadow-md">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl w-fit mb-2">
            <Star className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold opacity-75 block">{t('favorites')}</span>
          <span className="text-2xl font-black text-amber-500">{countFavorites}</span>
        </div>

        <div className="card-theme-target p-5 rounded-3xl border space-y-1 shadow-md">
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl w-fit mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold opacity-75 block">{t('aiCustomTerms')}</span>
          <span className="text-2xl font-black text-purple-500">{customWords?.length || 0}</span>
        </div>
      </div>

      {/* CEFR Level Breakdown */}
      <div className="card-theme-target p-6 sm:p-8 rounded-3xl border space-y-6 shadow-xl">
        <h3 className="text-lg font-black flex items-center gap-2">
          <PieChart className="w-5 h-5 text-cyan-500" /> {t('cefrBreakdown')}
        </h3>

        <div className="space-y-5">
          {cefrStats.map((stat) => (
            <div key={stat.level} className="space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-black theme-btn-primary">
                    CEFR {stat.level}
                  </span>
                  <span>{stat.mastered} {t('of')} {stat.total} words mastered</span>
                </span>
                <span className="text-cyan-500 font-black">{stat.percentage}%</span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3.5 p-0.5 border">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.max(2, stat.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
