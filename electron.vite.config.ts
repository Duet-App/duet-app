import { defineConfig } from 'electron-vite'
import { resolve } from 'path'
import { fileURLToPath } from "node:url";
import { VitePWA } from 'vite-plugin-pwa';
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'

const filesNeedToExclude = ["src/components/ReloadPrompt.tsx"];

const filesPathToExclude = filesNeedToExclude.map((src) => {
  return fileURLToPath(new URL(src, import.meta.url));
});

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main.js')
        },
      }
    }
  },
  renderer: {
    root: '.',
    plugins: [
      react(),
      legacy(),
      VitePWA({
        registerType: 'prompt',
        devOptions: {
          enabled: true
        },
        workbox: {
          globPatterns: ['**/*']
        },
        includeAssets: ['**/*']
      })
    ],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html')
        },
      }
    },
    define: {
      global: {}
    },
    base: './',
    }
})