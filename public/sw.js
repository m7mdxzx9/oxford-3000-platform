/**
 * ============================================================================
 * File: public/sw.js
 * Purpose: Workbox Progressive Web App Service Worker
 * Connected To: main.jsx, manifest.json, offline.html
 * Description:
 *   Production-ready Service Worker powered by Workbox:
 *   - Cache-First strategy for static assets (JS, CSS, Web Fonts, Images, SVG).
 *   - Stale-While-Revalidate strategy for API/Dictionary lookups (FreeDict, Datamuse).
 *   - Offline fallback page mechanism for network failure navigations.
 * ============================================================================
 */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

if (workbox) {
  console.log('🚀 Workbox loaded successfully in Service Worker');

  // Force activate new SW immediately
  self.skipWaiting();
  workbox.core.clientsClaim();

  // 1. Cache-First for Web Fonts (Google Fonts, etc.)
  workbox.routing.registerRoute(
    ({ url }) =>
      url.origin === 'https://fonts.googleapis.com' ||
      url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-cache-v1',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Year
        }),
      ],
    })
  );

  // 2. Cache-First for Static Assets (CSS, JS, Web Workers, Images, SVG)
  workbox.routing.registerRoute(
    ({ request, url }) =>
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'worker' ||
      request.destination === 'image' ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.json'),
    new workbox.strategies.CacheFirst({
      cacheName: 'static-resources-cache-v1',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
        }),
      ],
    })
  );

  // 3. Stale-While-Revalidate for Dictionary & Lexicon APIs (Datamuse, FreeDict)
  workbox.routing.registerRoute(
    ({ url }) =>
      url.hostname.includes('api.dictionaryapi.dev') ||
      url.hostname.includes('api.datamuse.com'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'api-dictionary-cache-v1',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 Days
        }),
      ],
    })
  );

  // 4. Offline Fallback for Document Navigation
  const offlineFallbackHandler = async ({ event }) => {
    try {
      return await workbox.strategies.NetworkFirst({
        cacheName: 'pages-cache-v1',
      }).handle({ event });
    } catch (error) {
      const cache = await caches.open('offline-fallback-v1');
      const cachedOffline = await cache.match('./offline.html');
      return cachedOffline || Response.error();
    }
  };

  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    offlineFallbackHandler
  );

  // Precache offline fallback page during install
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('offline-fallback-v1').then((cache) => {
        return cache.addAll(['./offline.html', './index.html']);
      })
    );
  });
} else {
  console.warn('⚠️ Workbox failed to load. Falling back to basic cache handler.');
}
