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
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    theme,
    setTheme,
    mode,
    toggleMode,
    THEMES,
    setIsApiKeyModalOpen,
    toggleLanguage,
    t,
    voicePreset,
    setVoicePreset,
    voicePresets,
    xp,
    level,
    dailyStreak,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategoryDropdown, setActiveCategoryDropdown] = useState(null);

  // Smart Collapsible Mobile Header Scroll Listener
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 80 && currentScrollY > lastScrollY) {
        setIsHeaderVisible(false);
        setActiveCategoryDropdown(null);
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
      id: 'vocab',
      label: t('catVocab'),
      icon: BookOpen,
      items: [
        { id: 'grid', label: t('navCatalog'), icon: BookOpen, badge: '3000 Words' },
        { id: 'flashcards', label: t('navFlashcards'), icon: Layers, badge: '3D SRS' },
      ],
    },
    {
      id: 'ai',
      label: t('catAi'),
      icon: Sparkles,
      items: [
        { id: 'sentence', label: t('navSentence'), icon: Sparkles, badge: 'Builder' },
        { id: 'story', label: t('navStory'), icon: MessageSquare, badge: 'Epic Novel' },
        { id: 'tutor', label: t('navTutor'), icon: UserCheck, badge: 'Roleplay' },
        { id: 'pronunciation', label: t('navPronunciation'), icon: Activity, badge: 'Speech' },
      ],
    },
    {
      id: 'games',
      label: t('catGames'),
      icon: Gamepad2,
      items: [
        { id: 'quiz', label: t('navQuiz'), icon: Award, badge: 'Quiz' },
        { id: 'chain', label: t('navChain'), icon: Gamepad2, badge: 'Chain' },
        { id: 'detective', label: t('navDetective'), icon: Search, badge: 'Mystery' },
        { id: 'dual', label: t('navDual'), icon: Users, badge: '1v1 Hub' },
      ],
    },
    {
      id: 'progress',
      label: t('catProgress'),
      icon: BarChart3,
      items: [
        { id: 'analytics', label: t('navAnalytics'), icon: BarChart3, badge: 'Stats' },
      ],
    },
  ], [t]);

  // Flat list of all available tabs
  const allTabs = useMemo(() => {
    return categories.flatMap((cat) => cat.items);
  }, [categories]);

  // Primary quick tabs featured in mobile bottom navigation bar
  const mobileBottomItems = [
    { id: 'grid', label: 'Catalog', icon: BookOpen },
    { id: 'flashcards', label: 'Cards', icon: Layers },
    { id: 'story', label: 'Story', icon: MessageSquare },
    { id: 'quiz', label: 'Quiz', icon: Award },
    { id: 'analytics', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full glass-panel border-b transition-transform duration-300 ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 overflow-hidden">
            {/* Brand Logo & Title */}
            <div
              className="flex items-center gap-2 cursor-pointer group shrink-0"
              onClick={() => setActiveTab('grid')}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center font-black text-xs sm:text-base theme-btn-primary shadow-sm shrink-0">
                ⚡
              </div>
              <div className="shrink-0">
                <h1 className="text-xs sm:text-base font-black tracking-tight flex items-center gap-1">
                  <span>Oxford</span>
                  <span className="hidden xs:inline">3000™</span>
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full border font-black font-mono opacity-90 theme-btn-secondary">
                    PRO
                  </span>
                </h1>
              </div>
            </div>

            {/* Desktop Navigation Categories & Tabs Bar */}
            <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-2xl border bg-[var(--bg-card)] shrink min-w-0 max-w-full overflow-x-auto no-scrollbar shadow-sm">
              {allTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-200 whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'theme-btn-primary shadow-md scale-105 tab-active-bounce'
                        : 'opacity-75 hover:opacity-100 hover:bg-black/5 hover:scale-102'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls Bar */}
            <div className="flex items-center gap-1 sm:gap-2 shrink min-w-0">
              {/* Learner Level & XP Badge */}
              <button
                onClick={() => setActiveTab('analytics')}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-black theme-btn-secondary shrink-0 shadow-sm hover:scale-105 active:scale-95 transition-transform"
                title={`Level ${level || 1} • ${xp || 0} XP • Streak: ${dailyStreak || 1} days`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Lv.{level || 1}</span>
                <span className="opacity-60">•</span>
                <span className="text-amber-600 dark:text-amber-400">{xp || 0} XP</span>
              </button>

              {/* Theme Switcher Pills */}
              <div
                className="flex items-center gap-0.5 p-0.5 sm:p-1 rounded-xl border bg-[var(--bg-card)] shrink overflow-x-auto max-w-[110px] sm:max-w-none no-scrollbar"
                title="اختر الهوية البصرية (Theme)"
              >
                <Palette className="w-3 h-3 opacity-70 ml-0.5 shrink-0 text-amber-500 hidden sm:block" />
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`flex items-center justify-center w-6 h-6 sm:w-auto sm:px-2 py-0.5 rounded-lg text-[11px] sm:text-xs font-black transition-all shrink-0 active:scale-90 ${
                      theme === th.id
                        ? 'theme-btn-primary shadow-sm scale-105'
                        : 'opacity-75 hover:opacity-100 hover:scale-105'
                    }`}
                    title={th.name}
                  >
                    <span>{th.emoji}</span>
                  </button>
                ))}
              </div>

              {/* Light / Dark Mode Toggle */}
              <button
                onClick={toggleMode}
                className="flex items-center justify-center p-2 rounded-xl border text-xs font-black transition-all theme-btn-secondary shrink-0 active:scale-90"
                title={`Switch Light / Dark Mode`}
              >
                {mode === 'light' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                )}
              </button>

              {/* Voice Selector */}
              <div className="hidden 2xl:flex items-center gap-1 border px-2 py-1 rounded-xl text-xs font-black shrink-0">
                <Volume2 className="w-3.5 h-3.5 shrink-0 text-cyan-500" />
                <select
                  value={voicePreset}
                  onChange={(e) => setVoicePreset(e.target.value)}
                  className="bg-transparent font-black focus:outline-none cursor-pointer text-xs max-w-[90px] truncate"
                >
                  {voicePresets.map((vp) => (
                    <option
                      key={vp.id}
                      value={vp.id}
                      className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold"
                    >
                      {vp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2.5 py-1.5 theme-btn-secondary text-xs font-black transition-all whitespace-nowrap shrink-0 active:scale-95 hover:scale-105"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t('langToggle')}</span>
              </button>

              {/* API Key Modal Button */}
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 theme-btn-primary text-xs font-black transition-all whitespace-nowrap shrink-0 shadow-sm active:scale-95 hover:scale-105"
              >
                <Key className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">AI Key</span>
              </button>

              {/* Mobile Drawer Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 border rounded-xl lg:hidden text-xs font-black shrink-0 theme-btn-secondary active:scale-90"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Navigation Menu Organized By Categories */}
        {mobileMenuOpen && (
          <div className="lg:hidden p-3 border-b space-y-3 bg-[var(--bg-card)] shadow-2xl max-h-[80vh] overflow-y-auto dropdown-animate">
            {/* Quick User Stats in Drawer */}
            <div className="p-2.5 border rounded-2xl flex items-center justify-between gap-2 theme-btn-secondary shadow-sm">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black">المستوى {level || 1} ({xp || 0} XP)</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-black text-amber-500">
                <Flame className="w-3.5 h-3.5" />
                <span>{dailyStreak || 1} أيام</span>
              </div>
            </div>

            {/* Categorized Links Grid */}
            {categories.map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider opacity-70 flex items-center gap-1">
                  <cat.icon className="w-3 h-3 text-cyan-500" />
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
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
                          isActive ? 'theme-btn-primary shadow-md scale-102' : 'theme-btn-secondary'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 xl:hidden glass-panel border-t p-1.5 flex items-center justify-around shadow-2xl">
        {mobileBottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'theme-btn-primary scale-108 shadow-md tab-active-bounce'
                  : 'opacity-70 hover:opacity-100 hover:scale-105 active:scale-90'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[10px] font-black mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
