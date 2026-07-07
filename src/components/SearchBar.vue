<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);

const isExpanded = ref(false);
const inputRef = ref(null);

async function toggle() {
  isExpanded.value = !isExpanded.value;
  if (isExpanded.value) {
    await nextTick();
    inputRef.value?.focus();
  }
}

function onInput(v) {
  emit('update:modelValue', v);
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    isExpanded.value = false;
  }
}
</script>

<template>
  <div class="search-bar" :class="{ expanded: isExpanded }">
    <!-- 展开态：左侧滑出搜索框 -->
    <transition name="slide-fade">
      <div v-if="isExpanded" class="search-input-wrap">
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" class="search-icon-inline">
          <path
            fill="currentColor"
            d="M1014.4 972.8L747.2 705.6a448 448 0 1 0-41.6 41.6l267.2 267.2a32 32 0 0 0 41.6-41.6zM448 768a320 320 0 1 1 0-640 320 320 0 0 1 0 640z"
          />
        </svg>
        <el-input
          ref="inputRef"
          :model-value="modelValue"
          placeholder="搜索游戏名"
          clearable
          @update:model-value="onInput"
          @keydown="onKeydown"
        />
      </div>
    </transition>

    <!-- 圆形按钮：折叠时半隐藏，展开时靠右 -->
    <button
      class="search-btn"
      type="button"
      :aria-label="isExpanded ? '收起搜索' : '展开搜索'"
      @click="toggle"
    >
      <svg v-if="!isExpanded" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="currentColor"
          d="M1014.4 972.8L747.2 705.6a448 448 0 1 0-41.6 41.6l267.2 267.2a32 32 0 0 0 41.6-41.6zM448 768a320 320 0 1 1 0-640 320 320 0 0 1 0 640z"
        />
      </svg>
      <span v-else class="close-x" aria-hidden="true">✕</span>
    </button>
  </div>
</template>

<style scoped>
/* 容器：固定在右上角，z-index 高于 header */
.search-bar {
  position: fixed;
  top: 70px;  /* 避开 header */
  right: 0;
  display: flex;
  align-items: center;
  z-index: 200;
}

/* 圆形按钮：折叠时半隐藏（露出左半边），hover/展开时完全显示 */
.search-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #000;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.25s ease, box-shadow 0.15s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.search-btn svg {
  width: 20px;
  height: 20px;
}
.close-x {
  font-size: 18px;
  line-height: 1;
  color: #303133;
}
.search-bar:not(.expanded) .search-btn {
  /* 普通状态：向右偏移 50% 自身宽度，只露出左半圆 */
  transform: translateX(50%);
}
.search-bar:not(.expanded):hover .search-btn {
  transform: translateX(0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.search-bar.expanded .search-btn {
  /* 展开态：按钮在右侧正常显示 */
  transform: translateX(0);
}

/* 展开态输入框：max 220px，圆角，黑色边框 */
.search-input-wrap {
  background: #fff;
  border: 2px solid #000;
  border-radius: 22px;
  max-width: 220px;
  width: 220px;
  height: 40px;
  padding: 0 12px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.search-icon-inline {
  width: 16px;
  height: 16px;
  color: #909399;
  flex-shrink: 0;
  margin-right: 4px;
}
.search-input-wrap :deep(.el-input) {
  flex: 1;
  min-width: 0;
}
.search-input-wrap :deep(.el-input__wrapper) {
  padding: 0;
  box-shadow: none;
  background: transparent;
}

@media (max-width: 600px) {
  .search-bar {
    top: 56px;
  }
  .search-input-wrap {
    width: calc(100vw - 100px);
    max-width: 220px;
  }
}

/* 滑入动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.25s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
