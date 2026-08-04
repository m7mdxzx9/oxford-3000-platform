import { oxford3000Data } from './oxford3000.js';

export const normalizedOxford3000 = oxford3000Data.map((item) => ({
  ...item,
  level: item.cefr,
  translation: item.arabic,
  phonetic: item.ipa,
}));

export default normalizedOxford3000;
