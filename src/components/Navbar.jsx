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
    <header className="sticky top-0 z-40 w-full glass-panel border-b transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 py-2 sm:py-3 gap-3 flex-wrap">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setActiveTab('grid')}>
            <div className="w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-base theme-btn-secondary">
              ⚡
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight flex items-center gap-1.5">
                <span>Oxford 3000™</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border font-bold font-mono opacity-80">
                  PRO
                </span>
              </h1>
              <p className="text-[10px] opacity-75 font-semibold">
                Multi-Theme Platform
              </p>
            </div>
          </div>

          {/* Dynamic Theme Switcher Pills Bar */}
          <div className="flex items-center gap-1 p-1 rounded-xl border bg-[var(--bg-card)]">
            {THEMES.map((th) => (
              <button
                key={th.id}
                onClick={() => setTheme(th.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all ${
                  theme === th.id
                    ? 'theme-btn-primary shadow-sm'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <span>{th.emoji}</span>
                <span className="hidden xs:inline">{th.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden xl:flex items-center gap-1 p-1 rounded-xl border bg-[var(--bg-card)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'theme-btn-primary'
                      : 'opacity-70 hover:opacity-100'
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
            <div className="hidden sm:flex items-center gap-1 border px-2 py-1 rounded-xl text-xs font-bold">
              <Volume2 className="w-3.5 h-3.5" />
              <select
                value={voicePreset}
                onChange={(e) => setVoicePreset(e.target.value)}
                className="bg-transparent font-bold focus:outline-none cursor-pointer text-xs"
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
              className="flex items-center gap-1 px-2.5 py-1 theme-btn-secondary text-xs font-bold transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('langToggle')}</span>
            </button>

            {/* API Key Modal Button */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 theme-btn-primary text-xs font-extrabold transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Active</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 border rounded-xl xl:hidden text-xs font-bold"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden p-3 border-b space-y-2">
          <div className="p-2 border rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold">Select Voice:</span>
            <select
              value={voicePreset}
              onChange={(e) => setVoicePreset(e.target.value)}
              className="p-1 rounded text-xs font-bold border"
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${
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
