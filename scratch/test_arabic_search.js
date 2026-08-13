function normalizeArabicText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '') // Remove Harakat & Tatweel
    .replace(/[أإآٱ]/g, 'ا')                    // Normalize Alef
    .replace(/ة/g, 'ه')                        // Normalize Taa Marbouta
    .replace(/ى/g, 'ي')                        // Normalize Yaa
    .toLowerCase()
    .trim();
}

const itemArabic = 'قُدْرَة، مَقْدِرَة';
const searchQuery1 = 'قدرة';
const searchQuery2 = 'مقدرة';
const searchQuery3 = 'قدره';
const searchQuery4 = 'أداة'; // "أَدَاةُ تَنْكِير"

console.log('Normalized Item:', normalizeArabicText(itemArabic));
console.log('Match "قدرة":', normalizeArabicText(itemArabic).includes(normalizeArabicText(searchQuery1)));
console.log('Match "مقدرة":', normalizeArabicText(itemArabic).includes(normalizeArabicText(searchQuery2)));
console.log('Match "قدره":', normalizeArabicText(itemArabic).includes(normalizeArabicText(searchQuery3)));
console.log('Match "اداة" on "أَدَاةُ":', normalizeArabicText('أَدَاةُ تَنْكِير').includes(normalizeArabicText('اداة')));
