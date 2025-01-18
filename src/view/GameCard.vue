<template>
  <div>
    <h1 class="total">目前玩过的游戏总计：{{ total }}（网游、手游、页游、红白机...还在统计）</h1>
    <div class="game-list" v-if="imageSources.length > 0">
      <template v-for="(imageSrc, index) in imageSources" :key="index">
        <div class="game-card">
          <img
            :data-src="imageSrc.src"
            :src="imageSrc.src"
            alt="Game Poster"
            class="game-poster"
            draggable="false"
            oncontextmenu="return false;"
          />
          <div class="game-info">
            <h3>{{ imageSrc.name }}</h3>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue';

const imageSources = ref([]);
const total = ref(0);

onMounted(async () => {
  try {
    let images = import.meta.glob(['@/assets/gameImg/*.jpg', '@/assets/gameImg/*.png']);
    const loadedImages = await Promise.all(
      Object.values(images).map(loader => loader().then(module => module.default))
    );
    imageSources.value = loadedImages.map(item => ({
      src: item,
      name: getGameName(item)
    }));
    total.value = loadedImages.length;
    nextTick(() => {
      observeImages();
    });
  } catch (error) {
    console.error('Error loading images:', error);
  }
});

// 提取文件名并去掉扩展名
const getGameName = (imageSrc) => {
  const fileName = imageSrc.split('/').pop();
  let name = decodeURIComponent(fileName.replace(/\.[^/.]+$/, ''));

  if (name.indexOf('_') !== -1) {
    let underscoreIndex = name.indexOf('_');
    return name.slice(underscoreIndex + 1);
  } else {
    return name;
  }
};

// 监听图片进入视口
const observeImages = () => {
  const images = document.querySelectorAll('.game-poster');
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  });

  images.forEach(image => {
    observer.observe(image);
  });
};
</script>

<style scoped>
.total {
  margin-bottom: 20px;
  text-align: center;
}

.game-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.game-card {
  flex: 1 1 calc(100% - 40px);
  max-width: 200px;
  position: relative;
  height: 350px;
  margin: 10px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 5px solid;
  background: #ffffffe6;
}

@media (min-width: 600px) {
  .game-card {
    flex: 1 1 calc(50% - 40px);
  }
}

@media (min-width: 900px) {
  .game-card {
    flex: 1 1 calc(33.333% - 40px);
  }
}

.game-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.game-poster {
  width: 100%;
  display: block;
  object-fit: cover;
  user-select: none;
}

h3 {
  margin: 0;
  padding: 0 12px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-family: 'SmileySans', Tahoma, Arial, sans-serif;
}

.game-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  height: calc(100% - 300px);
}
</style>
