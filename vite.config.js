import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import fs from 'fs'
import path from 'path'

// GitHub Pages 项目页 base 路径；本地开发时不生效
const base = process.env.GITHUB_PAGES ? '/gameList/' : './';

export default defineConfig({
  base,
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    {
      name: 'add-games-api',
      configureServer(server) {
        server.middlewares.use('/api/games', (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end('Method Not Allowed');
            return;
          }

          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              // 预期格式：{ game: { name, cover, studio }, record: { year, month } }
              const { game, record } = payload;
              if (!game || !game.name || !game.cover) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'game.name and game.cover are required' }));
                return;
              }

              const jsonPath = path.resolve(process.cwd(), 'public', 'games.json');
              const dir = path.dirname(jsonPath);
              if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

              let data;
              if (!fs.existsSync(jsonPath)) {
                data = { games: [], records: [] };
                fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
              } else {
                try {
                  data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
                  if (!Array.isArray(data.games)) data.games = [];
                  if (!Array.isArray(data.records)) data.records = [];
                } catch {
                  data = { games: [], records: [] };
                }
              }

              // 查找是否已存在同名游戏（可按需要扩展为 name + studio）
              let existing = data.games.find(g => g.name === game.name);
              let gameId;
              if (existing) {
                gameId = existing.id;
              } else {
                gameId = `game_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                data.games.push({
                  id: gameId,
                  name: game.name,
                  cover: game.cover,
                  studio: game.studio || game.name,
                });
              }

              // 追加记录
              data.records.push({
                gameId,
                year: record.year !== undefined ? record.year : null,
                month: record.month !== undefined ? record.month : null,
              });

              fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
              console.log('[api/games] 添加成功，游戏ID:', gameId);

              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, gameId, record }));
            } catch (err) {
              console.error('[api/games] 错误:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message || '服务器内部错误' }));
            }
          });
        });
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
