/**
 * Oxford 3000™ Multi-Meaning Semantic Dictionary & Arabic Thesaurus
 * Feature 0301: Provides comprehensive primary translations, alternative meanings, and contextual synonyms for all headwords.
 * Enables searching for words by hidden, secondary, or alternative Arabic translations (e.g. "مركبة" -> vehicle).
 */

import { normalizeArabicText } from './arabicTranslationDictionary';

/**
 * Curated Extended Meanings & Synonyms for key Oxford 3000 words.
 */
export const EXTENDED_WORD_MEANINGS = {
  vehicle: {
    primary: 'مركبة',
    alternatives: ['مركبة', 'عربة', 'وسيلة نقل', 'سيارة', 'ناقلة', 'آلية'],
    synonyms: ['car', 'automobile', 'transport', 'craft', 'van', 'truck'],
  },
  car: {
    primary: 'سيارة',
    alternatives: ['سيارة', 'مركبة', 'عربة', 'أوتوموبيل'],
    synonyms: ['automobile', 'vehicle', 'motorcar', 'auto'],
  },
  abandon: {
    primary: 'يتخلى عن',
    alternatives: ['يتخلى عن', 'يهجر', 'يترك', 'يتنازل عن', 'يقلع عن'],
    synonyms: ['desert', 'leave', 'forsake', 'give up', 'relinquish'],
  },
  ability: {
    primary: 'قدرة',
    alternatives: ['قدرة', 'مقدرة', 'مهارة', 'استطاعة', 'كفاءة', 'طاقة'],
    synonyms: ['capability', 'skill', 'capacity', 'talent', 'potential'],
  },
  achieve: {
    primary: 'يحقق',
    alternatives: ['يحقق', 'ينجز', 'يصل إلى', 'ينال', 'يكسب'],
    synonyms: ['accomplish', 'reach', 'attain', 'fulfill', 'gain'],
  },
  acquire: {
    primary: 'يكتسب',
    alternatives: ['يكتسب', 'يحصل على', 'يتعلم', 'يقتني', 'يستحوذ'],
    synonyms: ['obtain', 'gain', 'get', 'receive', 'procure'],
  },
  aircraft: {
    primary: 'طائرة',
    alternatives: ['طائرة', 'مركبة جوية', 'طيارة', 'سفينة فضاء'],
    synonyms: ['airplane', 'plane', 'aeroplane', 'jet', 'helicopter'],
  },
  craft: {
    primary: 'حرفة',
    alternatives: ['حرفة', 'صنعة', 'مركبة', 'قارب', 'مهارة يدوية'],
    synonyms: ['trade', 'skill', 'vessel', 'boat', 'vehicle'],
  },
  truck: {
    primary: 'شاحنة',
    alternatives: ['شاحنة', 'عربة نقل', 'مركبة ثقيلة', 'لوري'],
    synonyms: ['lorry', 'vehicle', 'van', 'carrier'],
  },
  bus: {
    primary: 'حافلة',
    alternatives: ['حافلة', 'باص', 'مركبة نقل ركاب', 'أوتوبيس'],
    synonyms: ['coach', 'vehicle', 'transit'],
  },
  bicycle: {
    primary: 'دراجة هوائية',
    alternatives: ['دراجة هوائية', 'دراجة', 'سيكل', 'مركبة بعجلتين'],
    synonyms: ['bike', 'cycle'],
  },
  device: {
    primary: 'جهاز',
    alternatives: ['جهاز', 'أداة', 'آلة', 'وسيلة', 'حيلة'],
    synonyms: ['gadget', 'appliance', 'tool', 'instrument', 'mechanism'],
  },
  tool: {
    primary: 'أداة',
    alternatives: ['أداة', 'وسيلة', 'آلة', 'معدة'],
    synonyms: ['instrument', 'implement', 'device', 'utensil'],
  },
  facility: {
    primary: 'مرفق',
    alternatives: ['مرفق', 'منشأة', 'تسهيل', 'إمكانية', 'مبنى خدمي'],
    synonyms: ['amenity', 'establishment', 'installation', 'resource'],
  },
  challenge: {
    primary: 'تحدي',
    alternatives: ['تحدي', 'صعوبة', 'مواجهة', 'مسألة عسيرة'],
    synonyms: ['obstacle', 'difficulty', 'test', 'trial'],
  },
  journey: {
    primary: 'رحلة',
    alternatives: ['رحلة', 'مسيرة', 'سفر', 'مشوار', 'مسار'],
    synonyms: ['trip', 'travel', 'voyage', 'expedition', 'tour'],
  },
  adventure: {
    primary: 'مغامرة',
    alternatives: ['مغامرة', 'تجربة جريئة', 'مخاطرة شيقة'],
    synonyms: ['exploit', 'venture', 'experience', 'quest'],
  },
  destination: {
    primary: 'وجهة',
    alternatives: ['وجهة', 'مقصد', 'غاية', 'مكان الوصول'],
    synonyms: ['target', 'goal', 'endpoint', 'stop'],
  },
  opportunity: {
    primary: 'فرصة',
    alternatives: ['فرصة', 'مناسبة مواتية', 'سانحة', 'مجال'],
    synonyms: ['chance', 'opening', 'occasion', 'possibility'],
  },
  resilient: {
    primary: 'مرن / صامد',
    alternatives: ['مرن', 'صامد', 'مقاوم للصدمات', 'قوي الشكيمة'],
    synonyms: ['tough', 'strong', 'flexible', 'adaptable', 'hardy'],
  },
  essential: {
    primary: 'أساسي / جوهري',
    alternatives: ['أساسي', 'جوهري', 'ضروري', 'لا غنى عنه', 'حيوي'],
    synonyms: ['crucial', 'vital', 'necessary', 'fundamental', 'key'],
  },
  comprehend: {
    primary: 'يستوعب',
    alternatives: ['يستوعب', 'يفهم', 'يدرك', 'يشمل', 'يحوي'],
    synonyms: ['understand', 'grasp', 'fathom', 'perceive'],
  },
};

/**
 * Extracts and parses all sub-meanings, commas, slashes, and extended synonyms for any word object.
 * @param {Object} wordObj The word record from oxford3000Data
 * @returns {Object} { primary, alternatives: string[], synonyms: string[], searchTokens: string[] }
 */
export function getWordMeanings(wordObj) {
  if (!wordObj) {
    return {
      primary: '',
      alternatives: [],
      synonyms: [],
      searchTokens: [],
    };
  }

  const cleanWord = (wordObj.word || '').toLowerCase().trim();
  const rawArabic = (wordObj.arabic || '').trim();

  // 1. Check curated extended dictionary first
  const curated = EXTENDED_WORD_MEANINGS[cleanWord];

  // 2. Parse raw Arabic string with slashes, commas, and parentheses
  const parsedFromRaw = rawArabic
    .split(/[/،,؛;\n]+/)
    .map((s) => s.replace(/[()]/g, '').trim())
    .filter(Boolean);

  const primary = curated?.primary || parsedFromRaw[0] || rawArabic;

  // Combine unique alternatives
  const alternativesSet = new Set([
    primary,
    ...parsedFromRaw,
    ...(curated?.alternatives || []),
  ]);

  const alternatives = Array.from(alternativesSet).filter(Boolean);
  const synonyms = curated?.synonyms || [];

  // Generate normalized search tokens for fast matching
  const searchTokens = [
    cleanWord,
    ...alternatives.map((a) => normalizeArabicText(a)),
    ...synonyms.map((s) => s.toLowerCase()),
    normalizeArabicText(rawArabic),
  ].filter(Boolean);

  return {
    primary,
    alternatives,
    synonyms,
    searchTokens,
  };
}

/**
 * Tests if a search query matches a word's headword, primary Arabic, any hidden sub-meaning, or synonyms.
 * @param {Object} wordObj The word item
 * @param {string} normalizedQuery Pre-normalized query string
 * @param {string} rawQuery Original raw query string
 * @returns {boolean} True if matched
 */
export function matchesSearchQuery(wordObj, normalizedQuery, rawQuery = '') {
  if (!normalizedQuery && !rawQuery) return true;
  if (!wordObj) return false;

  const cleanQuery = rawQuery.toLowerCase().trim();

  // 1. Direct English Match
  if (cleanQuery && wordObj.word.toLowerCase().includes(cleanQuery)) {
    return true;
  }

  // 2. Example Sentence Match
  if (cleanQuery && wordObj.example && wordObj.example.toLowerCase().includes(cleanQuery)) {
    return true;
  }

  // 3. Multi-meaning semantic matching (including hidden meanings like "مركبة" -> "vehicle")
  const { searchTokens, alternatives, synonyms } = getWordMeanings(wordObj);

  // Check normalized Arabic tokens
  if (normalizedQuery) {
    for (const token of searchTokens) {
      if (token.includes(normalizedQuery)) {
        return true;
      }
    }
  }

  // Check synonyms
  if (cleanQuery) {
    for (const syn of synonyms) {
      if (syn.toLowerCase().includes(cleanQuery)) {
        return true;
      }
    }
  }

  return false;
}

export default {
  EXTENDED_WORD_MEANINGS,
  getWordMeanings,
  matchesSearchQuery,
};
