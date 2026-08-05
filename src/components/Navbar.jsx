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
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    theme,
    setTheme,
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
    { id: 'flashcards', label: t('navFlashcards'), icon: Layers },
    { id: 'quiz', label: t('navQuiz'), icon: Award },
    { id: 'analytics', label: t('navAnalytics'), icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-black/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Editorial Title */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('grid')}>
            <div className="w-10 h-10 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center font-bold text-lg">
              ⚡
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Oxford 3000™</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-black/20 font-bold font-mono">
                  PRO
                </span>
              </h1>
              <p className="text-[11px] opacity-75 font-semibold">
                Multi-Theme CEFR Platform
              </p>
            </div>
          </div>

          {/* Dynamic Theme Switcher Control Bar */}
          <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-xl border border-black/20 bg-black/5">
            {THEMES.map((th) => (
              <button
                key={th.id}
                onClick={() => setTheme(th.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  theme === th.id
                    ? 'theme-btn-primary shadow-sm'
                    : 'opacity-70 hover:opacity-100 hover:bg-black/5'
                }`}
              >
                <span>{th.emoji}</span>
                <span>{th.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden xl:flex items-center gap-1 p-1.5 rounded-xl border border-black/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'theme-btn-primary'
                      : 'opacity-70 hover:opacity-100 hover:bg-black/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls Bar */}
          <div className="flex items-center gap-2">
            {/* Natural Voice Selector */}
            <div className="hidden sm:flex items-center gap-1.5 border border-black/15 px-2.5 py-1.5 rounded-xl text-xs font-bold">
              <Volume2 className="w-3.5 h-3.5" />
              <select
                value={voicePreset}
                onChange={(e) => setVoicePreset(e.target.value)}
                className="bg-transparent font-bold focus:outline-none cursor-pointer text-xs"
              >
                {voicePresets.map((vp) => (
                  <option key={vp.id} value={vp.id} className="bg-white text-black font-bold">
                    {vp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 theme-btn-secondary text-xs font-bold transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('langToggle')}</span>
            </button>

            {/* API Key Modal Button */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 theme-btn-primary text-xs font-extrabold transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Active</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-black/20 rounded-xl xl:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation & Theme Switcher */}
      {mobileMenuOpen && (
        <div className="xl:hidden p-4 border-b border-black/20 space-y-3">
          {/* Mobile Theme Switcher Bar */}
          <div className="p-2 bg-black/5 rounded-xl flex items-center justify-between gap-1">
            <span className="text-xs font-extrabold">Theme:</span>
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
            </div>
          </div>

          <div className="p-3 border border-black/10 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold">Select Voice:</span>
            <select
              value={voicePreset}
              onChange={(e) => setVoicePreset(e.target.value)}
              className="p-1 rounded text-xs font-bold border border-black/20"
            >
              {voicePresets.map((vp) => (
                <option key={vp.id} value={vp.id}>
                  {vp.name}
                </option>
              ))}
            </select>
          </div>

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
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all ${
                  isActive ? 'theme-btn-primary' : 'theme-btn-secondary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
