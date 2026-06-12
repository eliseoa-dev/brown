import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// One-off config that produces a single, self-executing classic script (IIFE)
// with everything inlined — so the page runs when opened as a local file on
// iOS Safari, where ES-module entry points can be blocked.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2018',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    modulePreload: false,
    outDir: 'dist-single',
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: 'app.[ext]',
        manualChunks: undefined,
      },
    },
  },
})
