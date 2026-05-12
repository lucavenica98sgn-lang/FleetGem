import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 9999,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/@firebase') || id.includes('node_modules/firebase')) {
            if (id.includes('firestore')) return 'firebase-firestore';
            if (id.includes('app')) return 'firebase-app';
            return 'firebase-other';
          }
        },
      },
    },
  },
})
