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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#090a0f]/85 border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo & Editorial Title */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('grid')}>
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:border-indigo-400/50 transition-all">
              <Zap className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Oxford 3000™</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                  PRO
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400 font-medium">
                CEFR Vocabulary Suite
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-white/[0.06]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-sm border border-white/10'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
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
            <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900/80 border border-white/[0.08] px-2.5 py-1.5 rounded-xl text-xs">
              <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={voicePreset}
                onChange={(e) => setVoicePreset(e.target.value)}
                className="bg-transparent text-zinc-200 font-medium focus:outline-none cursor-pointer text-xs"
              >
                {voicePresets.map((vp) => (
                  <option key={vp.id} value={vp.id} className="bg-zinc-950 text-white">
                    {vp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/[0.08] rounded-xl text-xs font-semibold transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t('langToggle')}</span>
            </button>

            {/* API Key Modal Button */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Active</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white rounded-xl lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden p-4 bg-zinc-950 border-b border-zinc-800 space-y-2">
          <div className="p-3 bg-zinc-900 rounded-xl mb-3 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Select Voice:</span>
            <select
              value={voicePreset}
              onChange={(e) => setVoicePreset(e.target.value)}
              className="bg-zinc-950 text-zinc-200 p-1.5 rounded-lg text-xs border border-zinc-800"
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
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-zinc-300 bg-zinc-900/50 hover:bg-zinc-900'
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
