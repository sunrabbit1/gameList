<script setup>
const props = defineProps({
  years: { type: Array, required: true },        // 数字数组（降序）
  activeYear: { type: [String, Number], default: 'all' },
});

const emit = defineEmits(['update:activeYear']);

// 全部游戏 + 各年份合集：组合成 [{ key, label }]
const tabs = (props) => [
  { key: 'all', label: '全部游戏' },
  ...props.years.map((y) => ({ key: String(y), label: `${y} 年合集` })),
];

function select(key) {
  emit('update:activeYear', key === 'all' ? 'all' : Number(key));
}
</script>

<template>
  <header class="app-header">
    <nav class="year-nav">
      <button
        v-for="t in tabs(props)"
        :key="t.key"
        type="button"
        class="tab-item"
        :class="{ active: String(activeYear) === t.key }"
        @click="select(t.key)"
      >
        {{ t.label }}
      </button>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #1a1a2e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  height: 60px;                    /* 固定高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.year-nav {
  display: flex;                  /* 横向排列 */
  align-items: center;
  gap: 0;
  padding: 0 40px;
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}
.year-nav::-webkit-scrollbar { display: none; }

.tab-item {
  flex-shrink: 0;
  background: transparent;
  border: none;
  font-size: 20px;
  font-weight: 600;
  padding: 0 32px;
  height: 60px;
  line-height: 60px;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: color 0.2s;
}
.tab-item:hover { color: #fff; }
.tab-item.active { color: #fff; }

@media (max-width: 600px) {
  .app-header { height: 48px; }
  .year-nav { padding: 0 12px; }
  .tab-item {
    font-size: 16px;
    font-weight: 600;
    padding: 0 14px;
    height: 48px;
    line-height: 48px;
    letter-spacing: 0.5px;
  }
}
</style>
