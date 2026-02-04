import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss(), mkcert()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure Vite correctly processes and includes assets
    assetsInlineLimit: 4096 // 4kb - files smaller than this will be inlined as base64
  },
  server: {
    host: 'dms.internal',
    host: 'dms.internal',
    open: 'https://dms.internal:5173',
    proxy: {
      '/api': {
        target: 'http://api.dms.internal:8080',
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, '') // The local API has a slightly different path
      }
    }
  },
})