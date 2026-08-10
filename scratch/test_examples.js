import { oxford3000Data } from '../src/data/oxford3000.js';

let placeholderCount = 0;
oxford3000Data.forEach(item => {
  if (item.example && item.example.startsWith('Example sentence with ')) {
    placeholderCount++;
  }
});

console.log(`Total words: ${oxford3000Data.length}`);
console.log(`Placeholder examples count: ${placeholderCount}`);
