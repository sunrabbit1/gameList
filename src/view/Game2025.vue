<template>
  <div>
    <h1 class="total">2025年玩过的游戏总计：{{ total }}</h1>
    <div class="game">
      <div v-for="(monthData, month) in groupedGames" :key="month" class="month-section">
        <h2 class="month-title">
          <span class="month-text">{{ month }}</span>
        </h2>
        <div class="game-list">
          <template v-for="(game, index) in monthData" :key="index">
            <div class="game-card-reveal">
              <div class="game-card">
                <img
                  :data-src="game.url"
                  :alt="game.gameName + ' Poster'"
                  class="game-poster"
                  draggable="false"
                  oncontextmenu="return false;"
                />
                <div class="game-info">
                  <h3>{{ getGameName(game.gameName) }}</h3>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { list } from '../gameList/index-2025';
import { sortLikeWin } from '../utils/sortUtils';
import { getGameName } from '../utils/gameUtils';
import { observeImages } from '../utils/imageUtils';

const groupedGames = ref({});
const total = ref(0);

onMounted(async () => {
  try {
    // 按月份分组并排序
    const sortedGroupedGames = {};
    let allUniqueGames = new Set();

    // 遍历每个月份的数据
    Object.keys(list).forEach(month => {
      // 对每个月的游戏按名称排序
      const sortedGames = list[month].sort((a, b) => sortLikeWin(a.gameName, b.gameName));
      sortedGroupedGames[month] = sortedGames;

      // 将游戏名称添加到Set中，自动去重
      sortedGames.forEach(game => {
        allUniqueGames.add(game.gameName);
      });
    });

    groupedGames.value = sortedGroupedGames;
    total.value = allUniqueGames.size;

    nextTick(() => {
      observeImages();
    });
  } catch (error) {
    console.error('Error loading images:', error);
  }
});
</script>

<style scoped>
.month-section {
  margin-bottom: 40px;
}

.month-title {
  font-size: 32px;
  text-align: center;
  margin: 30px 0;
  position: relative;
  color: #333;
}

.month-text {
  display: inline-block;
  padding: 10px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.month-text::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border-radius: 30px;
  background: inherit;
  filter: blur(20px);
  opacity: 0.7;
  z-index: -1;
  transform: translate(-50%, -50%);
}

.month-title::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, transparent, #fff, #fff, transparent);
  transform: translateY(-50%);
  z-index: 0;
}

.month-text {
  position: relative;
  z-index: 2;
}
</style>