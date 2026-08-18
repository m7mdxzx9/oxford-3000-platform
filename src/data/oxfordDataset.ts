import { LexiconItem } from '../features/lexicon/types';
import { oxford3000Data } from './oxford3000Data.js';

export const OXFORD_DATASET: LexiconItem[] = (oxford3000Data as any[]).map((item) => ({
  id: item.id,
  word: item.word,
  pos: item.pos,
  cefr: item.cefr as 'A1' | 'A2' | 'B1' | 'B2',
  arabic: item.arabic,
  example: item.example,
  ipa: item.ipa,
  isMastered: false,
  isFavorite: false,
  srsLevel: 0,
}));

export const CEFR_COUNTS = {
  A1: OXFORD_DATASET.filter((w) => w.cefr === 'A1').length,
  A2: OXFORD_DATASET.filter((w) => w.cefr === 'A2').length,
  B1: OXFORD_DATASET.filter((w) => w.cefr === 'B1').length,
  B2: OXFORD_DATASET.filter((w) => w.cefr === 'B2').length,
  TOTAL: OXFORD_DATASET.length,
};

export const ALPHABET_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
