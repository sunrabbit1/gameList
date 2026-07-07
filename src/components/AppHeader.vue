<script setup>
import { computed } from 'vue';

const props = defineProps({
  years: { type: Array, required: true },        // 数字数组（降序）
  activeYear: { type: [String, Number], default: 'all' },
});

const emit = defineEmits(['update:activeYear']);

// el-tabs 的 modelValue 用字符串；内部用 'all' 或数字转字符串
const tabValue = computed({
  get: () => String(props.activeYear),
  set: (v) => emit('update:activeYear', v === 'all' ? 'all' : Number(v)),
});
</script>

<template>
  <header class="app-header">
    <el-tabs v-model="tabValue" class="year-tabs">
      <el-tab-pane label="全部游戏" name="all" />
      <el-tab-pane
        v-for="y in years"
        :key="y"
        :label="`${y} 年合集`"
        :name="String(y)"
      />
    </el-tabs>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #1a1a2e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;  /* 让 el-tabs 内部居中 */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}
/* 让 tabs 容器居中 */
.app-header :deep(.el-tabs__header) {
  margin: 0 auto;
  display: table;  /* shrink-wrap 后可被 text-align center 居中 */
}
.app-header :deep(.el-tabs__header),
.app-header :deep(.el-tabs__nav-wrap),
.app-header :deep(.el-tabs__nav) {
  background: transparent;
  border: none;
}
/* 去掉整条灰线下划线 */
.app-header :deep(.el-tabs__nav-wrap::after) {
  display: none;
}
/* 去掉选中状态下划线 */
.app-header :deep(.el-tabs__active-bar) {
  display: none;
}
.year-tabs {
  width: auto;
  display: inline-block;
  padding: 0 40px;
  background: transparent;
}
/* 加大 tab 标签：字号 / 内边距 / 行高 */
.app-header :deep(.el-tabs__item) {
  font-size: 20px;
  font-weight: 600;
  padding: 0 32px;
  height: 60px;
  line-height: 60px;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.7);
}
.app-header :deep(.el-tabs__item:hover) {
  color: #fff;
}
.app-header :deep(.el-tabs__item.is-active) {
  color: #fff;
}
@media (max-width: 600px) {
  .year-tabs {
    padding: 0 12px;
  }
  .app-header :deep(.el-tabs__item) {
    font-size: 16px;
    font-weight: 600;
    padding: 0 14px;
    height: 48px;
    line-height: 48px;
    letter-spacing: 0.5px;
  }
}
</style>
