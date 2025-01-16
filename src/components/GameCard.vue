<template>
  <div class="game-card">
    <img :src="imageSrc" alt="Game Poster" class="game-poster" draggable="false" oncontextmenu="return false;" />
    <div class="game-info">
      <h3>{{ gameName }}</h3>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref } from 'vue';
const props = defineProps({
  imageSrc: {
    type: String,
    required: true
  }
});

// 提取文件名并去掉扩展名
const getGameName = (imageSrc) => {

  const fileName = imageSrc.split('/').pop();
  let name = decodeURIComponent(fileName.replace(/\.[^/.]+$/, ''));
  console.log(name);

  if (name.indexOf('_')) {
    let underscoreIndex = name.indexOf('_');
    return name.slice(underscoreIndex + 1)
  } else {
    return name;
  }
};

const gameName = ref('');
gameName.value = getGameName(props.imageSrc);
</script>

<style scoped>
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