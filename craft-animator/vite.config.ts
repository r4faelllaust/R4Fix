import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true,
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/store/EditorContext.tsx',
        './src/render/drawDocument.ts',
      ],
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    modulePreload: { polyfill: false },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'jszip'],
  },
})
