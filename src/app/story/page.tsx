'use client';

import * as React from 'react';
import { Header } from '@/components/shared/Header';
import { StorytellerStudio } from '@/features/storyteller/components/StorytellerStudio';
import { Sparkles, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StoryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPath="/story" />

      <main className="container mx-auto px-4 py-8 flex-1 space-y-8">
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="accent" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              <span>Generative Context Engine</span>
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-foreground">
            AI Storyteller & Sentence Generator
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Choose up to 5 target vocabulary words to weave into an engaging, level-appropriate story
            with sentence audio pronunciation and speech practice.
          </p>
        </div>

        {/* Story Studio */}
        <StorytellerStudio />
      </main>
    </div>
  );
}
