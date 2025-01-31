import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue()
  ],
  base: '/gameList/',
  build: {
    rollupOptions: {
      output: {
        // 移除图片和字体等资源的哈希值
        // assetFileNames: '[name][extname]'
        assetFileNames: (assetInfo) => {
            if (assetInfo.name && /\.(png|jpe?g|gif|svg)$/.test(assetInfo.name)) {
              return `assets/[name][extname]`; // 仅适用于图片文件
            }
            return '[name]-[hash][extname]'; // 其他资源保持哈希
          }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  }
});
