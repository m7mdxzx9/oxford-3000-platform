'use client';

import * as React from 'react';
import { Search, Volume2, Mic, Star, CheckCircle, Sparkles, Filter, BookOpen, Layers } from 'lucide-react';
import { OXFORD_DATASET, ALPHABET_LETTERS, CEFR_COUNTS } from '@/data/oxfordDataset';
import { LexiconItem, CefrLevel } from '../types';
import { useStore } from '@/lib/store';
import { AudioPlayButton } from '@/features/audio-speech/components/AudioPlayButton';
import { WordPracticeDialog } from '@/features/vocabulary-practice/components/word-practice-dialog';
import { matchesSearchQuery, extractArabicMeanings } from '@/lib/arabic-search';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function LexiconCatalog() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCefr, setSelectedCefr] = React.useState<CefrLevel>('ALL');
  const [selectedLetter, setSelectedLetter] = React.useState<string>('ALL');
  const [filterFavorites, setFilterFavorites] = React.useState(false);
  const [filterMastered, setFilterMastered] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 24;

  // Selected word for All-in-One Interactive Practice Dialog
  const [selectedPracticeWord, setSelectedPracticeWord] = React.useState<LexiconItem | null>(null);

  // Zustand state
  const masteredWordIds = useStore((state) => state.masteredWordIds);
  const favoriteWordIds = useStore((state) => state.favoriteWordIds);
  const toggleMastered = useStore((state) => state.toggleMastered);
  const toggleFavorite = useStore((state) => state.toggleFavorite);

  // Filtered dataset with Diacritic-Agnostic Deep Arabic Search
  const filteredData = React.useMemo(() => {
    return OXFORD_DATASET.filter((item) => {
      // Diacritic-agnostic deep search query matching
      if (searchQuery.trim()) {
        if (!matchesSearchQuery(item, searchQuery)) {
          return false;
        }
      }

      // CEFR level
      if (selectedCefr !== 'ALL' && item.cefr !== selectedCefr) {
        return false;
      }

      // Letter filter
      if (selectedLetter !== 'ALL') {
        const firstLetter = item.word.charAt(0).toUpperCase();
        if (firstLetter !== selectedLetter) return false;
      }

      // Favorites only
      if (filterFavorites && !favoriteWordIds.includes(item.id)) {
        return false;
      }

      // Mastered only
      if (filterMastered && !masteredWordIds.includes(item.id)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCefr, selectedLetter, filterFavorites, filterMastered, favoriteWordIds, masteredWordIds]);

  // Pagination slice
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedItems = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCefr, selectedLetter, filterFavorites, filterMastered]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="archetype-card p-6 border bg-surface/80 backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث بالعربية (مع/بدون تشكيل) أو بالإنجليزية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50 text-sm"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
            <Button
              variant={filterFavorites ? 'accent' : 'outline'}
              size="sm"
              onClick={() => setFilterFavorites(!filterFavorites)}
              className="archetype-btn gap-1.5 text-xs"
            >
              <Star className={cn('h-3.5 w-3.5', filterFavorites && 'fill-current')} />
              المفضلة ({favoriteWordIds.length})
            </Button>
            <Button
              variant={filterMastered ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterMastered(!filterMastered)}
              className="archetype-btn gap-1.5 text-xs"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              المتقنة ({masteredWordIds.length})
            </Button>
          </div>
        </div>

        {/* CEFR Level Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">
            CEFR Level:
          </span>
          {(['ALL', 'A1', 'A2', 'B1', 'B2'] as const).map((lvl) => {
            const count =
              lvl === 'ALL' ? CEFR_COUNTS.TOTAL : CEFR_COUNTS[lvl as keyof typeof CEFR_COUNTS];
            const isSelected = selectedCefr === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setSelectedCefr(lvl)}
                className={cn(
                  'archetype-badge px-3 py-1 text-xs font-bold transition-all cursor-pointer select-none',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                    : 'bg-muted text-foreground/80 hover:bg-muted/80'
                )}
              >
                {lvl} ({count})
              </button>
            );
          })}
        </div>

        {/* Alphabet Bar */}
        <div className="flex flex-wrap items-center gap-1 pt-1 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedLetter('ALL')}
            className={cn(
              'archetype-badge px-2 py-1 text-xs font-mono font-bold transition-colors',
              selectedLetter === 'ALL' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
            )}
          >
            ALL
          </button>
          {ALPHABET_LETTERS.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={cn(
                'archetype-badge w-6 h-6 flex items-center justify-center text-xs font-mono font-bold transition-colors',
                selectedLetter === letter
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              )}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm font-medium text-muted-foreground">
          Showing <span className="text-foreground font-bold">{filteredData.length}</span> terms (Page{' '}
          {currentPage} of {totalPages}) • <span className="text-primary font-semibold">Click any card to open Practice Studio</span>
        </p>
      </div>

      {/* Grid of Words */}
      {paginatedItems.length === 0 ? (
        <div className="archetype-card p-12 text-center border-dashed bg-surface/30">
          <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-bold font-heading">لم يتم العثور على كلمات مطابقة</h3>
          <p className="text-sm text-muted-foreground mt-1">
            جرب البحث بصيغة أخرى، حيث يدعم النظام البحث بجميع تصاريف ومترادفات المعنى العربي بدون تشكيل.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedItems.map((item) => {
            const isMastered = masteredWordIds.includes(item.id);
            const isFavorite = favoriteWordIds.includes(item.id);
            const meanings = extractArabicMeanings(item.arabic);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPracticeWord(item)}
                className={cn(
                  'archetype-card group relative overflow-hidden p-5 space-y-3 cursor-pointer select-none bg-surface',
                  isMastered && 'border-emerald-500/40 bg-emerald-500/[0.03]'
                )}
              >
                {/* Top Bar */}
                <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        item.cefr === 'A1'
                          ? 'a1'
                          : item.cefr === 'A2'
                          ? 'a2'
                          : item.cefr === 'B1'
                          ? 'b1'
                          : 'b2'
                      }
                      className="archetype-badge text-[11px]"
                    >
                      {item.cefr}
                    </Badge>
                    <span className="text-xs font-mono font-semibold text-muted-foreground">{item.pos}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className={cn(
                        'p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors',
                        isFavorite && 'text-amber-500 hover:text-amber-600'
                      )}
                      title={isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                    >
                      <Star className={cn('h-4 w-4', isFavorite && 'fill-current')} />
                    </button>
                    <button
                      onClick={() => toggleMastered(item.id)}
                      className={cn(
                        'p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors',
                        isMastered && 'text-emerald-500 hover:text-emerald-600'
                      )}
                      title={isMastered ? 'Mark Unmastered' : 'Mark Mastered (+25 XP)'}
                    >
                      <CheckCircle className={cn('h-4 w-4', isMastered && 'fill-emerald-500/20')} />
                    </button>
                  </div>
                </div>

                {/* Word & IPA */}
                <div>
                  <h3 className="text-2xl font-black font-heading tracking-tight text-foreground group-hover:text-primary transition-colors ltr-isolate">
                    {item.word}
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground ltr-isolate mt-0.5">
                    {item.ipa}
                  </p>
                </div>

                {/* Meaning Stack Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {meanings.slice(0, 2).map((meaning, idx) => (
                    <span
                      key={idx}
                      className="archetype-badge px-2 py-0.5 text-xs font-medium bg-muted/60 text-foreground rtl-text"
                    >
                      {meaning}
                    </span>
                  ))}
                  {meanings.length > 2 && (
                    <span className="text-[10px] font-bold text-muted-foreground self-center">
                      +{meanings.length - 2}
                    </span>
                  )}
                </div>

                {/* Example Sentence */}
                <p className="text-xs text-muted-foreground line-clamp-2 ltr-isolate italic border-t border-border/40 pt-2">
                  "{item.example}"
                </p>

                {/* Quick Action Footer */}
                <div
                  className="pt-2 border-t border-border/50 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AudioPlayButton text={item.word} size="sm" variant="secondary" label="نطق" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPracticeWord(item)}
                    className="archetype-btn text-xs gap-1.5 hover:border-primary/50"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    تدريب شامل
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="archetype-btn"
          >
            السابق
          </Button>
          <span className="text-sm font-bold font-mono text-muted-foreground px-3">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="archetype-btn"
          >
            التالي
          </Button>
        </div>
      )}

      {/* All-in-One Word Practice & Pronunciation Studio Dialog */}
      <WordPracticeDialog
        word={selectedPracticeWord}
        isOpen={!!selectedPracticeWord}
        onClose={() => setSelectedPracticeWord(null)}
      />
    </div>
  );
}
