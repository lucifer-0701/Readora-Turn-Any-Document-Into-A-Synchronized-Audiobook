import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1000,
    modulePreload: {
      resolveDependencies(filename, deps, { hostId, hostType }) {
        // Exclude heavy non-critical manual chunks from eager startup preloading
        return deps.filter(dep => !dep.includes('charts') && !dep.includes('motion') && !dep.includes('pdf') && !dep.includes('ocr'));
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'react';
            }
            if (id.includes('pdfjs-dist')) {
              return 'pdf';
            }
            if (id.includes('tesseract.js') || id.includes('tesseract.js-core')) {
              return 'ocr';
            }
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-')) {
              return 'charts';
            }
            if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
              return 'motion';
            }
          }
        }
      }
    }
  }
})
