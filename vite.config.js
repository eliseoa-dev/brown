import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base on build so the bundle works when served from a sub-path
// (e.g. GitHub Pages at /<repo>/), while dev stays at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
}))
