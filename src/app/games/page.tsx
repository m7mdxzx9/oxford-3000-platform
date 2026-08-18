'use client';

import * as React from 'react';
import { Header } from '@/components/shared/Header';
import { GameHub } from '@/features/games/components/GameHub';
import { Gamepad2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function GamesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPath="/games" />

      <main className="container mx-auto px-4 py-8 flex-1 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="accent" className="gap-1 text-xs">
            <Sparkles className="h-3 w-3" />
            <span>Gamified Active Recall</span>
          </Badge>
          <h1 className="text-3xl font-extrabold font-heading text-foreground">
            Vocabulary Quizzes & Practice Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Challenge yourself with speed quizzes, sound-alike phonetic drills, and earn XP to level
            up your lexicon rank.
          </p>
        </div>

        {/* Game Hub */}
        <GameHub />
      </main>
    </div>
  );
}
