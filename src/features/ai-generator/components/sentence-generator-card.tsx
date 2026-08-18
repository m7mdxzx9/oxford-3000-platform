'use client';

import * as React from 'react';
import {
  Sparkles,
  RefreshCw,
  Settings,
  Key,
  Copy,
  Check,
  Volume2,
  Languages,
  BookOpen,
  Zap,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAiSentence } from '../hooks/use-ai-sentence';
import { useApiKey } from '../hooks/use-api-key';
import { ApiKeySettingsDialog } from './api-key-settings-dialog';
import { CefrDifficulty } from '../types';
import { AudioEngineService } from '@/features/audio-speech/services/audioService';
import { OXFORD_DATASET } from '@/data/oxfordDataset';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface SentenceGeneratorCardProps {
  initialWord?: string;
  initialCefr?: CefrDifficulty;
  className?: string;
}

export function SentenceGeneratorCard({
  initialWord = 'opportunity',
  initialCefr = 'B2',
  className,
}: SentenceGeneratorCardProps) {
  const [word, setWord] = React.useState(initialWord);
  const [cefr, setCefr] = React.useState<CefrDifficulty>(initialCefr);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [showArabic, setShowArabic] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  const { result, isLoading, error, generateSentence } = useAiSentence();
  const { isConfigured } = useApiKey();
  const audioRate = useStore((state) => state.audioPlaybackRate);

  // Generate on initial mount
  React.useEffect(() => {
    generateSentence({ word, cefr });
  }, []);

  const handleGenerate = () => {
    if (!word.trim()) return;
    generateSentence({ word: word.trim(), cefr });
  };

  const handleRandomizeWord = () => {
    const randomItem = OXFORD_DATASET[Math.floor(Math.random() * OXFORD_DATASET.length)];
    setWord(randomItem.word);
    setCefr((randomItem.cefr as CefrDifficulty) || 'B1');
    generateSentence({ word: randomItem.word, cefr: (randomItem.cefr as CefrDifficulty) || 'B1' });
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.english}\n${result.arabic}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cefrLevels: CefrDifficulty[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <>
      <div
        className={cn(
          'archetype-card p-6 sm:p-8 bg-surface border shadow-md space-y-6',
          className
        )}
      >
        {/* Card Header & Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-foreground flex items-center gap-2">
                <span>مولد الجمل الذكي</span>
                <Badge variant="accent" className="archetype-badge text-[10px]">
                  AI Engine
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">
                توليد جمل سياقية احترافية بدقة لغوية توافق مستويات الإطار الأوروبي (A1–C2).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRandomizeWord}
              className="archetype-btn text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>كلمة عشوائية</span>
            </Button>

            <Button
              variant={isConfigured ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="archetype-btn text-xs gap-1.5"
              title="إعدادات مفتاح الذكاء الاصطناعي"
            >
              <Key className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{isConfigured ? 'API Key نشط' : 'إعدادات API'}</span>
            </Button>
          </div>
        </div>

        {/* Input Parameters: Word & CEFR Level Segmented Control */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Word Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              الكلمة المستهدفة (Target Word):
            </label>
            <Input
              type="text"
              placeholder="e.g. achieve, challenge, structure..."
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="font-bold text-sm ltr-isolate"
            />
          </div>

          {/* CEFR Level Segmented Control (2 cols) */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>مستوى الصعوبة اللغوية (CEFR Difficulty):</span>
              <span className="text-[11px] font-mono text-primary font-bold">{cefr} Level</span>
            </label>

            <div className="grid grid-cols-6 gap-1 bg-muted/60 p-1 rounded-xl">
              {cefrLevels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setCefr(lvl);
                    generateSentence({ word: word.trim(), cefr: lvl });
                  }}
                  className={cn(
                    'archetype-badge py-1.5 text-xs font-bold transition-all text-center cursor-pointer',
                    cefr === lvl
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Primary Generation Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !word.trim()}
            className="archetype-btn w-full sm:w-auto h-11 px-6 text-sm font-bold gap-2"
          >
            <Sparkles className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            <span>{isLoading ? 'جاري توليد الجملة...' : 'توليد جملة متقدمة (+35 XP)'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => generateSentence({ word: word.trim(), cefr })}
            disabled={isLoading || !word.trim()}
            className="archetype-btn w-full sm:w-auto h-11 px-5 text-sm gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            <span>تبديل الجملة بذكاء اصطناعي</span>
          </Button>
        </div>

        {/* Generated Result Container */}
        {isLoading ? (
          <div className="p-6 rounded-2xl border border-border/80 bg-muted/20 space-y-4 animate-pulse">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-6 w-3/4 rounded-md" />
          </div>
        ) : result ? (
          <div className="archetype-card p-6 bg-muted/25 border space-y-4">
            {/* Top Info Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    result.cefr === 'A1'
                      ? 'a1'
                      : result.cefr === 'A2'
                      ? 'a2'
                      : result.cefr === 'B1'
                      ? 'b1'
                      : 'b2'
                  }
                  className="archetype-badge font-mono text-xs"
                >
                  CEFR {result.cefr}
                </Badge>
                <span className="text-xs font-bold text-primary">Target: "{result.word}"</span>
              </div>

              {/* Card Micro-Actions */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => AudioEngineService.playWord(result.english, audioRate)}
                  title="استماع للجملة بالصوت الطبيعي"
                  className="h-8 w-8 text-primary"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowArabic(!showArabic)}
                  title="إظهار / إخفاء الترجمة العربية"
                  className="h-8 w-8"
                >
                  <Languages className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  title="نسخ الجملة والترجمة"
                  className="h-8 w-8"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* English Sentence Display */}
            <p className="text-lg sm:text-xl font-bold font-heading text-foreground ltr-isolate leading-relaxed">
              {result.english}
            </p>

            {/* Arabic Translation */}
            {showArabic && (
              <p className="text-sm sm:text-base font-medium text-muted-foreground rtl-text border-t border-border/50 pt-3 leading-relaxed">
                {result.arabic}
              </p>
            )}

            {/* Linguistic / Grammar Note */}
            {result.grammarNote && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground flex items-start gap-2">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>
                  <span className="font-bold text-primary">الملاحظة النحوية: </span>
                  {result.grammarNote}
                </p>
              </div>
            )}
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs">
            {error}
          </div>
        ) : null}
      </div>

      {/* API Key Configuration Modal */}
      <ApiKeySettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
