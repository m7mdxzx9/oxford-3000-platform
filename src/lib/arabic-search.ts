/**
 * Diacritic-Agnostic Deep Arabic Search Engine
 * Normalizes all Arabic orthographic variations, strips Harakat, removes Tatweel,
 * and matches queries across headwords, multi-synonym meaning stacks, and context examples.
 */

export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    // 1. Remove Arabic Harakat / Diacritics (Fathatan, Dammatan, Kasratan, Fatha, Damma, Kasra, Shadda, Sukun, Dagger Alif)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // 2. Remove Tatweel / Kashida
    .replace(/\u0640/g, '')
    // 3. Normalize all Hamza variations (أ, إ, آ, ء, ئ, ؤ) -> ا
    .replace(/[أإآءئؤ]/g, 'ا')
    // 4. Normalize Taa Marbuta (ة) -> ه
    .replace(/ة/g, 'ه')
    // 5. Normalize Alif Maqsura (ى) -> ي
    .replace(/ى/g, 'ي')
    // 6. Clean punctuation, extra spaces, and lowercase
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Extracts and normalizes individual synonym phrases from an Arabic meaning string
 * Handles separators like comma (، / ,), slash (/), semicolon (؛ / ;), and parentheses.
 */
export function extractArabicMeanings(arabicStr: string): string[] {
  if (!arabicStr) return [];
  
  // Split on common Arabic and English delimiters
  const rawParts = arabicStr.split(/[/،,؛;\n\r()]+/);
  const result: string[] = [];

  for (const part of rawParts) {
    const trimmed = part.trim();
    if (trimmed.length > 0) {
      result.push(trimmed);
    }
  }

  // Also include the full string if it wasn't a single token
  if (result.length > 1 && !result.includes(arabicStr.trim())) {
    result.unshift(arabicStr.trim());
  }

  return result;
}

export interface SearchableLexiconItem {
  id: number;
  word: string;
  pos: string;
  cefr: string;
  arabic: string;
  example: string;
  ipa: string;
}

/**
 * Deep semantic matcher executing diacritic-agnostic search
 */
export function matchesSearchQuery(
  item: SearchableLexiconItem,
  query: string
): boolean {
  if (!query || !query.trim()) return true;

  const rawQuery = query.trim().toLowerCase();
  const normalizedQuery = normalizeArabicText(rawQuery);

  // 1. Direct English Headword Match
  if (item.word.toLowerCase().includes(rawQuery)) {
    return true;
  }

  // 2. English Example Match
  if (item.example.toLowerCase().includes(rawQuery)) {
    return true;
  }

  // 3. Part of Speech or IPA Match
  if (item.pos.toLowerCase().includes(rawQuery) || item.ipa.toLowerCase().includes(rawQuery)) {
    return true;
  }

  // 4. Arabic Full String Normalized Match
  const normalizedArabic = normalizeArabicText(item.arabic);
  if (normalizedArabic.includes(normalizedQuery)) {
    return true;
  }

  // 5. Individual Arabic Synonyms Match
  const meanings = extractArabicMeanings(item.arabic);
  for (const meaning of meanings) {
    const normalizedMeaning = normalizeArabicText(meaning);
    if (
      normalizedMeaning.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedMeaning)
    ) {
      return true;
    }
  }

  // 6. Token-level subword matching (e.g. searching "مركبه" matches "مركبة", "سيارة أو مركبة")
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (queryTokens.length > 0) {
    const arabicTokens = normalizedArabic.split(/\s+/).filter(Boolean);
    const allTokensMatch = queryTokens.every((qToken) =>
      arabicTokens.some((aToken) => aToken.includes(qToken) || qToken.includes(aToken))
    );
    if (allTokensMatch) {
      return true;
    }
  }

  return false;
}
