/**
 * ============================================================================
 * File: src/main.jsx
 * Purpose: Application Entry Point & Workbox Service Worker Registrar
 * Connected To: App.jsx, public/sw.js
 * Description:
 *   Initializes the React root and registers the Progressive Web App Service
 *   Worker using Workbox Window with lifecycle event listeners and diagnostic logs.
 * ============================================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Workbox } from 'workbox-window';
import App from './App.jsx';
import './index.css';

// Register Workbox Service Worker for offline PWA functionality
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  const wb = new Workbox('./sw.js');

  wb.addEventListener('installed', (event) => {
    if (event.isUpdate) {
      console.log('🔄 New update available! Refreshing cache...');
    } else {
      console.log('🚀 Service Worker registered successfully: App is ready for 100% offline usage');
    }
  });

  wb.addEventListener('activated', () => {
    console.log('⚡ Service Worker activated and controlling clients.');
  });

  wb.register().catch((err) => {
    console.warn('⚠️ Service Worker registration skipped or failed:', err);
  });
} else if ('serviceWorker' in navigator) {
  // In dev mode, register directly if sw.js exists
  navigator.serviceWorker
    .register('./sw.js')
    .then((reg) => {
      console.log('🚀 Service Worker registered in development mode:', reg.scope);
    })
    .catch((err) => {
      console.warn('⚠️ Service Worker registration skipped in dev:', err);
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
