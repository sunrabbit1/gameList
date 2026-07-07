#!/usr/bin/env node
/**
 * 开发期工具：上传本地图片到 sm.ms，打印 URL + 可粘贴的 games.json 片段
 *
 * 用法：
 *   1. 申请 sm.ms API Token：https://smms.app/home/apitoken
 *   2. 在 .env.local 写入：SMMS_TOKEN=xxxxxxxx
 *   3. npm run upload:smms -- ./covers/eldenring.jpg
 *
 * 仅开发期使用，不会被打入生产产物
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

// 从 .env.local 加载 SMMS_TOKEN
function loadToken() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    console.error('❌ 未找到 .env.local 文件');
    console.error('   请在项目根目录创建 .env.local 并写入 SMMS_TOKEN=xxx');
    process.exit(1);
  }
  const content = readFileSync(envPath, 'utf8');
  const m = content.match(/^SMMS_TOKEN\s*=\s*(.+)$/m);
  if (!m) {
    console.error('❌ .env.local 中未找到 SMMS_TOKEN');
    process.exit(1);
  }
  return m[1].trim();
}

function die(msg) {
  console.error('❌', msg);
  process.exit(1);
}

// 从文件名生成 id
function toId(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const filepath = process.argv[2];
  if (!filepath) die('请提供图片路径，例如：npm run upload:smms -- ./covers/eldenring.jpg');

  const absPath = resolve(process.cwd(), filepath);
  if (!existsSync(absPath)) die(`文件不存在：${absPath}`);

  const token = loadToken();

  const fileBuf = readFileSync(absPath);
  if (fileBuf.length > 5 * 1024 * 1024) die('文件超过 5MB');

  // FormData 在 Node 18+ 全局可用
  const form = new FormData();
  const blob = new Blob([fileBuf]);
  form.append('smfile', blob, filepath.split('/').pop());

  let res;
  try {
    res = await fetch('https://smms.app/api/v2/upload', {
      method: 'POST',
      headers: { Authorization: token },
      body: form,
    });
  } catch (e) {
    die(`网络错误：${e.message}`);
  }

  const data = await res.json();
  if (!data.success) {
    console.error('❌ sm.ms 返回失败：');
    console.error('  code:', data.code);
    console.error('  message:', data.message);
    process.exit(1);
  }

  const { url, hash } = data.data;
  const filename = filepath.split('/').pop();
  const id = toId(filename);

  console.log('✅ 上传成功');
  console.log('URL:', url);
  console.log('Hash:', hash);
  console.log('');
  console.log('可直接粘贴到 public/games.json：');
  console.log('  {');
  console.log(`    "id": "${id}",`);
  console.log(`    "name": "${filename.replace(/\.[^.]+$/, '')}",`);
  console.log(`    "cover": "${url}",`);
  console.log(`    "year": ${new Date().getFullYear()},`);
  console.log(`    "studio": "TODO: 填入制作公司/制作人"`);
  console.log('  }');
}

main();
