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
            res.statusCode = 405
            res.end('Method Not Allowed')
            return
          }

          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const newGame = JSON.parse(body)
              // 必填字段校验
              if (!newGame.name || !newGame.cover) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'name and cover are required' }))
                return
              }

              // 1. 确定文件路径（项目根目录下的 public/games.json）
              const jsonPath = path.resolve(process.cwd(), 'public', 'games.json')

              // 2. 确保目录存在
              const dir = path.dirname(jsonPath)
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
              }

              // 3. 读取或初始化文件
              let data
              if (!fs.existsSync(jsonPath)) {
                // 如果文件不存在，创建默认结构
                data = { games: [] }
                fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2))
              } else {
                try {
                  const content = fs.readFileSync(jsonPath, 'utf-8')
                  data = JSON.parse(content)
                } catch (parseErr) {
                  // 如果文件内容损坏，重置为默认
                  data = { games: [] }
                }
              }

              if (!Array.isArray(data.games)) {
                data.games = []
              }

              // 4. 追加新游戏
              data.games.push(newGame)

              // 5. 写回文件
              fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2))

              res.statusCode = 200
              res.end(JSON.stringify({ success: true, game: newGame }))

            } catch (err) {
              console.error('[api/games] 错误:', err)
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message || '服务器内部错误' }))
            }
          })
        })
      }
    }
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
