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

const allFiles = getFiles('src');
const codeFiles = allFiles.filter((f) => f.endsWith('.js') || f.endsWith('.jsx'));

const usageMap = {};
codeFiles.forEach((f) => {
  const rel = path.relative('src', f).replace(/\\/g, '/');
  usageMap[rel] = { file: f, importedBy: [] };
});

codeFiles.forEach((f) => {
  const content = fs.readFileSync(f, 'utf8');
  Object.keys(usageMap).forEach((rel) => {
    if (usageMap[rel].file === f) return;
    const base = path.basename(rel, path.extname(rel));
    const importRegex = new RegExp(`['"][^'"]*${base}(?:\\.[a-z]+)?['"]`);
    if (importRegex.test(content)) {
      usageMap[rel].importedBy.push(path.relative('src', f).replace(/\\/g, '/'));
    }
  });
});

console.log('=== UNIMPORTED OR SPECIAL FILES ===');
Object.entries(usageMap).forEach(([rel, data]) => {
  if (data.importedBy.length === 0) {
    console.log(`[0 IMPORTS]: ${rel}`);
  } else {
    console.log(`[${data.importedBy.length} imports]: ${rel} <- ${data.importedBy.join(', ')}`);
  }
});
