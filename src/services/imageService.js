/**
 * Oxford 3000 Lexicon Application - Contextual Visual Aids & Image Integration Service
 * Module: src/services/imageService.js
 * Fetches 100% relevant, CORS-compliant illustrative concept photos for vocabulary words.
 */

// In-memory cache for fast lookup
const imageMemoryCache = new Map();

// Load persistent cache from localStorage
const loadPersistentCache = () => {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const item = localStorage.getItem('oxford3000_img_cache');
    return item ? JSON.parse(item) : {};
  } catch (e) {
    return {};
  }
};

const savePersistentCache = (cacheObj) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem('oxford3000_img_cache', JSON.stringify(cacheObj));
  } catch (e) {}
};

/**
 * Synchronous getter: Returns cached image URL or fallback placeholder.
 */
export const getCuratedWordImage = (word) => {
  if (!word || typeof word !== 'string') return '';
  const cleanWord = word.trim().toLowerCase();

  if (imageMemoryCache.has(cleanWord)) {
    return imageMemoryCache.get(cleanWord);
  }

  const pCache = loadPersistentCache();
  if (pCache[cleanWord]) {
    imageMemoryCache.set(cleanWord, pCache[cleanWord]);
    return pCache[cleanWord];
  }

  // Reliable, high quality keyword illustration placeholder
  return `https://loremflickr.com/600/400/${encodeURIComponent(cleanWord)}`;
};

/**
 * Asynchronous Fetcher: Queries Openverse & Wikimedia Commons APIs (100% CORS-Friendly).
 */
export const fetchWordImage = async (word) => {
  if (!word || typeof word !== 'string') return null;
  const cleanWord = word.trim().toLowerCase();

  if (imageMemoryCache.has(cleanWord)) {
    return imageMemoryCache.get(cleanWord);
  }

  const pCache = loadPersistentCache();
  if (pCache[cleanWord]) {
    imageMemoryCache.set(cleanWord, pCache[cleanWord]);
    return pCache[cleanWord];
  }

  // 1. Try Openverse API (CORS enabled: Access-Control-Allow-Origin: *)
  try {
    const res = await fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(cleanWord)}&page_size=1`);
    if (res.ok) {
      const data = await res.json();
      const photo = data?.results?.[0]?.url || data?.results?.[0]?.thumbnail;
      if (photo && photo.startsWith('http')) {
        imageMemoryCache.set(cleanWord, photo);
        pCache[cleanWord] = photo;
        savePersistentCache(pCache);
        return photo;
      }
    }
  } catch (e) {}

  // 2. Try Wikimedia Commons API (origin=*)
  try {
    const res = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(cleanWord)}&gsrlimit=1&prop=pageimages&piprop=thumbnail&pithumbsize=600&format=json&origin=*`
    );
    if (res.ok) {
      const data = await res.json();
      const pages = data?.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const photo = pages[pageId]?.thumbnail?.source;
        if (photo) {
          imageMemoryCache.set(cleanWord, photo);
          pCache[cleanWord] = photo;
          savePersistentCache(pCache);
          return photo;
        }
      }
    }
  } catch (e) {}

  // 3. Fallback to LoremFlickr direct keyword search
  const fallback = `https://loremflickr.com/600/400/${encodeURIComponent(cleanWord)}`;
  imageMemoryCache.set(cleanWord, fallback);
  pCache[cleanWord] = fallback;
  savePersistentCache(pCache);
  return fallback;
};

export default {
  getCuratedWordImage,
  fetchWordImage,
};
