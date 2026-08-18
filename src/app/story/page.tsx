'use client';

import * as React from 'react';
import { Header } from '@/components/shared/Header';
import { SentenceGeneratorCard } from '@/features/ai-generator/components/sentence-generator-card';
import { StorytellerStudio } from '@/features/storyteller/components/StorytellerStudio';
import { Sparkles, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function StoryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPath="/story" />

      <main className="container mx-auto px-4 py-8 flex-1 space-y-8">
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="accent" className="archetype-badge gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              <span>Generative Context & Linguistics Engine</span>
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-foreground">
            استوديو الذكاء الاصطناعي لتوليد الجمل والقصص
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            قم بتوليد جمل سياقية ذكية متدرجة الصعوبة (من A1 حتى C2) مع إمكانية إدارة مفاتيح API الخاصة بك، أو بناء قصص كاملة مترابطة.
          </p>
        </div>

        {/* Studio Tabs: Sentence Generator vs Story Studio */}
        <Tabs defaultValue="sentence" className="space-y-6">
          <TabsList className="archetype-card p-1 bg-muted/60">
            <TabsTrigger value="sentence" className="archetype-btn text-xs font-bold gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>مولد الجمل المستهدفة (A1–C2)</span>
            </TabsTrigger>
            <TabsTrigger value="story" className="archetype-btn text-xs font-bold gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>استوديو توليد القصص المتكاملة</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sentence" className="space-y-4">
            <SentenceGeneratorCard initialWord="opportunity" initialCefr="B2" />
          </TabsContent>

          <TabsContent value="story" className="space-y-4">
            <StorytellerStudio />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
