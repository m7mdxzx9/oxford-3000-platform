/**
 * Pexels API, Unsplash & Procedural SVG Illustrative Vocabulary Image Service.
 */

import { StorageAdapter, STORAGE_KEYS } from './storageAdapter.js';

export const PEXELS_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PEXELS_API_KEY) ||
  StorageAdapter.getString(STORAGE_KEYS.PEXELS_API_KEY, '') ||
  '';

const imageCache = new Map();

/**
 * Fetch a high-quality illustrative photo for a vocabulary word.
 */
export async function getWordImageUrl(word) {
  if (!word || typeof word !== 'string') return null;
  const cleanWord = word.trim().toLowerCase();

  if (imageCache.has(cleanWord)) return imageCache.get(cleanWord);

  // 1. Try Pexels API
  if (PEXELS_API_KEY) {
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
  }

  // 2. Unsplash Fallback URL
  const unsplashFallback = `https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80`;
  imageCache.set(cleanWord, unsplashFallback);
  return unsplashFallback;
}

export async function generateVisualIllustration(word = '', context = '') {
  const safeWord = String(word).trim();
  const safeContext = String(context).trim();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)" rx="24"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="900">${safeWord}</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="sans-serif" font-size="16">${safeContext || 'Oxford 3000'}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const fetchWordImage = getWordImageUrl;
export const getCuratedWordImage = () => null;

export default {
  getWordImageUrl,
  fetchWordImage,
  getCuratedWordImage,
  generateVisualIllustration,
};
