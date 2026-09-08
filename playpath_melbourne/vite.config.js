import {
  fileURLToPath,
  URL,
} from 'node:url'

import {
  defineConfig,
} from 'vite'

import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(
        new URL('./src', import.meta.url),
      ),
    },
  },

  build: {
    sourcemap: false,
  },

  server: {
    headers: {
      'X-Content-Type-Options':
        'nosniff',

      'Referrer-Policy':
        'strict-origin-when-cross-origin',

      'Permissions-Policy':
        'camera=(), microphone=(), geolocation=()',

      'X-Frame-Options':
        'DENY',
    },
  },

  preview: {
    headers: {
      'X-Content-Type-Options':
        'nosniff',

      'Referrer-Policy':
        'strict-origin-when-cross-origin',

      'Permissions-Policy':
        'camera=(), microphone=(), geolocation=()',

      'X-Frame-Options':
        'DENY',
    },
  },
})