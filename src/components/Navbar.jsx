import React, { useState } from 'react';
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
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'grid', label: t('navCatalog'), icon: BookOpen },
    { id: 'sentence', label: t('navSentence'), icon: Sparkles },
    { id: 'story', label: t('navStory'), icon: MessageSquare },
    { id: 'tutor', label: t('navTutor'), icon: UserCheck },
    { id: 'pronunciation', label: t('navPronunciation'), icon: Activity },
    { id: 'quiz', label: t('navQuiz'), icon: Award },
    { id: 'analytics', label: t('navAnalytics'), icon: BarChart3 },
  ];

  // Primary tabs featured in mobile bottom navigation bar
  const mobileBottomItems = [
    { id: 'grid', label: 'Catalog', icon: BookOpen },
    { id: 'story', label: 'Story', icon: MessageSquare },
    { id: 'pronunciation', label: 'Speak', icon: Activity },
    { id: 'tutor', label: 'Tutor', icon: UserCheck },
    { id: 'quiz', label: 'Quiz', icon: Award },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b transition-all duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-2 cursor-pointer group shrink-0" onClick={() => setActiveTab('grid')}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center font-bold text-sm sm:text-base theme-btn-secondary shrink-0">
                ⚡
              </div>
              <div className="shrink-0">
                <h1 className="text-xs sm:text-base font-extrabold tracking-tight flex items-center gap-1">
                  <span>Oxford 3000™</span>
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full border font-bold font-mono opacity-80">
                    PRO
                  </span>
                </h1>
                <p className="hidden xs:block text-[9px] sm:text-[10px] opacity-75 font-semibold">
                  Multi-Theme CEFR Platform
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl border bg-[var(--bg-card)] overflow-x-auto max-w-full shrink min-w-0 no-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'theme-btn-primary shadow-sm'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Controls Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Dynamic Theme Switcher Pills */}
              <div className="hidden 2xl:flex items-center gap-1 p-1 rounded-xl border bg-[var(--bg-card)] shrink-0">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-extrabold transition-all ${
                      theme === th.id
                        ? 'theme-btn-primary shadow-sm'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span>{th.emoji}</span>
                  </button>
                ))}
              </div>

              {/* Light / Dark Mode Toggle */}
              <button
                onClick={toggleMode}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-extrabold transition-all theme-btn-secondary whitespace-nowrap shrink-0"
                title={`Switch mode`}
              >
                {mode === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                <span className="hidden md:inline">{mode === 'light' ? 'Light' : 'Dark'}</span>
              </button>

              {/* Natural Voice Selector */}
              <div className="hidden xl:flex items-center gap-1 border px-2 py-1 rounded-xl text-xs font-bold shrink-0">
                <Volume2 className="w-3.5 h-3.5 shrink-0" />
                <select
                  value={voicePreset}
                  onChange={(e) => setVoicePreset(e.target.value)}
                  className="bg-transparent font-bold focus:outline-none cursor-pointer text-xs max-w-[100px] truncate"
                >
                  {voicePresets.map((vp) => (
                    <option key={vp.id} value={vp.id} className="bg-[var(--bg-card)] text-[var(--text-main)] font-bold">
                      {vp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2 py-1.5 theme-btn-secondary text-xs font-bold transition-all whitespace-nowrap shrink-0"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t('langToggle')}</span>
              </button>

              {/* API Key Modal Button */}
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="flex items-center gap-1 px-2 py-1.5 theme-btn-primary text-xs font-extrabold transition-all whitespace-nowrap shrink-0"
              >
                <Key className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">AI Key</span>
              </button>

              {/* Mobile Menu Drawer Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 border rounded-xl lg:hidden text-xs font-bold shrink-0"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden p-3 border-b space-y-2 bg-[var(--bg-card)]">
            <div className="p-2 border rounded-xl flex items-center justify-between gap-2">
              <span className="text-xs font-bold">Identity & Mode:</span>
              <div className="flex items-center gap-1">
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`px-2 py-1 rounded text-xs font-black ${
                      theme === th.id ? 'theme-btn-primary' : 'opacity-70'
                    }`}
                  >
                    {th.emoji}
                  </button>
                ))}
                <button
                  onClick={toggleMode}
                  className="px-2 py-1 rounded text-xs font-black theme-btn-secondary"
                >
                  {mode === 'light' ? '☀️' : '🌙'}
                </button>
              </div>
            </div>

            <div className="p-2 border rounded-xl flex items-center justify-between gap-2">
              <span className="text-xs font-bold">Narrator Voice:</span>
              <select
                value={voicePreset}
                onChange={(e) => setVoicePreset(e.target.value)}
                className="p-1 rounded text-xs font-bold border max-w-[180px] bg-transparent"
              >
                {voicePresets.map((vp) => (
                  <option key={vp.id} value={vp.id} className="bg-[var(--bg-card)] text-[var(--text-main)]">
                    {vp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                      isActive ? 'theme-btn-primary' : 'theme-btn-secondary'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
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
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'theme-btn-primary scale-105 shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-black mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

