import fs from 'fs';

let content = fs.readFileSync('src/data/oxford3000Data.js', 'utf8');

// Split lines
let lines = content.split(/\r?\n/);
console.log('Total lines before:', lines.length);

// Find index of 'export const OXFORD_3000 = oxford3000Data;' at the end
const lastIdx = lines.lastIndexOf('export const OXFORD_3000 = oxford3000Data;');
console.log('Last index of OXFORD_3000:', lastIdx);

if (lastIdx > 0 && lines.indexOf('export const OXFORD_3000 = oxford3000Data;') !== lastIdx) {
  lines.splice(lastIdx, 1);
}

fs.writeFileSync('src/data/oxford3000Data.js', lines.join('\n'), 'utf8');
console.log('Cleaned oxford3000Data.js! Total lines now:', lines.length);
