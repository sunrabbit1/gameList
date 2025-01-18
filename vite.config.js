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
          // 使用 facadeModuleId 或者 fileName 来判断资源类型
          const filePath = assetInfo.facadeModuleId || assetInfo.fileName;

          if (typeof filePath === 'string' && /\.(png|jpe?g|gif|svg)$/.test(filePath)) {
            // 如果是图片文件，则不添加哈希值
            return `${filePath.match(/([^/\\]+)\.\w+$/)[1]}.${filePath.split('.').pop()}`;
          }
          // 对于其他资源，保留默认行为（包括哈希）
          return '[name]-[hash][extname]';
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
