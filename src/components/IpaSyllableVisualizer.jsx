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
      <span className="text-slate-900 dark:text-slate-200 font-black text-[13px]">/</span>
      {syllables.map((syl, idx) => {
        if (syl.isPrimary) {
          return (
            <span
              key={idx}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-cyan-500 text-slate-950 dark:bg-cyan-400 dark:text-slate-950 border border-cyan-600 font-black shadow-sm tracking-wider"
              title="Primary Stress (ˈ)"
            >
              <span className="text-slate-950 font-black text-[13px]">ˈ</span>
              <span>{syl.text}</span>
            </span>
          );
        }

        if (syl.isSecondary) {
          return (
            <span
              key={idx}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 dark:bg-amber-400 dark:text-slate-950 border border-amber-600 font-extrabold tracking-wide"
              title="Secondary Stress (ˌ)"
            >
              <span className="text-slate-950 font-black text-[13px]">ˌ</span>
              <span>{syl.text}</span>
            </span>
          );
        }

        return (
          <span key={idx} className="px-0.5 text-slate-900 dark:text-slate-100 font-black">
            {syl.text}
          </span>
        );
      })}
      <span className="text-slate-900 dark:text-slate-200 font-black text-[13px]">/</span>
    </div>
  );
};

export default IpaSyllableVisualizer;
