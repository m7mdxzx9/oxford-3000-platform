import React from 'react';
import { Users, LogIn, LogOut, MessageSquare, Gamepad2, Award, BarChart3 } from 'lucide-react';

export default function DualPlayerHeader({
  activeUser,
  subTab,
  setSubTab,
  onOpenLogin,
  onLogout,
}) {
  return (
    <div className="glass-panel p-5 sm:p-7 rounded-3xl border shadow-xl card-theme-target space-y-5">
      {/* Upper Status Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl theme-btn-primary flex items-center justify-center font-bold text-xl shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-arabic flex items-center gap-2">
              <span>مركز التعلم المشترك والتحدي الثنائي</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 font-mono font-bold">
                1v1 Duel Arena
              </span>
            </h2>
            <p className="text-xs sm:text-sm opacity-75 font-arabic">
              حوارات تمثيل الأدوار، وتحديات الكلمات، ولوحة الصدارة التنافسية للأخوة والزملاء
            </p>
          </div>
        </div>

        {/* User Account Controls */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold font-arabic">
              اللاعب الحالي: <span className="font-black text-cyan-400">{activeUser}</span>
            </span>
          </div>

          <button
            onClick={onOpenLogin}
            className="p-2 sm:px-3 sm:py-1.5 rounded-2xl theme-btn-secondary border text-xs font-bold font-arabic flex items-center gap-1.5 hover:brightness-110 cursor-pointer"
            title="تبديل اللاعب"
          >
            <LogIn className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">تبديل اللاعب</span>
          </button>

          {activeUser !== 'guest' && (
            <button
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-rose-500/10 text-rose-500 border border-rose-500/30 text-xs font-bold font-arabic flex items-center gap-1 cursor-pointer"
              title="خروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-black/10 dark:border-white/10">
        {[
          { id: 'dialogue', label: 'حوار الأدوار (AI)', icon: MessageSquare },
          { id: 'chain', label: 'سلسلة الكلمات (PvP)', icon: Gamepad2 },
          { id: 'quiz', label: 'مبارزة الأسئلة (Duel)', icon: Award },
          { id: 'leaderboard', label: 'لوحة الصدارة', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-black font-arabic transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? 'theme-btn-primary shadow-lg scale-[1.02]'
                  : 'theme-btn-secondary opacity-70 hover:opacity-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
