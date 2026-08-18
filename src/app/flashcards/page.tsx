'use client';

import * as React from 'react';
import { Header } from '@/components/shared/Header';
import { FlashcardTrainer } from '@/features/flashcards-srs/components/FlashcardTrainer';
import { Layers, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function FlashcardsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPath="/flashcards" />

      <main className="container mx-auto px-4 py-8 flex-1 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="accent" className="gap-1 text-xs">
            <Sparkles className="h-3 w-3" />
            <span>Spaced Repetition System (SRS)</span>
          </Badge>
          <h1 className="text-3xl font-extrabold font-heading text-foreground">
            3D Memory Flashcard Studio
          </h1>
          <p className="text-sm text-muted-foreground">
            Optimize long-term vocabulary retention using the Leitner spaced repetition model. Flip
            cards to test active recall.
          </p>
        </div>

        {/* 3D Flashcards */}
        <FlashcardTrainer />
      </main>
    </div>
  );
}
