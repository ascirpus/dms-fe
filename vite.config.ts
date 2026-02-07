import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

const isDev = process.env.NODE_ENV !== 'production'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    ...(isDev
      ? [
          (await import('vite-plugin-vue-devtools')).default(),
          (await import('vite-plugin-mkcert')).default(),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    sourcemap: false,
    cssCodeSplit: true,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[hash].js',
        entryFileNames: 'assets/js/[hash].js',
        assetFileNames: 'assets/[ext]/[hash].[ext]',
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-primevue': ['primevue'],
          'vendor-pdf': ['vue-pdf-embed', 'vue3-pdfjs'],
          'vendor-auth': ['keycloak-js', '@josempgon/vue-keycloak'],
        },
      },
    },
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },
  server: {
    host: 'dms.internal',
    open: 'https://dms.internal:5173',
    proxy: {
      '/api': {
        target: 'http://api.dms.internal:8080',
        changeOrigin: true,
        secure: false,
      },
    }
  },
})