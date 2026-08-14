import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  Award,
  BarChart3,
  Globe,
  Menu,
  X,
  MessageSquare,
  UserCheck,
  Activity,
  Sun,
  Moon,
  Gamepad2,
  Users,
  Search,
  Flame,
  Zap,
  Radio,
  Mic,
  Brain,
  WifiOff,
  LogOut,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const {
    authUser,
    logoutUser,
    activeTab,
    setActiveTab,
    theme,
    setTheme,
    mode,
    toggleMode,
    THEMES,
    language,
    toggleLanguage,
    t,
    isOffline,
    streak,
    xp,
    dueSRSCount,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 80 && currentScrollY > lastScrollY) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Structured Categories Definition
  const categories = useMemo(() => [
    {
      id: 'vocab-hub',
      label: language === 'ar' ? 'المفردات والأقسام' : 'Vocab & Tracks',
      icon: BookOpen,
      items: [
        { id: 'grid', label: language === 'ar' ? 'المعجم الكامل (3000)' : 'Oxford 3000', icon: BookOpen, badge: '3000' },
        { id: 'kickstart', label: language === 'ar' ? 'المبتدئين الصفر (A0)' : 'Kickstart A0', icon: Compass, badge: 'A0' },
        { id: 'bridge', label: language === 'ar' ? 'جسر الانتقال (A2➔B1)' : 'B1 Bridge', icon: Zap, badge: 'Bridge' },
        { id: 'flashcards', label: language === 'ar' ? 'بطاقات الاستذكار 3D' : '3D Flashcards', icon: Layers, badge: dueSRSCount > 0 ? `${dueSRSCount}` : 'SRS' },
      ],
    },
    {
      id: 'skills-lab',
      label: language === 'ar' ? 'مختبرات المهارات' : 'Skill Labs',
      icon: Activity,
      items: [
        { id: 'speed-drill', label: language === 'ar' ? 'سرعة الاستماع' : 'Speed Listening', icon: Zap, badge: 'Drill' },
        { id: 'minimal-pairs', label: language === 'ar' ? 'الأصوات المشوشة' : 'Minimal Pairs', icon: Radio, badge: 'Pairs' },
        { id: 'spelling-bee', label: language === 'ar' ? 'اختبار الإملاء' : 'Spelling Bee', icon: Award, badge: 'Bee' },
        { id: 'active-recall', label: language === 'ar' ? 'الاستدعاء النشط' : 'Active Recall', icon: Brain, badge: 'Memory' },
        { id: 'voice-archive', label: language === 'ar' ? 'أرشيف الصوت' : 'Voice Archive', icon: Mic, badge: 'Vault' },
        { id: 'pronunciation', label: language === 'ar' ? 'استوديو النطق' : 'Speech Studio', icon: Activity, badge: 'AI' },
      ],
    },
    {
      id: 'ai-tools',
      label: language === 'ar' ? 'الذكاء الاصطناعي والألعاب' : 'AI & Games',
      icon: Sparkles,
      items: [
        { id: 'sentence', label: language === 'ar' ? 'توليد الجمل' : 'AI Sentences', icon: Sparkles, badge: 'AI' },
        { id: 'story', label: language === 'ar' ? 'الحكواتي الذكي' : 'AI Storyteller', icon: MessageSquare, badge: 'Story' },
        { id: 'tutor', label: language === 'ar' ? 'المعلم الشخصي' : 'Personal Tutor', icon: UserCheck, badge: 'Tutor' },
        { id: 'quiz', label: language === 'ar' ? 'اختبار المعرفة' : 'Quiz Game', icon: Award, badge: 'Quiz' },
        { id: 'chain', label: language === 'ar' ? 'سلسلة الكلمات' : 'Word Chain', icon: Gamepad2, badge: 'Game' },
        { id: 'detective', label: language === 'ar' ? 'المحقق اللغوي' : 'Word Detective', icon: Search, badge: 'Mystery' },
        { id: 'dual', label: language === 'ar' ? 'مبارزة 1v1' : '1v1 Arena', icon: Users, badge: 'PvP' },
      ],
    },
    {
      id: 'progress',
      label: language === 'ar' ? 'التحليلات والنمو' : 'Growth & Stats',
      icon: BarChart3,
      items: [
        { id: 'analytics', label: language === 'ar' ? 'لوحة الإحصائيات' : 'Analytics Hub', icon: BarChart3, badge: 'Stats' },
      ],
    },
  ], [language, dueSRSCount]);

  const allTabs = useMemo(() => categories.flatMap((cat) => cat.items), [categories]);

  // Bottom Navigation Mobile items
  const mobileBottomItems = useMemo(() => [
    { id: 'grid', label: language === 'ar' ? 'المعجم' : 'Catalog', icon: BookOpen },
    { id: 'flashcards', label: language === 'ar' ? 'البطاقات' : 'Cards', icon: Layers },
    { id: 'speed-drill', label: language === 'ar' ? 'الاستماع' : 'Listen', icon: Zap },
    { id: 'minimal-pairs', label: language === 'ar' ? 'الأصوات' : 'Pairs', icon: Radio },
    { id: 'analytics', label: language === 'ar' ? 'التقدم' : 'Stats', icon: BarChart3 },
  ], [language]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full glass-panel border-b transition-transform duration-300 ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-1 sm:gap-2">
            {/* Brand Logo strictly isolated in LTR */}
            <div
              className="flex items-center gap-1.5 cursor-pointer group shrink-0"
              onClick={() => setActiveTab('grid')}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center font-black text-sm sm:text-base theme-btn-primary shadow-sm shrink-0">
                ⚡
              </div>
              <div dir="ltr" className="ltr-token shrink-0 flex items-center gap-1">
                <span className="text-xs sm:text-base font-black tracking-tight text-slate-900 dark:text-slate-100">
                  Oxford <span className="text-blue-600 dark:text-blue-400">3000™</span>
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden xl:flex items-center gap-1 p-1 rounded-2xl border bg-[var(--bg-card)] shrink min-w-0 max-w-full overflow-x-auto no-scrollbar shadow-sm">
              {allTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'theme-btn-primary shadow-sm scale-102'
                        : 'opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-arabic">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded-md bg-black/10 dark:bg-white/10 opacity-90">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls Bar */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Direct 3-Theme 1-Click Switcher Pills (Brutalism ⚡, Organic 🌿, Swiss 🇨🇭) */}
              <div className="flex items-center p-0.5 rounded-xl border bg-black/5 dark:bg-white/5 gap-0.5 shrink-0">
                {THEMES.map((th) => {
                  const isActive = theme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => setTheme(th.id)}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all active:scale-90 ${
                        isActive
                          ? 'theme-btn-primary shadow-sm scale-105'
                          : 'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                      title={th.name}
                    >
                      {th.emoji}
                    </button>
                  );
                })}
              </div>

              {/* Daily Streak Flame Counter */}
              <div
                className="hidden md:flex items-center gap-1 px-2 py-1 rounded-xl border bg-black/5 dark:bg-white/5 text-xs font-bold font-mono shrink-0"
                title={`سلسلة الأيام الدراسية: ${streak} أيام متواصلة!`}
              >
                <Flame className={`w-3.5 h-3.5 text-amber-500 ${streak > 0 ? 'flame-streak-active' : ''}`} />
                <span className="text-amber-500 font-bold">{streak}d</span>
              </div>

              {/* Light / Dark Mode Toggle */}
              <button
                onClick={toggleMode}
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl border text-xs font-bold transition-all theme-btn-secondary shrink-0 active:scale-90"
                title="التبديل بين الوضع الليلي والنهاري"
                aria-label="Toggle dark/light mode"
              >
                {mode === 'light' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                )}
              </button>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-xl theme-btn-secondary text-xs font-bold transition-all shrink-0 active:scale-90 border shadow-sm"
                title={language === 'en' ? 'التحويل إلى العربية' : 'Switch to English'}
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" />
              </button>

              {/* Authenticated User & Logout */}
              {authUser && (
                <div className="flex items-center gap-1 pl-1 border-l rtl:pr-1 rtl:border-r rtl:border-l-0 shrink-0">
                  <div
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-xl bg-black/5 dark:bg-white/5 border text-xs font-bold font-arabic"
                    title={`المستخدم: ${authUser.name}`}
                  >
                    <span>{authUser.avatar || '👨‍🎓'}</span>
                    <span className="hidden lg:inline">{authUser.name}</span>
                  </div>

                  <button
                    onClick={logoutUser}
                    className="p-1 rounded-xl hover:bg-rose-500/10 text-rose-500 border border-rose-500/20 active:scale-90 transition-all"
                    title="تسجيل الخروج"
                    aria-label="Logout"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Mobile Drawer Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 border rounded-xl xl:hidden text-xs font-bold shrink-0 theme-btn-secondary active:scale-90"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Full Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden p-4 border-b space-y-4 bg-[var(--bg-card)] shadow-2xl max-h-[85vh] overflow-y-auto dropdown-animate font-arabic">
            {/* User Profile Bar inside drawer */}
            {authUser && (
              <div className="p-3 rounded-2xl border bg-black/5 dark:bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{authUser.avatar}</span>
                  <div>
                    <span className="text-xs font-bold block">{authUser.name}</span>
                    <span className="text-[10px] opacity-60 font-mono">سلسلة: {streak} أيام &bull; {xp} XP</span>
                  </div>
                </div>
                <button
                  onClick={logoutUser}
                  className="px-3 py-1 rounded-xl border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>خروج</span>
                </button>
              </div>
            )}

            {/* Offline Status */}
            {isOffline && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
                <WifiOff className="w-4 h-4" />
                <span>وضع عدم الاتصال مفعل - جميع الكلمات متاحة محلياً</span>
              </div>
            )}

            {/* Categorized Links Grid */}
            {categories.map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider opacity-80 flex items-center gap-1.5 text-blue-500">
                  <cat.icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center justify-between gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                          isActive ? 'theme-btn-primary shadow-sm' : 'theme-btn-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 opacity-90">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Mobile Bottom Bar for Rapid Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 xl:hidden glass-panel border-t px-2 py-1.5 flex items-center justify-around shadow-lg backdrop-blur-md">
        {mobileBottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 flex-1 max-w-[65px] ${
                isActive
                  ? 'theme-btn-primary font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[var(--text-main)] active:scale-90 font-medium'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5 shrink-0" />
              <span className="text-[10px] leading-tight truncate max-w-full font-arabic">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
