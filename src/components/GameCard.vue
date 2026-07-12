<script setup>
import { ref } from 'vue';

const props = defineProps({
  game: { type: Object, required: true },
});

const isLoaded = ref(false);
const hasError = ref(false);

function onLoad() {
  isLoaded.value = true;
}
function onError() {
  hasError.value = true;
}
</script>

<template>
  <div class="game-card">
    <!-- 加载错误占位 -->
    <div v-if="hasError" class="cover-fallback">
      <span>封面缺失</span>
    </div>

    <!-- 正常图片（含懒加载 + 渐显） -->
    <img
      v-else
      :src="game.cover"
      :alt="game.name"
      loading="lazy"
      decoding="async"
      @load="onLoad"
      @error="onError"
      :class="{ loaded: isLoaded }"
    />

    <div class="name">{{ game.name }}</div>
  </div>
</template>

<style scoped>
.game-card {
  border: 5px solid #000;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  max-width: 220px;
  width: 100%;
  box-sizing: border-box;          /* border 计入 max-width，避免外扩 */
  min-width: 0;                     /* 允许 grid item 收缩到 0，1fr 不会被子元素内容撑大 */
  transition:
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.35s ease,
    border-color 0.25s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  will-change: transform;
}
.game-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.18),
    0 4px 8px rgba(0, 0, 0, 0.1);
}
.game-card img {
  width: 100%;
  max-width: 100%;                  /* 兜底：防止原始尺寸撑大 min-content */
  height: 350px;
  object-fit: cover;
  display: block;
  background: #f0f0f0;
  opacity: 0;
  transition: opacity 0.3s;
}
@media (max-width: 600px) {
  .game-card img {
    height: 220px;
  }
}
.game-card img.loaded {
  opacity: 1;
}
.cover-fallback {
  width: 100%;
  height: 350px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}
@media (max-width: 600px) {
  .cover-fallback {
    height: 220px;
  }
}
.game-card .name {
  height: 50px;
  padding: 6px 8px;
  font-size: 18px;
  font-weight: bold;
  line-height: 1.4;
  text-align: center;
  display: flex;
  align-items: center;       /* 垂直居中 */
  justify-content: center;   /* 水平居中 */
  /* overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; */
  border-top: 1px solid #eee;
  color: #303133;
  font-family: 'Smiley Sans', -apple-system, BlinkMacSystemFont,
    'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
}

/* 得意黑（Smiley Sans）字体加载 */
@font-face {
  font-family: 'Smiley Sans';
  src: url('https://cdn.jsdelivr.net/npm/@fontpkg/smiley-sans@2.0.4/SmileySans-Oblique.otf.woff2') format('woff2');
  font-display: swap;
}
</style>
