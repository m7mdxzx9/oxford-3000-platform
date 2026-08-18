'use client';

import * as React from 'react';
import { Header } from '@/components/shared/Header';
import { AiTutorChat } from '@/features/ai-tutor/components/AiTutorChat';
import { MessageSquare, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TutorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPath="/tutor" />

      <main className="container mx-auto px-4 py-8 flex-1 space-y-8">
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="accent" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              <span>Real-Time Roleplay Dialogues</span>
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-foreground">
            AI Persona Tutor & Pronunciation Coach
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Simulate realistic spoken English dialogues across everyday and professional scenarios.
            Get instant grammar feedback, Arabic contextual translations, and suggested vocabulary.
          </p>
        </div>

        {/* Chat Studio */}
        <AiTutorChat />
      </main>
    </div>
  );
}
