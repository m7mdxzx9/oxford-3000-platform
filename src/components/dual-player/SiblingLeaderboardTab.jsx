import React from 'react';
import { BarChart3, Trophy, Flame, Award, Trash2 } from 'lucide-react';

export default function SiblingLeaderboardTab({
  stats,
  onResetStats,
  addNotification,
}) {
  const users = [
    {
      name: 'محمد',
      avatar: '👨‍💻',
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      data: stats['محمد'] || { mastered: 0, duelsWon: 0, chainWins: 0, totalScore: 0 },
    },
    {
      name: 'ريوف',
      avatar: '👩‍🔬',
      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      data: stats['ريوف'] || { mastered: 0, duelsWon: 0, chainWins: 0, totalScore: 0 },
    },
  ];

  // Sort by total score
  users.sort((a, b) => (b.data.totalScore || 0) - (a.data.totalScore || 0));

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border shadow-xl card-theme-target space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl theme-btn-primary shadow-md">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black font-arabic">
                لوحة الصدارة وسجل الإنجازات التنافسي
              </h3>
              <p className="text-xs opacity-75 font-arabic">
                مقارنة حية لنقاط الخبرة والمبارزات المحسومة بين المتعلمين
              </p>
            </div>
          </div>

          <button
            onClick={onResetStats}
            className="px-3.5 py-2 rounded-2xl hover:bg-rose-500/10 text-rose-500 border border-rose-500/30 text-xs font-bold font-arabic flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>تصفير النتائج</span>
          </button>
        </div>

        {/* Podium Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {users.map((u, idx) => (
            <div
              key={u.name}
              className={`p-6 rounded-3xl border shadow-lg space-y-4 ${u.color}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{u.avatar}</span>
                  <div>
                    <h4 className="text-xl font-black font-arabic">{u.name}</h4>
                    <span className="text-xs opacity-75 font-arabic">
                      {idx === 0 ? '🏆 المركز الأول' : '🥈 المركز الثاني'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono">{u.data.totalScore || 0}</div>
                  <div className="text-[10px] font-bold opacity-75">إجمالي النقاط XP</div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/10 dark:border-white/10 text-center">
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                  <div className="text-base font-black font-mono">{u.data.mastered || 0}</div>
                  <div className="text-[10px] font-bold font-arabic opacity-75">كلمة متقنة</div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                  <div className="text-base font-black font-mono">{u.data.duelsWon || 0}</div>
                  <div className="text-[10px] font-bold font-arabic opacity-75">فوز بالمبارزة</div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                  <div className="text-base font-black font-mono">{u.data.chainWins || 0}</div>
                  <div className="text-[10px] font-bold font-arabic opacity-75">سلسلة الكلمات</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
