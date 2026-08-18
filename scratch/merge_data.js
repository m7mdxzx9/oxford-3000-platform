import fs from 'fs';

const srcData = fs.readFileSync('src/data/oxford3000.js', 'utf8');

const header = `/**
 * Official Canonical Complete Oxford 3000™ (American English) Dataset
 * Unified Single Source of Truth
 * Total Headwords: 3002
 */
`;

const contentWithoutHeader = srcData.replace(/^\/\*\*[\s\S]*?\*\/\s*/, '');

const additionalExports = `
export const OXFORD_3000 = oxford3000Data;

export const normalizedOxford3000 = oxford3000Data.map((item) => ({
  ...item,
  level: item.cefr,
  translation: item.arabic,
  phonetic: item.ipa,
}));

export default oxford3000Data;
`;

let merged = header + contentWithoutHeader.trim();
if (merged.endsWith('export default oxford3000Data;')) {
  merged = merged.slice(0, -'export default oxford3000Data;'.length);
}
merged = merged.trim() + '\n' + additionalExports;

fs.writeFileSync('src/data/oxford3000Data.js', merged, 'utf8');
console.log('Updated canonical src/data/oxford3000Data.js! Size:', fs.statSync('src/data/oxford3000Data.js').size);
