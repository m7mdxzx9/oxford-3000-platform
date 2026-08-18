'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  MessageSquare,
  Sparkles,
  Layers,
  Gamepad2,
  BarChart3,
  Palette,
  Moon,
  Sun,
  Key,
  Volume2,
  Cpu,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeStudioModal } from './ThemeStudioModal';
import { GrokKeySettingsModal } from '@/features/ai-engine/components/GrokKeySettingsModal';
import { THEMES } from '@/styles/themes';

export function Header({ currentPath }: { currentPath: string }) {
  const [isThemeModalOpen, setIsThemeModalOpen] = React.useState(false);
  const [isGrokModalOpen, setIsGrokModalOpen] = React.useState(false);

  const themeId = useStore((state) => state.themeId);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const toggleDarkMode = useStore((state) => state.toggleDarkMode);
  const totalXp = useStore((state) => state.totalXp);
  const audioRate = useStore((state) => state.audioPlaybackRate);
  const setAudioRate = useStore((state) => state.setAudioPlaybackRate);

  const activeTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  const navItems = [
    { label: 'شبكة المفردات', href: '/', icon: BookOpen },
    { label: 'المعلم الذكي', href: '/tutor', icon: MessageSquare },
    { label: 'استوديو الجمل والقصص', href: '/story', icon: Sparkles },
    { label: 'بطاقات SRS', href: '/flashcards', icon: Layers },
    { label: 'الألعاب والمسابقات', href: '/games', icon: Gamepad2 },
    { label: 'التحليلات', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-surface/85 backdrop-blur-md transition-colors">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Theme Indicator */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-heading font-black text-base tracking-tight text-foreground flex items-center gap-1.5">
                  <span>Oxford 3000™</span>
                  <Badge variant="accent" className="archetype-badge text-[10px] px-1.5 py-0">PRO</Badge>
                </h1>
                <p className="text-[10px] text-muted-foreground hidden sm:block">CEFR A1–B2 Master Platform</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary font-black'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions (Audio Speed, Grok Key, Theme Picker, Dark Mode, XP) */}
          <div className="flex items-center gap-2">
            {/* Audio Speed Picker */}
            <select
              value={audioRate}
              onChange={(e) => setAudioRate(parseFloat(e.target.value))}
              className="h-8 rounded-lg border border-border bg-surface px-2 text-xs font-mono font-bold text-foreground cursor-pointer"
              title="سرعة نطق الصوت الطبيعي"
            >
              <option value="0.6">0.6x</option>
              <option value="0.8">0.8x</option>
              <option value="0.9">0.9x</option>
              <option value="1.0">1.0x</option>
              <option value="1.2">1.2x</option>
            </select>

            {/* Grok API Key Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGrokModalOpen(true)}
              className="archetype-btn h-8 gap-1.5 text-xs hidden md:flex font-bold"
              title="إعدادات مفتاح Grok (xAI API)"
            >
              <Cpu className="h-3.5 w-3.5 text-primary" />
              <span>Grok AI</span>
            </Button>

            {/* Theme Selector Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsThemeModalOpen(true)}
              className="archetype-btn h-8 gap-1.5 text-xs hidden sm:flex font-bold"
              title="فتح استوديو النماذج والثيمات"
            >
              <Palette className="h-3.5 w-3.5 text-primary" />
              <span className="truncate max-w-[100px]">{activeTheme.name.split(' ')[0]}</span>
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="h-8 w-8 text-foreground"
              title="تبديل الوضع الفاتح / الداكن"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* User XP Pill */}
            <div className="h-8 px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 shadow-sm">
              <span>⚡ {totalXp} XP</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-around border-t border-border/40 py-2 px-2 overflow-x-auto bg-surface/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-2 rounded-lg text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                  isActive ? 'text-primary font-black' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px]">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Theme Studio Modal */}
      <ThemeStudioModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />

      {/* Grok Key Settings Modal */}
      <GrokKeySettingsModal isOpen={isGrokModalOpen} onClose={() => setIsGrokModalOpen(false)} />
    </>
  );
}
