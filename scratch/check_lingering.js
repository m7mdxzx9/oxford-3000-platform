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

let lingering = [];
codeFiles.forEach((f) => {
  const content = fs.readFileSync(f, 'utf8');
  if (/['"][^'"]*\/oxford3000['"]/.test(content)) {
    lingering.push(f);
  }
});

console.log('Lingering old oxford3000 imports (should be empty):', lingering);
