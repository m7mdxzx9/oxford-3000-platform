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
      <span className="opacity-50 text-[11px]">/</span>
      {syllables.map((syl, idx) => {
        if (syl.isPrimary) {
          return (
            <span
              key={idx}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-extrabold shadow-[0_0_8px_rgba(6,182,212,0.25)] tracking-wider"
              title="Primary Stress (ˈ)"
            >
              <span className="text-cyan-400 font-black text-[13px]">ˈ</span>
              <span>{syl.text}</span>
            </span>
          );
        }

        if (syl.isSecondary) {
          return (
            <span
              key={idx}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold tracking-wide"
              title="Secondary Stress (ˌ)"
            >
              <span className="text-amber-400 font-black text-[13px]">ˌ</span>
              <span>{syl.text}</span>
            </span>
          );
        }

        return (
          <span key={idx} className="opacity-75 px-0.5 text-slate-300 font-medium">
            {syl.text}
          </span>
        );
      })}
      <span className="opacity-50 text-[11px]">/</span>
    </div>
  );
};

export default IpaSyllableVisualizer;
