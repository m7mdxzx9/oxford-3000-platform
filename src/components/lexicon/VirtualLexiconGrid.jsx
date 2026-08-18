/**
 * ============================================================================
 * File: src/components/lexicon/VirtualLexiconGrid.jsx
 * Purpose: 60 FPS Multi-Column Virtualized Grid powered by TanStack Virtual
 * Connected To: LexiconCardItem.jsx, LexiconGrid.jsx, useVirtualSearch.js
 * Description:
 *   Replaces traditional flat DOM rendering of 3000 items with a dynamic
 *   virtualized row grid. Only the ~10-15 visible items in the user's viewport
 *   are rendered into the DOM, maintaining 60 FPS scroll performance.
 * ============================================================================
 */

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import LexiconCardItem from './LexiconCardItem';

export default function VirtualLexiconGrid({
  words = [],
  onSelectWord,
  isRecordingWord,
  practiceWord,
  practiceResult,
  activePlaybackWord,
  onPlayTTS,
  onToggleRecord,
  onQuickAddSRS,
}) {
  const parentRef = useRef(null);
  const [columns, setColumns] = useState(() => {
    if (typeof window === 'undefined') return 3;
    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 1024) return 2;
    return 3;
  });

  // Responsive column calculation based on window width
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumns(1); // Mobile
      } else if (width < 1024) {
        setColumns(2); // Tablet
      } else {
        setColumns(3); // Desktop
      }
    };

    window.addEventListener('resize', updateColumns, { passive: true });
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Group 1D word items into 2D rows based on column count
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < words.length; i += columns) {
      result.push(words.slice(i, i + columns));
    }
    return result;
  }, [words, columns]);

  // TanStack Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 380, // Estimated card height in pixels
    overscan: 2, // Pre-render 2 rows above and below viewport
  });

  if (words.length === 0) {
    return null;
  }

  return (
    <div
      ref={parentRef}
      className="w-full h-[75vh] min-h-[500px] overflow-y-auto pr-1 no-scrollbar rounded-3xl border border-black/5 dark:border-white/5 relative"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems = rows[virtualRow.index] || [];

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="py-2"
            >
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {rowItems.map((wordObj) => (
                  <LexiconCardItem
                    key={wordObj.id || wordObj.word}
                    wordObj={wordObj}
                    onSelectWord={onSelectWord}
                    isRecordingWord={isRecordingWord}
                    practiceWord={practiceWord}
                    practiceResult={practiceResult}
                    activePlaybackWord={activePlaybackWord}
                    onPlayTTS={onPlayTTS}
                    onToggleRecord={onToggleRecord}
                    onQuickAddSRS={onQuickAddSRS}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
