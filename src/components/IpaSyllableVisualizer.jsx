import React from 'react';

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
 * IPA Word Stress & Syllable Visualizer Component.
 * Highlights primary stress (ˈ) and secondary stress (ˌ) with distinct typography & badges.
 */
export const IpaSyllableVisualizer = ({ ipa = '' }) => {
  if (!ipa) return null;
  const syllables = parseIpaSyllables(ipa);

  return (
    <div dir="ltr" className="ltr-isolate inline-flex items-center gap-1 font-mono text-xs my-1 select-none">
      <span className="text-[var(--text-main)] font-black text-[13px] opacity-70">/</span>
      {syllables.map((syl, idx) => {
        if (syl.isPrimary) {
          return (
            <span
              key={idx}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg theme-btn-primary font-black shadow-sm tracking-wider text-[11px]"
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
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-black tracking-wide text-[11px]"
              title="Secondary Stress (ˌ)"
            >
              <span className="font-black text-[12px]">ˌ</span>
              <span>{syl.text}</span>
            </span>
          );
        }

        return (
          <span key={idx} className="px-0.5 text-[var(--text-main)] font-bold">
            {syl.text}
          </span>
        );
      })}
      <span className="text-[var(--text-main)] font-black text-[13px] opacity-70">/</span>
    </div>
  );
};

export default IpaSyllableVisualizer;
