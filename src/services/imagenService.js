import { DEFAULT_GEMINI_KEY } from './geminiService.js';

export const IMAGEN_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict';

const getApiKey = (providedKey) => {
  if (providedKey && providedKey.trim()) return providedKey.trim();
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem('oxford3000_gemini_api_key') || localStorage.getItem('gemini_api_key');
    if (stored && stored.trim()) return stored.trim();
  }
  return DEFAULT_GEMINI_KEY;
};

/**
 * Generates a 3D visual memory illustration for a vocabulary word using Imagen 4.0 API.
 * Falls back to high-quality SVG/CSS conceptual visualizer if API or quota is restricted.
 *
 * @param {string} word - Target vocabulary word
 * @param {string} conceptPrompt - Additional contextual prompt
 * @param {string} apiKey - Gemini / Google AI API key
 * @returns {Promise<string|null>} Data URL or SVG string
 */
export const generateVisualIllustration = async (word, conceptPrompt = '', apiKey = '') => {
  if (!word) return null;
  const key = getApiKey(apiKey);
  const promptText = `A vibrant 3D glassmorphic digital art illustration representing the English vocabulary concept "${word}". ${conceptPrompt || ''}. High quality, minimal dark background, 3D icon style.`;

  try {
    const response = await fetch(`${IMAGEN_API_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: promptText }],
        parameters: { sampleCount: 1, aspectRatio: '1:1' }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
      if (b64) return `data:image/png;base64,${b64}`;
    }
  } catch (err) {
    console.warn('Imagen 4.0 API error, using SVG concept fallback:', err);
  }

  // High quality SVG concept fallback for visual memory
  const colors = [
    'from-cyan-500 to-blue-600',
    'from-emerald-400 to-teal-600',
    'from-amber-400 to-orange-600',
    'from-purple-500 to-indigo-600',
    'from-rose-500 to-pink-600'
  ];
  const color = colors[Math.abs(word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length];

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#060d21"/>
          <stop offset="100%" stop-color="#0f2042"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" rx="32" fill="url(#grad)"/>
      <circle cx="200" cy="180" r="90" fill="none" stroke="rgba(6,182,212,0.3)" stroke-width="4" stroke-dasharray="8 8"/>
      <text x="50%" y="45%" text-anchor="middle" dominant-baseline="middle" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="44" font-weight="900" letter-spacing="-1">${word}</text>
      <text x="50%" y="75%" text-anchor="middle" dominant-baseline="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="16" font-weight="600">3D Visual Memory Concept</text>
    </svg>
  `)}`;
};

export default {
  generateVisualIllustration,
  IMAGEN_API_URL
};
