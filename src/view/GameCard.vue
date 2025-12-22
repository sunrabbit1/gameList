<template>
  <div>
    <h1 class="total">目前玩过的游戏总计：{{ total }}（网游、手游、页游、红白机...还在统计）</h1>
    <div class="game-list" v-if="imageSources.length > 0">
      <template v-for="(imageSrc, index) in imageSources" :key="index">
        <div class="game-card-reveal">
          <div class="game-card">
            <img
              :data-src="imageSrc.src"
              alt="Game Poster"
              class="game-poster"
              draggable="false"
              oncontextmenu="return false;"
            />
            <div class="game-info">
              <h3>{{ imageSrc.name }}</h3>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { list } from '../gameList/index';
import { sortLikeWin } from '../utils/sortUtils';
import { getGameName } from '../utils/gameUtils';
import { observeImages } from '../utils/imageUtils';

const imageSources = ref([]);
const total = ref(0);

onMounted(async () => {
  try {
    const loadedImages = list.sort((a, b) => sortLikeWin(a.gameName, b.gameName));

    imageSources.value = loadedImages.map(item => ({
      src: item.url,
      name: getGameName(item.gameName)
    }));
    total.value = loadedImages.length;
    nextTick(() => {
      observeImages();
    });
  } catch (error) {
    console.error('Error loading images:', error);
  }
});
</script>
