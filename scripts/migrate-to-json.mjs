// 一次性脚本：将 3 个 JS 数据文件合并到 public/games.json
// 设计文档：docs/superpowers/specs/2026-07-06-data-migration-to-json-design.md
// 可重入：每次运行覆盖 games.json，结果稳定

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(SCRIPT_DIR, '../public');

const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

/**
 * 解析 "export const list = <data>" 形式的 JS 文件
 * 用 Function 评估避免 ESM/单引号问题（本地可信数据）
 */
function parseListExport(content, filePath) {
  const start = content.indexOf('export const list');
  if (start === -1) throw new Error(`Cannot find list export in ${filePath}`);
  const eq = content.indexOf('=', start);
  if (eq === -1) throw new Error(`Cannot find = in ${filePath}`);
  let i = eq + 1;
  while (i < content.length && /\s/.test(content[i])) i++;
  const rest = content.slice(i).replace(/;?\s*$/, '');
  return new Function(`return (${rest});`)();
}

async function readList(filePath) {
  const abs = path.join(PUBLIC_DIR, filePath);
  const content = await fs.readFile(abs, 'utf8');
  return parseListExport(content, abs);
}

// 1. 读取 3 个数据源
const [listAll, list2024, list2025] = await Promise.all([
  readList('index.js'),
  readList('index-2024.js'),
  readList('index-2025.js'),
]);

console.log(`Read: index.js=${listAll.length} entries, index-2024.js=${Object.keys(list2024).length} months, index-2025.js=${Object.keys(list2025).length} months`);

// 2. 构建 url → { studio, name } 映射（来自 index.js）
const urlMap = new Map();
for (const { url, gameName } of listAll) {
  const idx = gameName.indexOf('_');
  const info = idx === -1
    ? { studio: gameName, name: gameName }
    : { studio: gameName.slice(0, idx), name: gameName.slice(idx + 1) };
  urlMap.set(url, info);
}

const usedUrls = new Set();
const games = [];

// 3. 处理 year 文件
function processYear(yearList, yearNum) {
  let count = 0;
  for (const [monthKey, items] of Object.entries(yearList)) {
    const month = MONTHS.indexOf(monthKey) + 1;
    if (month === 0) {
      console.warn(`  [WARN] unknown month key: ${monthKey}`);
      continue;
    }
    for (const { fileName, gameName, url } of items) {
      usedUrls.add(url);
      const urlInfo = urlMap.get(url);
      games.push({
        id: `${fileName}__${yearNum}-${month}`,
        name: gameName,
        cover: url,
        year: yearNum,
        month,
        studio: urlInfo ? urlInfo.studio : null,
      });
      count++;
    }
  }
  return count;
}

const count2024 = processYear(list2024, 2024);
const count2025 = processYear(list2025, 2025);
console.log(`Processed: 2024=${count2024} entries, 2025=${count2025} entries`);

// 4. 处理 index.js 中未在 year 文件出现的 url → 月份未知
let countUnknown = 0;
for (const { fileName, gameName, url } of listAll) {
  if (usedUrls.has(url)) continue;
  const idx = gameName.indexOf('_');
  const studio = idx === -1 ? gameName : gameName.slice(0, idx);
  const name = idx === -1 ? gameName : gameName.slice(idx + 1);
  games.push({
    id: `${fileName}__unknown`,
    name,
    cover: url,
    year: null,
    month: null,
    studio,
  });
  countUnknown++;
}
console.log(`Processed: unknown=${countUnknown} entries`);

// 5. 排序：year asc (null 末尾) → month asc (null 末尾) → id asc
games.sort((a, b) => {
  const yA = a.year ?? 9999;
  const yB = b.year ?? 9999;
  if (yA !== yB) return yA - yB;
  const mA = a.month ?? 99;
  const mB = b.month ?? 99;
  if (mA !== mB) return mA - mB;
  return a.id.localeCompare(b.id);
});

// 6. 写文件
const output = JSON.stringify({ games }, null, 2) + '\n';
const outPath = path.join(PUBLIC_DIR, 'games.json');
await fs.writeFile(outPath, output, 'utf8');
console.log(`\nWrote ${games.length} games to ${outPath}`);
console.log(`By year:`);
const byYear = {};
for (const g of games) {
  const key = g.year ?? 'unknown';
  byYear[key] = (byYear[key] || 0) + 1;
}
for (const [k, v] of Object.entries(byYear).sort()) {
  console.log(`  ${k}: ${v}`);
}
