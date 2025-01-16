<template>
  <div>
    <Navbar />
    <div id="game">
      <h1 class="title">总计：{{ gameTotal }}</h1>
      <div class="game-list-container">
        <Suspense>
          <template #default>
            <div class="game-list" v-if="imageSources.length > 0">
              <GameCard v-for="(imageSrc, index) in imageSources" :imageSrc="imageSrc" :key="index" />
            </div>
            <div v-else>
              No images found.
            </div>
          </template>
          <template #fallback>
            <div>Loading...</div>
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import GameCard from './components/GameCard.vue';

const imageSources = ref([]);
const gameTotal = ref(0);

onMounted(async () => {
  try {
    let images = import.meta.glob(['@/assets/gameImg/*.jpg', '@/assets/gameImg/*.png']);
    const loadedImages = await Promise.all(
      Object.values(images).map(loader => loader().then(module => module.default))
    );
    imageSources.value = loadedImages;
    gameTotal.value = loadedImages.length;
  } catch (error) {
    console.error('Error loading images:', error);
  }
});
</script>

<style scoped>
#game {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  padding-top: 50px;
  box-sizing: border-box;
}

.title {
  margin-bottom: 20px;
  text-align: center;
}

.game-list-container {
  width: 100%;
  max-width: 1260px;
  padding: 0 15px;
  box-sizing: border-box;
}

.game-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}
</style>
