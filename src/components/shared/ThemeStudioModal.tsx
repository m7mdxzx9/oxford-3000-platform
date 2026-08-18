'use client';

import * as React from 'react';
import { Palette, Check, Moon, Sun, Sparkles } from 'lucide-react';
import { THEMES, ThemeConfig } from '@/styles/themes';
import { useStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ThemeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeStudioModal({ isOpen, onClose }: ThemeStudioModalProps) {
  const currentThemeId = useStore((state) => state.themeId);
  const setThemeId = useStore((state) => state.setThemeId);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const toggleDarkMode = useStore((state) => state.toggleDarkMode);
  const [activeCategory, setActiveCategory] = React.useState<string>('all');

  const filteredThemes = React.useMemo(() => {
    if (activeCategory === 'all') return THEMES;
    return THEMES.filter((t) => t.category === activeCategory);
  }, [activeCategory]);

  const handleSelectTheme = (theme: ThemeConfig) => {
    setThemeId(theme.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <span>Visual Systems Studio (25 Unique Themes)</span>
              </DialogTitle>
              <DialogDescription>
                Select from 25 production-grade design systems with bespoke typography, elevations, and color tokens.
              </DialogDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="gap-2 shrink-0 mr-6"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Category Filter Tabs */}
        <div className="flex gap-2 border-b border-border pb-3 my-2 overflow-x-auto">
          {['all', 'heritage', 'modern', 'cyber', 'artistic', 'minimal'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors',
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of 25 Themes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredThemes.map((theme) => {
            const isSelected = currentThemeId === theme.id;
            const colors = isDarkMode ? theme.dark : theme.light;

            return (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between space-y-3 group hover:shadow-md',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30 shadow-md'
                    : 'border-border hover:border-primary/40'
                )}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4
                      className="font-bold text-sm leading-tight"
                      style={{ color: colors.foreground }}
                    >
                      {theme.name}
                    </h4>
                    <span className="text-[10px] uppercase font-mono tracking-wider opacity-70" style={{ color: colors.mutedForeground }}>
                      {theme.category}
                    </span>
                  </div>
                  {isSelected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {/* Mood Description */}
                <p className="text-xs line-clamp-2" style={{ color: colors.mutedForeground }}>
                  {theme.visualMood}
                </p>

                {/* Color Swatch Circles */}
                <div className="flex items-center gap-1.5 pt-1">
                  <div
                    className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: colors.background }}
                    title="Background"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: colors.surface }}
                    title="Surface"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: colors.primary }}
                    title="Primary"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: colors.accent }}
                    title="Accent"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: colors.foreground }}
                    title="Foreground"
                  />
                </div>

                {/* Typography note */}
                <div
                  className="text-[11px] font-mono border-t pt-2 flex items-center justify-between"
                  style={{ borderColor: colors.border, color: colors.mutedForeground }}
                >
                  <span className="truncate">{theme.headingFont.replace(/['",]/g, '')}</span>
                  <span className="text-[10px] opacity-80">{theme.radius}</span>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
