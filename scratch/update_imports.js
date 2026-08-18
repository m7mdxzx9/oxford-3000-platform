import fs from 'fs';
import path from 'path';

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const allFiles = [...getFiles('src'), ...getFiles('test')];
const codeFiles = allFiles.filter((f) => f.endsWith('.js') || f.endsWith('.jsx'));

let updatedCount = 0;

codeFiles.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace /data/oxford3000' or /data/oxford3000.js' with /data/oxford3000Data' or /data/oxford3000Data.js'
  if (content.includes('/data/oxford3000')) {
    const updated = content.replace(
      /from\s+(['"])(.*\/data\/)oxford3000(?:\.js)?\1/g,
      (match, quote, prefix) => {
        const ext = match.includes('.js') ? '.js' : '';
        return `from ${quote}${prefix}oxford3000Data${ext}${quote}`;
      }
    );
    if (updated !== content) {
      fs.writeFileSync(file, updated, 'utf8');
      console.log(`Updated imports in: ${file}`);
      updatedCount++;
    }
  }
});

console.log(`Total files updated: ${updatedCount}`);
