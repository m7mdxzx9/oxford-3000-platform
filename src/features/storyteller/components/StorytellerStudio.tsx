'use client';

import * as React from 'react';
import { Sparkles, BookOpen, Volume2, Mic, Play, CheckCircle2, RotateCcw } from 'lucide-react';
import { OXFORD_DATASET } from '@/data/oxfordDataset';
import { StoryGenre, GeneratedStory, StorySentence } from '../types';
import { generateAiStory } from '@/lib/gemini';
import { useStore } from '@/lib/store';
import { AudioEngineService } from '@/features/audio-speech/services/audioService';
import { SpeechRecordingModal } from '@/features/audio-speech/components/SpeechRecordingModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StorytellerStudio() {
  const [selectedWords, setSelectedWords] = React.useState<string[]>(['journey', 'discover', 'knowledge']);
  const [cefr, setCefr] = React.useState<'A1' | 'A2' | 'B1' | 'B2'>('B1');
  const [genre, setGenre] = React.useState<StoryGenre>('adventure');
  const [length, setLength] = React.useState<'short' | 'medium' | 'long'>('medium');
  const [story, setStory] = React.useState<GeneratedStory | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [activeSpeechSentence, setActiveSpeechSentence] = React.useState<StorySentence | null>(null);

  const geminiApiKey = useStore((state) => state.geminiApiKey);
  const addXp = useStore((state) => state.addXp);
  const audioRate = useStore((state) => state.audioPlaybackRate);

  const handleGenerate = async () => {
    if (selectedWords.length === 0 || isGenerating) return;
    setIsGenerating(true);
    try {
      const result = await generateAiStory(
        {
          targetWords: selectedWords,
          cefr,
          genre,
          length,
        },
        geminiApiKey
      );
      setStory(result);
      addXp(40);
    } catch (e) {
      console.error('Story generation failed:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRandomizeWords = () => {
    const randomSubset = [...OXFORD_DATASET]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((w) => w.word);
    setSelectedWords(randomSubset);
  };

  return (
    <div className="space-y-8">
      {/* Configuration Suite */}
      <Card className="border-border bg-surface shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Story & Sentence Architecture Studio
            </span>
            <Button variant="outline" size="sm" onClick={handleRandomizeWords} className="text-xs">
              Randomize Words
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Words Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Selected Target Words ({selectedWords.length}/5):
            </label>
            <div className="flex flex-wrap gap-2 items-center">
              {selectedWords.map((word, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="px-3 py-1 text-sm font-semibold flex items-center gap-2"
                >
                  <span>{word}</span>
                  <button
                    onClick={() => setSelectedWords(selectedWords.filter((w) => w !== word))}
                    className="hover:text-red-500 font-bold ml-1"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {selectedWords.length < 5 && (
                <button
                  onClick={() => {
                    const random = OXFORD_DATASET[Math.floor(Math.random() * OXFORD_DATASET.length)].word;
                    if (!selectedWords.includes(random)) {
                      setSelectedWords([...selectedWords, random]);
                    }
                  }}
                  className="text-xs text-primary font-bold px-2 py-1 border border-dashed border-primary/40 rounded-md hover:bg-primary/5"
                >
                  + Add Word
                </button>
              )}
            </div>
          </div>

          {/* Controls Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* CEFR Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Target CEFR</label>
              <div className="flex gap-1.5">
                {(['A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setCefr(lvl)}
                    className={cn(
                      'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all',
                      cefr === lvl
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Genre / Style</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as StoryGenre)}
                className="w-full h-9 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-foreground"
              >
                <option value="adventure">Adventure</option>
                <option value="mystery">Mystery</option>
                <option value="sci-fi">Science Fiction</option>
                <option value="daily-life">Daily Life</option>
                <option value="business">Business & Tech</option>
                <option value="fantasy">Fantasy</option>
              </select>
            </div>

            {/* Length */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Story Length</label>
              <div className="flex gap-1.5">
                {(['short', 'medium', 'long'] as const).map((len) => (
                  <button
                    key={len}
                    onClick={() => setLength(len)}
                    className={cn(
                      'flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all',
                      length === len
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    )}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedWords.length === 0}
            className="w-full h-11 text-sm font-bold gap-2 shadow-md"
          >
            <Sparkles className={cn('h-4 w-4', isGenerating && 'animate-spin')} />
            {isGenerating ? 'Synthesizing Educational Story...' : 'Generate Interactive Story (+40 XP)'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Story Display */}
      {story && (
        <Card className="border-border bg-surface/80 backdrop-blur-md shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={story.cefr === 'A1' ? 'a1' : story.cefr === 'A2' ? 'a2' : story.cefr === 'B1' ? 'b1' : 'b2'}>
                  {story.cefr}
                </Badge>
                <span className="text-xs font-semibold text-muted-foreground capitalize">
                  {story.genre} Story
                </span>
              </div>
              <h2 className="text-2xl font-bold font-heading text-foreground">{story.title}</h2>
              <p className="text-sm font-medium text-muted-foreground rtl-text">{story.arabicTitle}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const fullText = story.sentences.map((s) => s.english).join(' ');
                AudioEngineService.playWord(fullText, audioRate);
              }}
              className="gap-2"
            >
              <Volume2 className="h-4 w-4" /> Listen Full Story
            </Button>
          </div>

          <CardContent className="p-6 space-y-6">
            {story.sentences.map((sent, idx) => (
              <div
                key={sent.id}
                className="p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-base font-medium text-foreground ltr-isolate leading-relaxed">
                      {sent.english}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => AudioEngineService.playWord(sent.english, audioRate)}
                      className="p-1.5 rounded-lg bg-surface border border-border hover:text-primary transition-colors"
                      title="Listen sentence audio"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setActiveSpeechSentence(sent)}
                      className="p-1.5 rounded-lg bg-surface border border-border hover:text-primary transition-colors text-xs flex items-center gap-1"
                      title="Practice pronunciation"
                    >
                      <Mic className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground rtl-text pl-8 border-t border-border/30 pt-2">
                  {sent.arabic}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sentence Speech Evaluation Modal */}
      {activeSpeechSentence && (
        <SpeechRecordingModal
          isOpen={!!activeSpeechSentence}
          onClose={() => setActiveSpeechSentence(null)}
          targetText={activeSpeechSentence.english}
          arabicTranslation={activeSpeechSentence.arabic}
        />
      )}
    </div>
  );
}
