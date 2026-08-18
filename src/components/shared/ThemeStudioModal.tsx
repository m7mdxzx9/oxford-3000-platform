'use client';

import * as React from 'react';
import { Palette, Check, Moon, Sun, Sparkles, Layers, Box, Compass } from 'lucide-react';
import { THEMES, ThemeConfig, DesignArchetype } from '@/styles/themes';
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
  const [activeArchetypeTab, setActiveArchetypeTab] = React.useState<string>('all');

  const archetypesList: { id: string; label: string; desc: string }[] = [
    { id: 'all', label: 'جميع النماذج (All 25)', desc: 'استعراض كافة النماذج البصرية' },
    { id: 'neo-brutalism', label: 'Neo-Brutalism Pop', desc: 'حدود بارزة، ظلال صلبة ساقطة، أزرار عريضة بفيزياء ضغط' },
    { id: 'swiss', label: 'Swiss Minimalist', desc: 'شبكة سويسرية حادة، زوايا قائمة 0px، تباين ونقاء معلوماتي' },
    { id: 'organic-terracotta', label: 'Organic Terracotta', desc: 'انحناءات عضوية مستديرة 24px، وظلال فخارية ناعمة' },
    { id: 'cyber-terminal', label: 'Cyber Terminal HUD', desc: 'واجهة سيبرانية داكنة بإضاءات نيون دقيقة' },
    { id: 'oxford-heritage', label: 'Oxford Heritage', desc: 'أناقة أرشيفية أكاديمية بخطوط كلاسيكية فاخرة' },
  ];

  const filteredThemes = React.useMemo(() => {
    if (activeArchetypeTab === 'all') return THEMES;
    return THEMES.filter((t) => t.archetype === activeArchetypeTab);
  }, [activeArchetypeTab]);

  const handleSelectTheme = (theme: ThemeConfig) => {
    setThemeId(theme.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 font-heading">
                <Box className="h-6 w-6 text-primary" />
                <span>استوديو التحول المعماري الشامل (25 Architectural Archetypes)</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                تغيير هندسي عميق يشمل بنية الحواف، والظلال الساقطة، واستجابة الأزرار، والخطوط الطباعية.
              </DialogDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="gap-2 shrink-0 mr-6"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
              <span>{isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Archetype Filter Tabs */}
        <div className="flex gap-2 border-b border-border pb-3 my-3 overflow-x-auto">
          {archetypesList.map((arch) => (
            <button
              key={arch.id}
              onClick={() => setActiveArchetypeTab(arch.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer',
                activeArchetypeTab === arch.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground'
              )}
            >
              {arch.label}
            </button>
          ))}
        </div>

        {/* Grid of Archetypes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredThemes.map((theme) => {
            const isSelected = currentThemeId === theme.id;
            const colors = isDarkMode ? theme.dark : theme.light;

            return (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme)}
                className={cn(
                  'p-5 text-left transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between space-y-3 group',
                  isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                )}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: theme.radius,
                  border: theme.borderStyle === '2.5px solid' ? '2.5px solid' : '1px solid',
                  boxShadow:
                    theme.archetype === 'neo-brutalism'
                      ? '4px 4px 0px 0px rgba(0,0,0,1)'
                      : theme.archetype === 'organic-terracotta'
                      ? '0 10px 25px -4px rgba(200,109,81,0.15)'
                      : 'none',
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 w-full">
                  <div>
                    <h4
                      className="font-bold text-sm leading-tight"
                      style={{ color: colors.foreground }}
                    >
                      {theme.name}
                    </h4>
                    <span
                      className="text-[10px] uppercase font-mono tracking-wider font-bold"
                      style={{ color: colors.primary }}
                    >
                      {theme.archetype}
                    </span>
                  </div>
                  {isSelected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0"
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

                {/* Color Swatch Matrix */}
                <div className="flex items-center gap-1.5 pt-1">
                  <div
                    className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: colors.background }}
                    title="خلفية الصفحة"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: colors.surface }}
                    title="سطح البطاقة"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: colors.primary }}
                    title="اللون الأساسي"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: colors.accent }}
                    title="لون التمييز"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: colors.foreground }}
                    title="لون النصوص"
                  />
                </div>

                {/* Micro Spec */}
                <div
                  className="text-[10px] font-mono border-t pt-2 flex items-center justify-between w-full"
                  style={{ borderColor: colors.border, color: colors.mutedForeground }}
                >
                  <span className="truncate">{theme.headingFont.replace(/['",]/g, '')}</span>
                  <span className="font-bold">{theme.radius}</span>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
