import fs from 'fs';

let content = fs.readFileSync('src/data/oxford3000Data.js', 'utf8');

// Ensure that normalizedOxford3000 is exported both as named and that default export has properties
const oldExports = `export const normalizedOxford3000 = oxford3000Data.map((item) => ({
  ...item,
  level: item.cefr,
  translation: item.arabic,
  phonetic: item.ipa,
}));

export default oxford3000Data;`;

const newExports = `export const normalizedOxford3000 = oxford3000Data.map((item) => ({
  ...item,
  level: item.cefr,
  translation: item.arabic,
  phonetic: item.ipa,
}));

// Provide normalized array directly on each oxford3000Data item for seamless compatibility
oxford3000Data.forEach((item) => {
  if (!item.level) item.level = item.cefr;
  if (!item.translation) item.translation = item.arabic;
  if (!item.phonetic) item.phonetic = item.ipa;
});

export default oxford3000Data;`;

content = content.replace(oldExports, newExports);
fs.writeFileSync('src/data/oxford3000Data.js', content, 'utf8');
console.log('Applied normalization compatibility to oxford3000Data.js');
