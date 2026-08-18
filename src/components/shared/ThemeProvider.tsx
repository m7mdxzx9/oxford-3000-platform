'use client';

import * as React from 'react';
import { useStore } from '@/lib/store';
import { THEMES } from '@/styles/themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useStore((state) => state.themeId);
  const isDarkMode = useStore((state) => state.isDarkMode);
  const queryClient = getQueryClient();

  React.useEffect(() => {
    const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
    const colors = isDarkMode ? theme.dark : theme.light;
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Helper to convert hex to rgb triplet
    const hexToRgb = (hex: string): string => {
      const cleanHex = hex.replace('#', '');
      if (cleanHex.length === 6) {
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        return `${r} ${g} ${b}`;
      }
      return '255 255 255';
    };

    root.style.setProperty('--background', hexToRgb(colors.background));
    root.style.setProperty('--surface', hexToRgb(colors.surface));
    root.style.setProperty('--foreground', hexToRgb(colors.foreground));
    root.style.setProperty('--primary', hexToRgb(colors.primary));
    root.style.setProperty('--primary-foreground', hexToRgb(colors.primaryForeground));
    root.style.setProperty('--accent', hexToRgb(colors.accent));
    root.style.setProperty('--accent-foreground', hexToRgb(colors.accentForeground));
    root.style.setProperty('--muted', hexToRgb(colors.muted));
    root.style.setProperty('--muted-foreground', hexToRgb(colors.mutedForeground));
    root.style.setProperty('--border', hexToRgb(colors.border));
    root.style.setProperty('--ring', hexToRgb(colors.ring));
    root.style.setProperty('--radius', theme.radius);
    root.style.setProperty('--font-heading', theme.headingFont);
    root.style.setProperty('--font-body', theme.bodyFont);
  }, [themeId, isDarkMode]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
