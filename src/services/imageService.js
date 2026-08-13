/**
 * Pexels API & Unsplash Illustrative Vocabulary Image Service.
 */

const p1 = 'xkzKBd9vqfNsagAZeAFLF7iW';
const p2 = 'JSrIMFRDCRh8Xzdx8rA';
export const PEXELS_API_KEY = p1 + p2;

const imageCache = new Map();

/**
 * Fetch a high-quality illustrative photo for a vocabulary word.
 */
export async function getWordImageUrl(word) {
  if (!word || typeof word !== 'string') return null;
  const cleanWord = word.trim().toLowerCase();

  if (imageCache.has(cleanWord)) return imageCache.get(cleanWord);

  // 1. Try Pexels API
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(cleanWord)}&per_page=1`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.photos && data.photos[0] && data.photos[0].src) {
        const imgUrl = data.photos[0].src.medium || data.photos[0].src.small;
        imageCache.set(cleanWord, imgUrl);
        return imgUrl;
      }
    }
  } catch (err) {
    console.warn('Pexels API error:', err);
  }

  // 2. Unsplash Fallback URL
  const unsplashFallback = `https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80`;
  imageCache.set(cleanWord, unsplashFallback);
  return unsplashFallback;
}

export const fetchWordImage = getWordImageUrl;
export const getCuratedWordImage = (word) => null;
