<script setup>
import GameCard from './GameCard.vue';

defineProps({
  games: { type: Array, required: true },
  searchQuery: { type: String, default: '' },
});
</script>

<template>
  <!-- 空结果 -->
  <div v-if="games.length === 0" class="empty">
    <el-empty
      :description="
        searchQuery
          ? `未找到匹配《${searchQuery}》的游戏`
          : '该年份还没有游戏'
      "
    />
  </div>

  <!-- 游戏网格 -->
  <div v-else class="game-grid">
    <GameCard v-for="g in games" :key="g.id" :game="g" />
  </div>
</template>

<style scoped>
.game-grid {
  display: grid;
  justify-items: center;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  /* column-gap: 16px;                 明确列间隔 16px，不被压缩 */
  row-gap: 16px;                    /* 行间隔 16px */
}
.game-grid > * {
  min-width: 0;                     /* 防止子元素 min-content 撑大 1fr，导致溢出 */
}
@media (max-width: 600px) {
  .game-grid {
    grid-template-columns: repeat(2, 1fr);
    column-gap: 10px;
    row-gap: 10px;
  }
}
.empty {
  padding: 60px 0;
  text-align: center;
}
</style>
