'use client';

import * as React from 'react';
import { BookOpen, Sparkles, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-surface/50 py-8 mt-16 transition-colors">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">Oxford 3000™ Enterprise Lexicon Platform</span>
          <span>• CEFR A1 to B2 Complete Framework</span>
        </div>

        <p className="flex items-center gap-1">
          Designed with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> for English mastery
        </p>
      </div>
    </footer>
  );
}
