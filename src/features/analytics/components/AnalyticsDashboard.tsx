'use client';

import * as React from 'react';
import { Trophy, Zap, Star, CheckCircle, Award, Target, Flame, TrendingUp } from 'lucide-react';
import { OXFORD_DATASET, CEFR_COUNTS } from '@/data/oxfordDataset';
import { useStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AnalyticsDashboard() {
  const masteredWordIds = useStore((state) => state.masteredWordIds);
  const favoriteWordIds = useStore((state) => state.favoriteWordIds);
  const totalXp = useStore((state) => state.totalXp);
  const currentStreak = useStore((state) => state.currentStreakDays);

  const totalWords = OXFORD_DATASET.length;
  const masteredCount = masteredWordIds.length;
  const overallPercentage = Math.round((masteredCount / totalWords) * 100);

  // CEFR breakdown
  const cefrBreakdown = React.useMemo(() => {
    const levels = ['A1', 'A2', 'B1', 'B2'] as const;
    return levels.map((lvl) => {
      const wordsInLevel = OXFORD_DATASET.filter((w) => w.cefr === lvl);
      const masteredInLevel = wordsInLevel.filter((w) => masteredWordIds.includes(w.id)).length;
      const pct = Math.round((masteredInLevel / wordsInLevel.length) * 100);
      return {
        level: lvl,
        total: wordsInLevel.length,
        mastered: masteredInLevel,
        percentage: pct,
      };
    });
  }, [masteredWordIds]);

  const userTier =
    totalXp >= 1500
      ? 'Oxford Grand Scholar'
      : totalXp >= 750
      ? 'Fluency Practitioner'
      : totalXp >= 250
      ? 'Dedicated Lexicist'
      : 'Novice Explorer';

  return (
    <div className="space-y-8">
      {/* Top Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-border bg-surface shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Mastery</span>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-foreground">{masteredCount}</span>
            <span className="text-sm text-muted-foreground">/ {totalWords} words</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(2, overallPercentage))}%` }}
            />
          </div>
        </Card>

        <Card className="p-6 border-border bg-surface shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Experience Points</span>
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-foreground">{totalXp}</span>
            <span className="text-sm text-muted-foreground">XP</span>
          </div>
          <p className="text-xs text-primary font-medium">{userTier}</p>
        </Card>

        <Card className="p-6 border-border bg-surface shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Streak</span>
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-foreground">{currentStreak}</span>
            <span className="text-sm text-muted-foreground">Days</span>
          </div>
          <p className="text-xs text-muted-foreground">Daily consecutive practice</p>
        </Card>

        <Card className="p-6 border-border bg-surface shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Starred Lexicon</span>
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-foreground">
              {favoriteWordIds.length}
            </span>
            <span className="text-sm text-muted-foreground">Terms</span>
          </div>
          <p className="text-xs text-muted-foreground">Flagged for targeted review</p>
        </Card>
      </div>

      {/* CEFR Level Mastery Breakdown */}
      <Card className="border-border bg-surface shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span>CEFR Framework Mastery Breakdown (A1 to B2)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cefrBreakdown.map((item) => (
              <div
                key={item.level}
                className="p-5 rounded-xl border border-border/80 bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        item.level === 'A1'
                          ? 'a1'
                          : item.level === 'A2'
                          ? 'a2'
                          : item.level === 'B1'
                          ? 'b1'
                          : 'b2'
                      }
                      className="text-xs"
                    >
                      {item.level}
                    </Badge>
                    <span className="font-bold text-sm text-foreground">
                      {item.level === 'A1'
                        ? 'Beginner Essential'
                        : item.level === 'A2'
                        ? 'Elementary Fluency'
                        : item.level === 'B1'
                        ? 'Intermediate Core'
                        : 'Upper-Intermediate Precision'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    {item.mastered} / {item.total} ({item.percentage}%)
                  </span>
                </div>

                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-500 rounded-full',
                      item.level === 'A1'
                        ? 'bg-emerald-500'
                        : item.level === 'A2'
                        ? 'bg-sky-500'
                        : item.level === 'B1'
                        ? 'bg-amber-500'
                        : 'bg-purple-500'
                    )}
                    style={{ width: `${Math.min(100, Math.max(1, item.percentage))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
