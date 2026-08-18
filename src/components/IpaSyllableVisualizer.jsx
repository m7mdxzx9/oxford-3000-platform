import React, { useState, useEffect } from 'react';

/**
 * Parses an IPA string into structured syllable tokens with stress badges.
 */
export const parseIpaSyllables = (ipaStr) => {
  if (!ipaStr || typeof ipaStr !== 'string') return [];
  const clean = ipaStr.replace(/^\/+|\/+$/g, '').trim();

  const regex = /(ˈ[^.ˈˌ]+|ˌ[^.ˈˌ]+|[^.ˈˌ]+)/g;
  const matches = clean.match(regex) || [clean];

  return matches.map((item) => {
    let isPrimary = false;
    let isSecondary = false;
    let text = item;

    if (item.startsWith('ˈ')) {
      isPrimary = true;
      text = item.slice(1);
    } else if (item.startsWith('ˌ')) {
      isSecondary = true;
      text = item.slice(1);
    }

    return {
      text,
      isPrimary,
      isSecondary,
      raw: item,
    };
  });
};

/**
 * IPA Word Stress & Syllable Visualizer Component with Karaoke-Sync Animation (Feature 1204).
 * Highlights primary stress (ˈ) and secondary stress (ˌ) with live glowing syllable playback.
 */
export const IpaSyllableVisualizer = React.memo(function IpaSyllableVisualizer({ ipa = '', word = '', isPlaying = false, className = '' }) {
  if (!ipa) return null;
  const syllables = parseIpaSyllables(ipa);
  const [activeSyllableIdx, setActiveSyllableIdx] = useState(-1);

  // Live Karaoke Synchronized Syllable Stepper
  useEffect(() => {
    let timer = null;
    if (isPlaying && syllables.length > 0) {
      setActiveSyllableIdx(0);
      const stepDuration = Math.max(120, Math.min(350, 1000 / syllables.length));
      let current = 0;

      timer = setInterval(() => {
        current += 1;
        if (current < syllables.length) {
          setActiveSyllableIdx(current);
        } else {
          clearInterval(timer);
          setActiveSyllableIdx(-1);
        }
      }, stepDuration);
    } else {
      setActiveSyllableIdx(-1);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, syllables.length]);

  return (
    <div dir="ltr" className={`ltr-isolate inline-flex items-center gap-1 font-mono text-xs my-1 select-none ${className}`}>
      <span className="text-[var(--text-main)] font-black text-[13px] opacity-70">/</span>
      {syllables.map((syl, idx) => {
        const isKaraokeActive = activeSyllableIdx === idx;

        if (syl.isPrimary) {
          return (
            <span
              key={idx}
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg font-black shadow-sm tracking-wider text-[11px] transition-all duration-150 ${
                isKaraokeActive
                  ? 'bg-amber-400 text-black scale-110 ring-2 ring-amber-300 shadow-amber-400/50'
                  : 'theme-btn-primary'
              }`}
              title="Primary Stress (ˈ)"
            >
              <span className="font-black text-[12px]">ˈ</span>
              <span>{syl.text}</span>
            </span>
          );
        }

        if (syl.isSecondary) {
          return (
            <span
              key={idx}
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg border font-black tracking-wide text-[11px] transition-all duration-150 ${
                isKaraokeActive
                  ? 'bg-cyan-400 text-black scale-110 ring-2 ring-cyan-300 shadow-cyan-400/50'
                  : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
              }`}
              title="Secondary Stress (ˌ)"
            >
              <span className="font-black text-[12px]">ˌ</span>
              <span>{syl.text}</span>
            </span>
          );
        }

        return (
          <span
            key={idx}
            className={`px-1 py-0.5 rounded transition-all duration-150 font-bold ${
              isKaraokeActive
                ? 'bg-cyan-500 text-white scale-110 shadow-sm'
                : 'text-[var(--text-main)]'
            }`}
          >
            {syl.text}
          </span>
        );
      })}
      <span className="text-[var(--text-main)] font-black text-[13px] opacity-70">/</span>
    </div>
  );
});

export default IpaSyllableVisualizer;
