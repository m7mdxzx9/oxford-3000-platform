import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  Star,
  BookOpen,
  Sparkles,
  PieChart,
  Trophy,
  Flame,
  Clock,
  Activity,
  Layers,
  Brain,
  Zap,
} from 'lucide-react';
import { OXFORD_3000 } from '../data/oxford3000Data';
import { useApp } from '../context/AppContext';
import { isWordDueForReview } from '../utils/srsUtils';

export default function Analytics() {
  const {
    authUser,
    mastered,
    favorites,
    customWords,
    srsRecords,
    activityLog,
    xp,
    streak,
    dueSRSCount,
    t,
  } = useApp();

  const allWords = [...customWords, ...OXFORD_3000];
  const totalWordsCount = allWords.length;
  const countMastered = (mastered || []).length;
  const countFavorites = (favorites || []).length;

  // Real CEFR Level Breakdown
  const cefrLevels = ['A1', 'A2', 'B1', 'B2'];
  const cefrStats = cefrLevels.map((lvl) => {
    const levelWords = allWords.filter((w) => w.cefr === lvl);
    const masteredInLevel = levelWords.filter((w) => (mastered || []).includes(w.word));
    const percentage =
      levelWords.length > 0 ? Math.round((masteredInLevel.length / levelWords.length) * 100) : 0;

    return {
      level: lvl,
      total: levelWords.length,
      mastered: masteredInLevel.length,
      percentage,
    };
  });

  const overallPercentage =
    totalWordsCount > 0 ? Math.round((countMastered / totalWordsCount) * 100) : 0;

  // SRS Real Statistics
  const srsEntries = Object.values(srsRecords || {});
  const totalSrsLearned = srsEntries.length;
  const matureWordsCount = srsEntries.filter((rec) => (rec.interval || 0) >= 21).length;

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header Banner with User Profile & Real Progress */}
      <div className="card-theme-target p-5 sm:p-8 rounded-3xl border relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl font-arabic">
        <div className="space-y-2 text-center sm:text-start">
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <div className="p-2.5 theme-btn-primary rounded-2xl shadow-md">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-black">
                لوحة إحصائيات: {authUser?.name || 'المستخدم'} {authUser?.avatar || '👨‍🎓'}
              </h2>
              <p className="text-xs opacity-75 font-medium">
                بيانات واقعية وتتبع حي لتقدمك الدراسي الفعلي في قاموس أكسفورد
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-5 sm:p-6 rounded-3xl border theme-btn-secondary shrink-0 text-center min-w-[150px] shadow-lg">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider block opacity-75">
              نسبة الإتقان العامة
            </span>
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {overallPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats 4-Grid Real Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 font-arabic">
        {/* Total Lexicon */}
        <div className="card-theme-target p-4 sm:p-5 rounded-3xl border space-y-1 shadow-md">
          <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-xl w-fit mb-2">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold opacity-75 block">قاموس أوكسفورد</span>
          <span className="text-2xl font-black font-mono">{totalWordsCount}</span>
        </div>

        {/* Real Mastered Words */}
        <div className="card-theme-target p-4 sm:p-5 rounded-3xl border space-y-1 shadow-md">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl w-fit mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold opacity-75 block">مفردات متقنة</span>
          <span className="text-2xl font-black text-emerald-500 font-mono">{countMastered}</span>
        </div>

        {/* Real Favorites */}
        <div className="card-theme-target p-4 sm:p-5 rounded-3xl border space-y-1 shadow-md">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl w-fit mb-2">
            <Star className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold opacity-75 block">المفضلة</span>
          <span className="text-2xl font-black text-amber-500 font-mono">{countFavorites}</span>
        </div>

        {/* Real XP & Streak */}
        <div className="card-theme-target p-4 sm:p-5 rounded-3xl border space-y-1 shadow-md">
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl w-fit mb-2">
            <Flame className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold opacity-75 block">نقاط XP / السلسلة</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-xl sm:text-2xl font-black text-purple-500">{xp} XP</span>
            <span className="text-xs opacity-70">({streak}d 🔥)</span>
          </div>
        </div>
      </div>

      {/* Spaced Repetition (SRS) Memory Stability Card */}
      <div className="card-theme-target p-5 sm:p-7 rounded-3xl border space-y-4 shadow-xl font-arabic">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black">
                استقرار الذاكرة والتكرار المتباعد (SuperMemo SM-2)
              </h3>
              <p className="text-xs opacity-70">
                حالة ترسيخ المفردات في الذاكرة طويلة المدى
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl border bg-black/5 dark:bg-white/5 space-y-1">
            <span className="text-xs font-bold opacity-70 block">كلمات في جدول المراجعة</span>
            <span className="text-xl font-black font-mono">{totalSrsLearned}</span>
          </div>

          <div className="p-3.5 rounded-2xl border bg-black/5 dark:bg-white/5 space-y-1">
            <span className="text-xs font-bold opacity-70 block">مستحقة للمراجعة اليوم</span>
            <span className="text-xl font-black text-amber-500 font-mono">{dueSRSCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl border bg-black/5 dark:bg-white/5 space-y-1">
            <span className="text-xs font-bold opacity-70 block">مثبتة بالذاكرة طويلة المدى</span>
            <span className="text-xl font-black text-emerald-500 font-mono">{matureWordsCount}</span>
          </div>
        </div>
      </div>

      {/* CEFR Level Breakdown */}
      <div className="card-theme-target p-5 sm:p-8 rounded-3xl border space-y-6 shadow-xl font-arabic">
        <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
          <PieChart className="w-5 h-5 text-cyan-500" /> توزيع الإتقان حسب مستويات CEFR
        </h3>

        <div className="space-y-4">
          {cefrStats.map((stat) => (
            <div key={stat.level} className="space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-black theme-btn-primary font-mono">
                    CEFR {stat.level}
                  </span>
                  <span>
                    تم إتقان {stat.mastered} من أصل {stat.total} كلمة
                  </span>
                </span>
                <span className="text-cyan-600 dark:text-cyan-400 font-black font-mono">
                  {stat.percentage}%
                </span>
              </div>

              <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-3 p-0.5 border">
                <div
                  className="theme-btn-primary h-2 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.max(2, stat.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real Live Activity History Timeline */}
      <div className="card-theme-target p-5 sm:p-8 rounded-3xl border space-y-4 shadow-xl font-arabic">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" /> سجل الأنشطة والتعلم الحي
          </h3>
          <span className="text-[10px] font-mono opacity-60">
            {activityLog?.length || 0} نشاط مسجل
          </span>
        </div>

        {activityLog && activityLog.length > 0 ? (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {activityLog.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-2xl border bg-black/5 dark:bg-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="p-1.5 rounded-lg theme-btn-primary text-xs">
                    {act.type === 'mastered' ? '🎓' : act.type === 'favorite' ? '⭐' : act.type === 'srs_review' ? '🧠' : '✨'}
                  </span>
                  <span className="font-bold truncate">{act.title}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  {act.earnedXp > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold">
                      +{act.earnedXp} XP
                    </span>
                  )}
                  <span className="opacity-60">{formatActivityTime(act.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border rounded-2xl bg-black/5 dark:bg-white/5">
            <p className="text-sm font-bold opacity-70">
              لم تقم بأي أنشطة دراسية بعد. ابدأ بدراسة الكلمات والمراجعة لتسجيل نشاطك هنا! 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
