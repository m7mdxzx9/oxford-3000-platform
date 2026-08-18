'use client';

import * as React from 'react';
import { Trophy, HelpCircle, Volume2, CheckCircle2, XCircle, RotateCcw, Zap } from 'lucide-react';
import { OXFORD_DATASET } from '@/data/oxfordDataset';
import { useStore } from '@/lib/store';
import { AudioEngineService } from '@/features/audio-speech/services/audioService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export function GameHub() {
  const [activeTab, setActiveTab] = React.useState('quiz');
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = React.useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = React.useState(0);

  const addXp = useStore((state) => state.addXp);
  const audioRate = useStore((state) => state.audioPlaybackRate);

  // Generate 10 random questions
  const questions = React.useMemo(() => {
    const shuffled = [...OXFORD_DATASET].sort(() => 0.5 - Math.random()).slice(0, 10);
    return shuffled.map((item) => {
      // 3 wrong distractors
      const distractors = [...OXFORD_DATASET]
        .filter((w) => w.id !== item.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((d) => d.arabic);

      const options = [...distractors, item.arabic].sort(() => 0.5 - Math.random());
      return {
        word: item.word,
        ipa: item.ipa,
        cefr: item.cefr,
        correctArabic: item.arabic,
        example: item.example,
        options,
      };
    });
  }, [currentQuizIndex]);

  const currentQ = questions[currentQuizIndex % questions.length];

  const handleSelectOption = (opt: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(opt);
    setIsAnswerSubmitted(true);

    if (opt === currentQ.correctArabic) {
      setScore((s) => s + 10);
      setStreak((st) => st + 1);
      addXp(25);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setCurrentQuizIndex((idx) => idx + 1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Score & Streak Header */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center border-border bg-surface">
          <p className="text-xs text-muted-foreground font-semibold">Current Score</p>
          <p className="text-2xl font-bold text-primary font-heading">{score} pts</p>
        </Card>
        <Card className="p-4 text-center border-border bg-surface">
          <p className="text-xs text-muted-foreground font-semibold">Streak</p>
          <p className="text-2xl font-bold text-amber-500 font-heading flex items-center justify-center gap-1">
            <Zap className="h-5 w-5 fill-current" />
            {streak}
          </p>
        </Card>
        <Card className="p-4 text-center border-border bg-surface">
          <p className="text-xs text-muted-foreground font-semibold">Question</p>
          <p className="text-2xl font-bold text-foreground font-heading">
            {(currentQuizIndex % questions.length) + 1} / {questions.length}
          </p>
        </Card>
      </div>

      {/* Quiz Card */}
      <Card className="border-border bg-surface shadow-md">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <Badge variant="a2">{currentQ.cefr}</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => AudioEngineService.playWord(currentQ.word, audioRate)}
              className="gap-2 text-xs"
            >
              <Volume2 className="h-4 w-4" /> Listen
            </Button>
          </div>
          <div className="text-center pt-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Select the correct Arabic meaning:
            </p>
            <h2 className="text-3xl font-extrabold font-heading text-foreground ltr-isolate">
              {currentQ.word}
            </h2>
            <p className="text-sm font-mono text-muted-foreground ltr-isolate">{currentQ.ipa}</p>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQ.correctArabic;

              let btnStyle = 'border-border bg-surface hover:bg-muted/60 text-foreground';
              if (isAnswerSubmitted) {
                if (isCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold';
                } else if (isSelected) {
                  btnStyle = 'border-red-500 bg-red-500/15 text-red-700 dark:text-red-300 font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswerSubmitted}
                  className={cn(
                    'p-4 rounded-xl border text-center transition-all cursor-pointer text-base rtl-text flex items-center justify-between',
                    btnStyle
                  )}
                >
                  <span className="flex-1 text-center font-medium">{opt}</span>
                  {isAnswerSubmitted && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </button>
              );
            })}
          </div>

          {isAnswerSubmitted && (
            <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
              <p className="text-xs text-muted-foreground italic ltr-isolate">
                Example: "{currentQ.example}"
              </p>
              <Button onClick={handleNextQuestion} className="w-full sm:w-auto">
                Next Word →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
