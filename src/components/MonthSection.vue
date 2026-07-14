<script setup>
import GameCard from './GameCard.vue';

defineProps({
  monthLabel: { type: String, required: true },
  games: { type: Array, required: true },
});
</script>

<template>
  <section class="month-section">
    <h3 class="month-title">
      <span class="line"></span>
      <span class="text">{{ monthLabel }}</span>
      <span class="line"></span>
    </h3>
    <div class="game-grid">
      <GameCard v-for="g in games" :key="g.id" :game="g" />
    </div>
  </section>
</template>

<style scoped>
.month-section {
  margin-bottom: 28px;
}
.month-section:last-child {
  margin-bottom: 0;
}
.month-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin: 0 0 16px;
}
.month-title .line {
  flex: 1;
  max-width: 200px;
  height: 3px;
  background: #c0c4cc;
}
.month-title .text {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  letter-spacing: 2px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.75);
  padding: 4px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(2px);
}
.month-section .game-grid {
  display: grid;
  justify-items: center;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  /* column-gap: 16px;   */
  gap: 16px;
}
@media (max-width: 600px) {
  .month-section {
    margin-bottom: 20px;
  }
  .month-title {
    gap: 10px;
    margin: 0 0 12px;
  }
  .month-title .line {
    max-width: 80px;
  }
  .month-title .text {
    font-size: 20px;
    letter-spacing: 1px;
  }
  .month-section .game-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style>
