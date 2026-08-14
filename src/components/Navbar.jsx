import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  Award,
  BarChart3,
  Key,
  Globe,
  Menu,
  X,
  MessageSquare,
  UserCheck,
  Volume2,
  Activity,
  Sun,
  Moon,
  Gamepad2,
  Users,
  Search,
  ChevronDown,
  Palette,
  Flame,
  Trophy,
  Zap,
  Radio,
  Mic,
  Brain,
  Wifi,
  WifiOff,
  LogOut,
  User,
  Compass,
  CheckCircle2,
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
    setIsApiKeyModalOpen,
    language,
    toggleLanguage,
    t,
    isOffline,
    streak,
    xp,
    dueSRSCount,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
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

  // Structured Categories Definition with all requested sections & skills
  const categories = useMemo(() => [
    {
      id: 'vocab-hub',
      label: language === 'ar' ? 'المفردات والأقسام' : 'Vocab & Tracks',
      icon: BookOpen,
      items: [
        { id: 'grid', label: language === 'ar' ? 'المعجم الكامل (3000)' : 'Oxford 3000', icon: BookOpen, badge: '3000' },
        { id: 'kickstart', label: language === 'ar' ? 'قفزة المبتدئين الصفر (A0)' : 'Kickstart A0', icon: Compass, badge: 'Zero' },
        { id: 'bridge', label: language === 'ar' ? 'جسر الانتقال (A2➔B1)' : 'B1 Bridge', icon: Zap, badge: 'Bridge' },
        { id: 'flashcards', label: language === 'ar' ? 'بطاقات 3D والتكرار الذكي' : '3D Flashcards', icon: Layers, badge: dueSRSCount > 0 ? `${dueSRSCount} Due` : 'SRS' },
      ],
    },
    {
      id: 'skills-lab',
      label: language === 'ar' ? 'مختبرات المهارات' : 'Skill Labs',
      icon: Activity,
      items: [
        { id: 'speed-drill', label: language === 'ar' ? 'تحدي سرعة الاستماع' : 'Speed Listening', icon: Zap, badge: '0.7x-1.5x' },
        { id: 'minimal-pairs', label: language === 'ar' ? 'الأصوات المشوشة' : 'Minimal Pairs', icon: Radio, badge: 'Phonetics' },
        { id: 'spelling-bee', label: language === 'ar' ? 'اختبار الإملاء الذكي' : 'Spelling Bee', icon: Award, badge: 'Bee' },
        { id: 'active-recall', label: language === 'ar' ? 'الاستدعاء النشط' : 'Active Recall', icon: Brain, badge: 'Memory' },
        { id: 'voice-archive', label: language === 'ar' ? 'أرشيف التطور الصوتي' : 'Voice Archive', icon: Mic, badge: 'Compare' },
        { id: 'pronunciation', label: language === 'ar' ? 'استوديو النطق المتقدم' : 'Speech Studio', icon: Activity, badge: 'AI' },
      ],
    },
    {
      id: 'ai-tools',
      label: language === 'ar' ? 'الذكاء الاصطناعي والألعاب' : 'AI & Games',
      icon: Sparkles,
      items: [
        { id: 'sentence', label: language === 'ar' ? 'مولد الجمل والسياقات' : 'AI Sentences', icon: Sparkles, badge: 'AI' },
        { id: 'story', label: language === 'ar' ? 'الحكواتي التفاعلي' : 'AI Storyteller', icon: MessageSquare, badge: 'Story' },
        { id: 'tutor', label: language === 'ar' ? 'المعلم الشخصي الذكي' : 'Personal Tutor', icon: UserCheck, badge: 'Tutor' },
        { id: 'quiz', label: language === 'ar' ? 'اختبار المعرفة' : 'Quiz Game', icon: Award, badge: 'Quiz' },
        { id: 'chain', label: language === 'ar' ? 'سلسلة الكلمات' : 'Word Chain', icon: Gamepad2, badge: 'Game' },
        { id: 'detective', label: language === 'ar' ? 'المحقق اللغوي' : 'Word Detective', icon: Search, badge: 'Mystery' },
        { id: 'dual', label: language === 'ar' ? 'مبارزة 1 ضد 1' : '1v1 Arena', icon: Users, badge: 'PvP' },
      ],
    },
    {
      id: 'progress',
      label: language === 'ar' ? 'التحليلات والنمو' : 'Growth & Stats',
      icon: BarChart3,
      items: [
        { id: 'analytics', label: language === 'ar' ? 'لوحة التحليلات والإحصائيات' : 'Analytics Hub', icon: BarChart3, badge: 'Stats' },
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
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Brand Logo with 3D Micro-animated Icon (Feature 5 & 8) */}
            <div
              className="flex items-center gap-2 cursor-pointer group shrink-0"
              onClick={() => setActiveTab('grid')}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center font-black text-sm sm:text-base theme-btn-primary shadow-md shrink-0 tab-active-bounce">
                ⚡
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black tracking-tight">
                  Oxford <span className="text-cyan-500">3000™</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full border font-black font-mono theme-btn-secondary">
                  CEFR
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs (Horizontal Scrollable Pill Bar) */}
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
                        ? 'theme-btn-primary shadow-md scale-105 tab-active-bounce'
                        : 'opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10 opacity-90">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls Bar */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Daily Streak Flame Counter (Feature 71) */}
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-xl border bg-black/5 dark:bg-white/5 text-xs font-bold font-mono cursor-pointer"
                title={`سلسلة الأيام الدراسية: ${streak} أيام متواصلة!`}
              >
                <Flame className={`w-4 h-4 text-amber-500 ${streak > 0 ? 'flame-streak-active' : ''}`} />
                <span className="text-amber-500">{streak}d</span>
              </div>

              {/* 3 Themes Switcher Dropdown (Royal, Emerald, Sunset) */}
              <div className="relative">
                <button
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border theme-btn-secondary text-xs font-black transition-all active:scale-95 shadow-sm"
                  title="تغيير الهوية البصرية والخطوط (3 Themes)"
                >
                  <Palette className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">
                    {THEMES.find((th) => th.id === theme)?.name.split(' ')[0] || 'الهوية'}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {themeDropdownOpen && (
                  <div className="absolute top-full mt-2 right-0 rtl:left-0 rtl:right-auto w-64 glass-panel p-2 rounded-2xl border shadow-2xl z-50 dropdown-animate space-y-1 font-arabic">
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-70 px-2 py-1 block">
                      اختر الهوية البصرية والخطوط:
                    </span>
                    {THEMES.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => {
                          setTheme(th.id);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full p-2 rounded-xl text-xs font-bold text-right flex items-center justify-between transition-all ${
                          theme === th.id
                            ? 'theme-btn-primary shadow-sm'
                            : 'theme-btn-secondary hover:scale-101'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span>{th.emoji}</span>
                            <span>{th.name}</span>
                          </div>
                          <div className="text-[10px] opacity-75 font-mono">{th.fonts}</div>
                        </div>
                        {theme === th.id && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Light / Dark Mode Toggle */}
              <button
                onClick={toggleMode}
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border text-xs font-black transition-all theme-btn-secondary shrink-0 active:scale-90"
                title={`التبديل بين الوضع الليلي والنهاري`}
                aria-label="Toggle dark/light mode"
              >
                {mode === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <Moon className="w-4 h-4 text-cyan-400 shrink-0" />
                )}
              </button>

              {/* Language Switcher (AR / EN) */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl theme-btn-secondary text-xs font-black transition-all whitespace-nowrap shrink-0 active:scale-95 border shadow-sm"
                title={language === 'en' ? 'التحويل إلى اللغة العربية' : 'Switch to English'}
              >
                <Globe className="w-3.5 h-3.5 shrink-0 text-cyan-500" />
                <span className="font-mono font-bold text-[11px]">
                  {language === 'en' ? 'عربي' : 'EN'}
                </span>
              </button>

              {/* Authenticated User Avatar & Logout */}
              {authUser && (
                <div className="flex items-center gap-1 pl-1 border-l rtl:pr-1 rtl:border-r rtl:border-l-0">
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold font-arabic"
                    title={`الحساب النشط: ${authUser.name}`}
                  >
                    <span>{authUser.avatar || '👨‍🎓'}</span>
                    <span className="hidden md:inline">{authUser.name}</span>
                  </div>

                  <button
                    onClick={logoutUser}
                    className="p-1.5 rounded-xl hover:bg-rose-500/10 text-rose-500 border border-rose-500/20 active:scale-90 transition-all"
                    title="تسجيل الخروج"
                    aria-label="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Mobile Drawer Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 sm:p-2 border rounded-xl xl:hidden text-xs font-black shrink-0 theme-btn-secondary active:scale-90"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                <span className="text-[11px] font-black uppercase tracking-wider opacity-80 flex items-center gap-1.5 text-cyan-500">
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
                          isActive ? 'theme-btn-primary shadow-md' : 'theme-btn-secondary'
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 xl:hidden glass-panel border-t px-1.5 pt-1.5 pb-2.5 flex items-center justify-around shadow-2xl backdrop-blur-xl">
        {mobileBottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all duration-200 flex-1 max-w-[70px] ${
                isActive
                  ? 'theme-btn-primary shadow-md scale-105 font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[var(--text-main)] active:scale-90 font-bold'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5 shrink-0" />
              <span className="text-[9px] leading-tight truncate max-w-full font-arabic">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
