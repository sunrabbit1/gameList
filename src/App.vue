<script setup>
import { ref, computed } from 'vue';
import { useGames } from './composables/useGames.js';
import AppHeader from './components/AppHeader.vue';
import SearchBar from './components/SearchBar.vue';
import GameGrid from './components/GameGrid.vue';
import MonthSection from './components/MonthSection.vue';
import { ElAlert, ElButton } from 'element-plus';

// 全局状态
const activeYear = ref('all');
const searchQuery = ref('');

// 数据加载
const { games, loading, error, years, reload } = useGames();

// 识别 DLC / DEMO 后缀的游戏：有本体时隐藏衍生版
const DLC_DEMO_SUFFIX = /(DLC|DEMO)$/;
const isDlcOrDemo = (name) => DLC_DEMO_SUFFIX.test(name);
const stripDlcDemo = (name) => name.replace(DLC_DEMO_SUFFIX, '').trim();

// 特殊名称别名映射：仅作用于"全部游戏"tab 的展示与搜索，年合集保持原名
const NAME_ALIASES = {
  '神之天平DLC': '神之天平',
};
const applyAlias = (name) => NAME_ALIASES[name] ?? name;

// "全部游戏" tab：搜索 + 按 name 去重 + DLC/DEMO 隐藏 + 按 studio 升序
const sortedGames = computed(() => {
  // 先做别名归一化（仅影响"全部游戏"tab 的展示与搜索）
  let list = games.value.map((g) => ({ ...g, name: applyAlias(g.name) }));
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter((g) => g.name.toLowerCase().includes(q));
  }
  // 按 name 去重，保留首次出现（最早一次游玩）
  const seen = new Set();
  list = list.filter((g) => {
    if (seen.has(g.name)) return false;
    seen.add(g.name);
    return true;
  });
  // 收集所有"本体"游戏名
  const baseNames = new Set(
    list.filter((g) => !isDlcOrDemo(g.name)).map((g) => g.name)
  );
  // 隐藏有本体的 DLC / DEMO
  list = list.filter((g) => {
    if (!isDlcOrDemo(g.name)) return true;
    const base = stripDlcDemo(g.name);
    return !baseNames.has(base);
  });
  return [...list].sort((a, b) =>
    (a.studio ?? '').localeCompare(b.studio ?? '', 'zh-Hans-CN')
  );
});

// 单年份游戏 -> 月份分桶
function groupByMonth(yearGames) {
  const buckets = {};
  const unknown = [];
  for (const g of yearGames) {
    let m = g.month;
    if (m !== null && m !== undefined) {
      if (!Number.isInteger(m) || m < 1 || m > 12) {
        console.warn('[App] 非法的 month 字段，视为 null：', g);
        m = null;
      }
    }
    if (m === null || m === undefined) {
      unknown.push(g);
    } else {
      (buckets[m] ||= []).push(g);
    }
  }
  const sections = [];
  for (let i = 1; i <= 12; i++) {
    if (buckets[i]?.length > 0) {
      sections.push({
        label: `${i} 月`,
        games: buckets[i].slice().sort((a, b) =>
          (a.studio ?? '').localeCompare(b.studio ?? '', 'zh-Hans-CN')
        ),
      });
    }
  }
  if (unknown.length > 0) {
    sections.push({
      label: '月份未知',
      games: unknown.slice().sort((a, b) =>
        (a.studio ?? '').localeCompare(b.studio ?? '', 'zh-Hans-CN')
      ),
    });
  }
  return sections;
}

// 一次性预计算所有年份的分组（v-show 切换时 0 开销）
const groupedByYear = computed(() => {
  const result = {};
  for (const year of years.value) {
    result[year] = groupByMonth(games.value.filter((g) => g.year === year));
  }
  return result;
});

// 每年合集的游戏总数（按 name 去重，月份展示仍保留所有重复项）
const countByYear = computed(() => {
  const result = {};
  for (const year of years.value) {
    const sections = groupedByYear.value[year] || [];
    const seen = new Set();
    let count = 0;
    for (const s of sections) {
      for (const g of s.games) {
        if (!seen.has(g.name)) {
          seen.add(g.name);
          count++;
        }
      }
    }
    result[year] = count;
  }
  return result;
});
</script>

<template>
  <!-- 错误状态 -->
  <div v-if="error" class="app-error">
    <el-alert
      title="数据加载失败"
      type="error"
      :closable="false"
      show-icon
    >
      <p>请检查 <code>public/games.json</code> 是否存在或格式正确。</p>
      <p class="error-detail">错误详情：{{ error }}</p>
      <el-button type="primary" size="small" @click="reload">重试</el-button>
    </el-alert>
  </div>

  <!-- 正常状态：header (sticky) + main 简单堆叠 -->
  <template v-else>
    <AppHeader
      :years="years"
      v-model:activeYear="activeYear"
    />
    <SearchBar v-show="activeYear === 'all'" v-model="searchQuery" />
    <main class="app-main" v-loading="loading">
      <div class="panels">
        <!-- 全部游戏：常驻 DOM，grid 1/1 堆叠 + 渐隐渐显 -->
        <div class="tab-panel" :class="{ active: activeYear === 'all' }">
          <h1 class="count-title">游玩过的游戏数量：{{ sortedGames.length }}</h1>
          <GameGrid :games="sortedGames" :searchQuery="searchQuery" />
        </div>

        <!-- 年份 tab：预渲染所有年份，常驻 DOM，grid 1/1 堆叠 + 渐隐渐显 -->
        <div
          v-for="year in years"
          :key="year"
          class="tab-panel"
          :class="{ active: activeYear === year }"
        >
          <h1 class="count-title">游玩过的游戏数量：{{ countByYear[year] }}</h1>
          <MonthSection
            v-for="(section, i) in groupedByYear[year]"
            :key="`${year}-${i}`"
            :monthLabel="section.label"
            :games="section.games"
          />
          <div v-if="groupedByYear[year].length === 0" class="empty">
            <el-empty description="该年份还没有游戏" />
          </div>
        </div>
      </div>
    </main>
  </template>
</template>

<style scoped>
.app-error {
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
}
.error-detail {
  color: #909399;
  font-size: 12px;
  margin: 4px 0 8px;
}
.app-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 40px;
  display: block;
  background: rgba(255, 255, 255, 0.78);  /* 半透明白色蒙版，背景图可透出 */
  border-radius: 8px;
  margin-top: 16px;
  margin-bottom: 24px;
}
@media (max-width: 600px) {
  .app-main {
    padding: 12px;
  }
}
.empty {
  padding: 60px 0;
  text-align: center;
}
/* panels 容器：grid 1/1 堆叠所有面板。
   非激活面板 visibility:hidden + position:absolute 脱离布局，
   容器高度 = 激活面板自身高度（不再被最长的全部游戏 tab 撑高） */
.panels {
  display: grid;
}
.tab-panel {
  grid-area: 1 / 1;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.25s ease;
  min-width: 0;
}
.tab-panel.active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  position: relative;             /* 参与 .panels 网格高度计算 */
}
.count-title {
  text-align: center;
  font-weight: 700;
  font-size: 24px;
  margin: 24px 0 20px;
  color: #303133;
  letter-spacing: 1px;
}
@media (max-width: 600px) {
  .count-title {
    font-size: 18px;
    margin: 16px 0 12px;
    letter-spacing: 0.5px;
  }
}
</style>
