'use client';

import * as React from 'react';
import { Header } from '@/components/shared/Header';
import { LexiconCatalog } from '@/features/lexicon/components/LexiconCatalog';
import { Sparkles, Trophy, Zap, BookOpen } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const masteredCount = useStore((state) => state.masteredWordIds.length);
  const totalXp = useStore((state) => state.totalXp);
  const streak = useStore((state) => state.currentStreakDays);

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPath="/" />

      <main className="container mx-auto px-4 py-8 flex-1 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-surface/60 backdrop-blur-xl p-8 sm:p-10 shadow-sm">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="accent" className="gap-1 px-3 py-1 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Oxford 3000™ Complete Lexicon</span>
              </Badge>
              <span className="text-xs font-mono font-semibold text-muted-foreground">
                3,002 Canonical Terms (A1–B2)
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-heading tracking-tight text-foreground leading-[1.15]">
              Master English Vocabulary with High-Fidelity AI & Audio
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Explore the entire Oxford 3000 CEFR dataset with dual-engine pronunciation, phonetic
              syllables, Arabic contextual translations, and real-time speech evaluation.
            </p>

            {/* Quick Hero Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 text-xs font-bold">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>3,002 Headwords</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 text-xs font-bold">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>{masteredCount} Mastered</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 text-xs font-bold">
                <Zap className="h-4 w-4 text-orange-500" />
                <span>{streak} Day Streak</span>
              </div>
            </div>
          </div>
        </section>

        {/* Lexicon Catalog Grid */}
        <section className="space-y-4">
          <LexiconCatalog />
        </section>
      </main>
    </div>
  );
}
