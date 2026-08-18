'use client';

import * as React from 'react';
import { Search, Volume2, Mic, Star, CheckCircle, Sparkles, Filter, BookOpen } from 'lucide-react';
import { OXFORD_DATASET, ALPHABET_LETTERS, CEFR_COUNTS } from '@/data/oxfordDataset';
import { LexiconItem, CefrLevel } from '../types';
import { useStore } from '@/lib/store';
import { AudioPlayButton } from '@/features/audio-speech/components/AudioPlayButton';
import { SpeechRecordingModal } from '@/features/audio-speech/components/SpeechRecordingModal';
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

  // Speech modal state
  const [activeSpeechWord, setActiveSpeechWord] = React.useState<LexiconItem | null>(null);

  // Zustand state
  const masteredWordIds = useStore((state) => state.masteredWordIds);
  const favoriteWordIds = useStore((state) => state.favoriteWordIds);
  const toggleMastered = useStore((state) => state.toggleMastered);
  const toggleFavorite = useStore((state) => state.toggleFavorite);

  // Filtered dataset
  const filteredData = React.useMemo(() => {
    return OXFORD_DATASET.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchWord = item.word.toLowerCase().includes(q);
        const matchArabic = item.arabic.includes(q);
        const matchExample = item.example.toLowerCase().includes(q);
        if (!matchWord && !matchArabic && !matchExample) return false;
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
      <div className="p-6 rounded-2xl border border-border bg-surface/60 backdrop-blur-md shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search 3,000+ words, definitions, Arabic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
            <Button
              variant={filterFavorites ? 'accent' : 'outline'}
              size="sm"
              onClick={() => setFilterFavorites(!filterFavorites)}
              className="gap-1.5 text-xs"
            >
              <Star className={cn('h-3.5 w-3.5', filterFavorites && 'fill-current')} />
              Favorites ({favoriteWordIds.length})
            </Button>
            <Button
              variant={filterMastered ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterMastered(!filterMastered)}
              className="gap-1.5 text-xs"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Mastered ({masteredWordIds.length})
            </Button>
          </div>
        </div>

        {/* CEFR Level Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <span className="text-xs font-semibold text-muted-foreground mr-2">CEFR Level:</span>
          {(['ALL', 'A1', 'A2', 'B1', 'B2'] as const).map((lvl) => {
            const count =
              lvl === 'ALL' ? CEFR_COUNTS.TOTAL : CEFR_COUNTS[lvl as keyof typeof CEFR_COUNTS];
            const isSelected = selectedCefr === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setSelectedCefr(lvl)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer select-none',
                  isSelected
                    ? 'bg-primary text-white shadow-sm scale-105'
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
              'px-2 py-1 rounded text-xs font-mono font-bold transition-colors',
              selectedLetter === 'ALL' ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'
            )}
          >
            ALL
          </button>
          {ALPHABET_LETTERS.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={cn(
                'w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold transition-colors',
                selectedLetter === letter
                  ? 'bg-primary text-white'
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
          {currentPage} of {totalPages})
        </p>
      </div>

      {/* Grid of Words */}
      {paginatedItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-surface/30">
          <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-bold font-heading">No matching words found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search query, CEFR level, or clear your active filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedItems.map((item) => {
            const isMastered = masteredWordIds.includes(item.id);
            const isFavorite = favoriteWordIds.includes(item.id);

            return (
              <Card
                key={item.id}
                className={cn(
                  'group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/40',
                  isMastered && 'border-emerald-500/30 bg-emerald-500/[0.02]'
                )}
              >
                <CardContent className="p-5 space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
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
                      >
                        {item.cefr}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">{item.pos}</span>
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
                    <h3 className="text-xl font-bold font-heading tracking-tight text-foreground group-hover:text-primary transition-colors ltr-isolate">
                      {item.word}
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground ltr-isolate mt-0.5">
                      {item.ipa}
                    </p>
                  </div>

                  {/* Arabic Translation */}
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40">
                    <p className="text-sm font-medium text-foreground rtl-text leading-relaxed">
                      {item.arabic}
                    </p>
                  </div>

                  {/* Example Sentence */}
                  <p className="text-xs text-muted-foreground line-clamp-2 ltr-isolate italic">
                    "{item.example}"
                  </p>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                    <AudioPlayButton text={item.word} size="sm" variant="secondary" label="Pronounce" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveSpeechWord(item)}
                      className="text-xs gap-1.5 hover:border-primary/50"
                    >
                      <Mic className="h-3.5 w-3.5 text-primary" />
                      Practice
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Speech Practicing Modal */}
      {activeSpeechWord && (
        <SpeechRecordingModal
          isOpen={!!activeSpeechWord}
          onClose={() => setActiveSpeechWord(null)}
          targetText={activeSpeechWord.word}
          ipa={activeSpeechWord.ipa}
          arabicTranslation={activeSpeechWord.arabic}
        />
      )}
    </div>
  );
}
