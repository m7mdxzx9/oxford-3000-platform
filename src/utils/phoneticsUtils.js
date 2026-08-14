/**
 * Phonetics & Pronunciation Utilities
 * Feature 23: Silent Letter Highlighter
 * Feature 16: Phoneme / Letter-level Speech Evaluation
 */

/**
 * Common silent letter rules in English words
 */
const SILENT_LETTER_PATTERNS = [
  // Silent K before N (knife, know, knight, knee)
  { regex: /\b(k)(n)/i, silentIndices: [0] },
  // Silent B after M or before T (climb, comb, doubt, debt, lamb, thumb)
  { regex: /(m)(b)\b/i, silentIndices: [1] },
  { regex: /(d)(b)(t)/i, silentIndices: [1] },
  { regex: /(d)(o)(u)(b)(t)/i, silentIndices: [3] },
  { regex: /(d)(e)(b)(t)/i, silentIndices: [2] },
  // Silent W before R or in specific words (write, wrong, answer, sword, two)
  { regex: /\b(w)(r)/i, silentIndices: [0] },
  { regex: /\b(a)(n)(s)(w)(e)(r)/i, silentIndices: [3] },
  { regex: /\b(s)(w)(o)(r)(d)/i, silentIndices: [1] },
  { regex: /\b(t)(w)(o)\b/i, silentIndices: [1] },
  // Silent L before K, D, M, F (walk, talk, half, calm, could, should, would, salmon)
  { regex: /([aeiou])(l)(k)\b/i, silentIndices: [1] },
  { regex: /([aeiou])(l)(m)\b/i, silentIndices: [1] },
  { regex: /([aeiou])(l)(f)\b/i, silentIndices: [1] },
  { regex: /(c|s|w)(o)(u)(l)(d)\b/i, silentIndices: [3] },
  // Silent GH (night, light, thought, through, daughter, high)
  { regex: /([aeiouy])(g)(h)/i, silentIndices: [1, 2] },
  // Silent G before N (gnome, sign, foreign, champagne, design)
  { regex: /\b(g)(n)/i, silentIndices: [0] },
  { regex: /([aeiou])(g)(n)\b/i, silentIndices: [1] },
  // Silent P before S, N, T (psychology, pneumonia, receipt)
  { regex: /\b(p)(s|n|t)/i, silentIndices: [0] },
  { regex: /(r)(e)(c)(e)(i)(p)(t)/i, silentIndices: [5] },
  // Silent H after W, G, R, or at beginning (what, hour, honest, ghost, rhythm)
  { regex: /\b(h)(o)(u)(r)/i, silentIndices: [0] },
  { regex: /\b(h)(o)(n)(e)(s)(t)/i, silentIndices: [0] },
  { regex: /\b(h)(e)(i)(r)/i, silentIndices: [0] },
  { regex: /\b(g)(h)(o)(s)(t)/i, silentIndices: [1] },
  { regex: /\b(r)(h)(y)(t)(h)(m)/i, silentIndices: [1] },
  // Silent T in -sten, -stle (listen, castle, whistle, fasten)
  { regex: /(s)(t)(e)(n)\b/i, silentIndices: [1] },
  { regex: /(s)(t)(l)(e)\b/i, silentIndices: [1] },
  { regex: /(f)(a)(s)(t)(e)(n)/i, silentIndices: [3] },
];

/**
 * Analyzes a word and returns an array of character objects indicating if each char is silent.
 * @param {string} word 
 * @returns {Array<{char: string, isSilent: boolean, note?: string}>}
 */
export function analyzeSilentLetters(word) {
  if (!word || typeof word !== 'string') return [];

  const clean = word.trim();
  const chars = clean.split('').map((char) => ({ char, isSilent: false }));
  const lower = clean.toLowerCase();

  for (const pattern of SILENT_LETTER_PATTERNS) {
    let match;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    while ((match = regex.exec(lower)) !== null) {
      const matchIndex = match.index;
      for (const offset of pattern.silentIndices) {
        const targetIdx = matchIndex + offset;
        if (targetIdx >= 0 && targetIdx < chars.length) {
          chars[targetIdx].isSilent = true;
          chars[targetIdx].note = `حرف صامت غير منطوق (${chars[targetIdx].char})`;
        }
      }
      if (!regex.global) break;
    }
  }

  return chars;
}

/**
 * Feature 16: Phoneme / Letter-by-letter Speech Score Breakdown
 * Compares target word with recognized text to score character by character.
 */
export function evaluatePhonemeAccuracy(targetWord, spokenText) {
  if (!targetWord) return { score: 0, letters: [] };
  
  const target = targetWord.trim().toLowerCase();
  const spoken = (spokenText || '').trim().toLowerCase();

  if (!spoken) {
    return {
      score: 0,
      letters: target.split('').map((c) => ({ char: c, status: 'missed', score: 0 })),
    };
  }

  // Exact match
  if (target === spoken) {
    return {
      score: 100,
      letters: target.split('').map((c) => ({ char: c, status: 'perfect', score: 100 })),
    };
  }

  // Levenshtein / alignment evaluation
  const targetChars = target.split('');
  const letters = targetChars.map((char, index) => {
    // Check if char exists at approximately the same position
    if (spoken[index] === char) {
      return { char, status: 'perfect', score: 100 };
    } else if (spoken.includes(char)) {
      return { char, status: 'partial', score: 65 };
    } else {
      return { char, status: 'mispronounced', score: 20 };
    }
  });

  const totalScore = Math.round(
    letters.reduce((sum, item) => sum + item.score, 0) / (letters.length || 1)
  );

  return {
    score: totalScore,
    letters,
  };
}
