'use client';

import * as React from 'react';
import { RotateCw, Volume2, Star, CheckCircle, Sparkles, Trophy } from 'lucide-react';
import { OXFORD_DATASET } from '@/data/oxfordDataset';
import { LexiconItem } from '@/features/lexicon/types';
import { SrsReviewRating } from '../types';
import { useStore } from '@/lib/store';
import { AudioEngineService } from '@/features/audio-speech/services/audioService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function FlashcardTrainer() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [selectedCefr, setSelectedCefr] = React.useState<'ALL' | 'A1' | 'A2' | 'B1' | 'B2'>('ALL');

  const masteredWordIds = useStore((state) => state.masteredWordIds);
  const favoriteWordIds = useStore((state) => state.favoriteWordIds);
  const toggleMastered = useStore((state) => state.toggleMastered);
  const toggleFavorite = useStore((state) => state.toggleFavorite);
  const addXp = useStore((state) => state.addXp);
  const audioRate = useStore((state) => state.audioPlaybackRate);

  const activeDeck = React.useMemo(() => {
    return OXFORD_DATASET.filter((item) => {
      if (selectedCefr !== 'ALL' && item.cefr !== selectedCefr) return false;
      return true;
    });
  }, [selectedCefr]);

  const currentCard: LexiconItem = activeDeck[currentIndex] || activeDeck[0];

  const handleNextCard = (rating?: SrsReviewRating) => {
    setIsFlipped(false);
    if (rating) {
      if (rating === 'easy') addXp(20);
      else if (rating === 'good') addXp(15);
      else if (rating === 'hard') addXp(5);
    }
    setCurrentIndex((prev) => (prev + 1) % activeDeck.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + activeDeck.length) % activeDeck.length);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* CEFR Level Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 bg-muted/60 p-1 rounded-xl">
          {(['ALL', 'A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setSelectedCefr(lvl);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-bold transition-all',
                selectedCefr === lvl
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {lvl}
            </button>
          ))}
        </div>

        <span className="text-xs font-medium text-muted-foreground">
          Card {currentIndex + 1} of {activeDeck.length}
        </span>
      </div>

      {/* 3D Flip Card */}
      <div
        className="perspective-1000 w-full h-[360px] cursor-pointer select-none"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={cn(
            'relative w-full h-full duration-500 transform-style-3d transition-transform rounded-2xl shadow-xl border border-border bg-surface',
            isFlipped && 'rotate-y-180'
          )}
        >
          {/* Card Front (English Prompt) */}
          <div className="absolute inset-0 backface-hidden p-8 flex flex-col justify-between rounded-2xl bg-surface">
            <div className="flex items-center justify-between">
              <Badge
                variant={
                  currentCard.cefr === 'A1'
                    ? 'a1'
                    : currentCard.cefr === 'A2'
                    ? 'a2'
                    : currentCard.cefr === 'B1'
                    ? 'b1'
                    : 'b2'
                }
              >
                {currentCard.cefr} • {currentCard.pos}
              </Badge>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => toggleFavorite(currentCard.id)}
                  className={cn(
                    'p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors',
                    favoriteWordIds.includes(currentCard.id) && 'text-amber-500'
                  )}
                >
                  <Star className={cn('h-5 w-5', favoriteWordIds.includes(currentCard.id) && 'fill-current')} />
                </button>
              </div>
            </div>

            <div className="text-center space-y-3">
              <h2 className="text-4xl font-extrabold font-heading text-foreground tracking-tight ltr-isolate">
                {currentCard.word}
              </h2>
              <p className="text-sm font-mono text-muted-foreground ltr-isolate">{currentCard.ipa}</p>

              <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => AudioEngineService.playWord(currentCard.word, audioRate)}
                  className="gap-2 text-xs"
                >
                  <Volume2 className="h-4 w-4" /> Listen Audio
                </Button>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <RotateCw className="h-3.5 w-3.5" /> Tap card to reveal Arabic meaning & context
            </p>
          </div>

          {/* Card Back (Arabic Definition & Example) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 p-8 flex flex-col justify-between rounded-2xl bg-muted/40 border border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Meaning & Context</span>
              <Badge variant="default">{currentCard.word}</Badge>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold rtl-text text-foreground leading-relaxed">
                {currentCard.arabic}
              </h3>
              <div className="p-3 rounded-xl bg-surface border border-border text-xs text-muted-foreground italic ltr-isolate">
                "{currentCard.example}"
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Rate your recall ease below to adjust repetition intervals
            </p>
          </div>
        </div>
      </div>

      {/* SRS Rating Control Buttons */}
      {isFlipped ? (
        <div className="grid grid-cols-4 gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => handleNextCard('again')}
            className="border-red-500/40 text-red-600 hover:bg-red-500/10 flex flex-col h-14"
          >
            <span className="font-bold text-xs">Again</span>
            <span className="text-[10px] text-muted-foreground">&lt;1 min</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleNextCard('hard')}
            className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10 flex flex-col h-14"
          >
            <span className="font-bold text-xs">Hard</span>
            <span className="text-[10px] text-muted-foreground">1 day</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleNextCard('good')}
            className="border-primary/40 text-primary hover:bg-primary/10 flex flex-col h-14"
          >
            <span className="font-bold text-xs">Good</span>
            <span className="text-[10px] text-muted-foreground">3 days</span>
          </Button>
          <Button
            variant="default"
            onClick={() => {
              toggleMastered(currentCard.id);
              handleNextCard('easy');
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex flex-col h-14"
          >
            <span className="font-bold text-xs">Easy (Master)</span>
            <span className="text-[10px] text-white/80">7 days</span>
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline" onClick={handlePrevCard} className="flex-1">
            Previous
          </Button>
          <Button variant="default" onClick={() => setIsFlipped(true)} className="flex-1">
            Flip Card
          </Button>
          <Button variant="outline" onClick={() => handleNextCard()} className="flex-1">
            Skip
          </Button>
        </div>
      )}
    </div>
  );
}
