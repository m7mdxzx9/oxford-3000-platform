import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('src/data/oxford3000.js') || id.includes('src/data/oxford3000Data.js')) {
            return 'lexicon-dataset';
          }


          if (id.includes('src/components/DualPlayerHub') || id.includes('src/components/dual-player/')) {
            return 'dual-player-hub';
          }
          if (id.includes('src/components/Storyteller') || id.includes('src/components/PersonalTutor')) {
            return 'ai-studios';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
