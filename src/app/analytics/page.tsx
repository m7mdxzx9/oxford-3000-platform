'use client';

import * as React from 'react';
import { Header } from '@/components/shared/Header';
import { AnalyticsDashboard } from '@/features/analytics/components/AnalyticsDashboard';
import { BarChart3, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPath="/analytics" />

      <main className="container mx-auto px-4 py-8 flex-1 space-y-8">
        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="accent" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              <span>Comprehensive CEFR Metrics</span>
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-foreground">
            Progress & Mastery Analytics
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Track your mastery progression across A1, A2, B1, and B2 CEFR proficiency tiers, active study streaks, and XP points.
          </p>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard />
      </main>
    </div>
  );
}
