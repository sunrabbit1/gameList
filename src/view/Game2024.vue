<template>
  <div>
    <h1 class="total">2024年玩过的游戏总计：{{ total }}</h1>
    <div class="game-2024">
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
import { list } from '../gameList/index-2024';
import ScrollReveal from 'scrollreveal';

const sr = ScrollReveal();

const groupedGames = ref({});
const total = ref(0);

const sortLikeWin = (name1, name2) => {
  const regexPunc = /[\s!！#$%&(（)）,，、.。;；？@[\]^_`{}~‘’“”《》￥【】+=·…]/
  const regexNum = /[0-9]/
  const regexEng = /[A-Za-z]/
  const regexCh = /[\u4E00-\u9FFF]/
  // 排序大小： 特殊字符 > 数字 > 字母 > 汉字
  // 如果第一个字符相等，再比较下一个字符
  let compareValue = false
  const minLength = Math.min(name1.length, name2.length)
  let i = 0
  do {
    const aIndex = name1.charAt(i)
    const bIndex = name2.charAt(i)
    const nameFirstType = [aIndex, bIndex].map((item) => {
      if (item.match(regexPunc)) {
        return 0
      }
      if (item.match(regexNum)) {
        return 1
      }
      if (item.match(regexEng)) {
        return 2
      }
      if (item.match(regexCh)) {
        return 3
      }
      return -1
    })
    // 如果第一个字符不相等
    if (aIndex !== bIndex) {
      if (nameFirstType[0] !== nameFirstType[1]) {
        compareValue = nameFirstType[0] - nameFirstType[1]
        break
      } else {
        // 中文需根据拼音顺序
        compareValue = aIndex.localeCompare(bIndex, 'zh')
        break
      }
    }
    if (i === minLength) {
      compareValue = name1.localeCompare(name2, 'zh')
      break
    }
    i += 1
  } while (i <= minLength)
  return compareValue
}

onMounted(async () => {
  try {
    // 按月份分组并排序
    const sortedGroupedGames = {};
    let totalCount = 0;

    // 遍历每个月份的数据
    Object.keys(list).forEach(month => {
      // 对每个月的游戏按名称排序
      const sortedGames = list[month].sort((a, b) => sortLikeWin(a.gameName, b.gameName));
      sortedGroupedGames[month] = sortedGames;
      totalCount += sortedGames.length;
    });

    groupedGames.value = sortedGroupedGames;
    total.value = totalCount;

    nextTick(() => {
      observeImages();
      // 为每个月份的卡片添加动画效果
      sr.reveal('.game-card-reveal', {
        duration: 200,
        distance: '150px',
        origin: 'top',
        opacity: 0,
        scale: 0.3,
        easing: 'cubic-bezier(0.5, 0, 0.5, 1)',
        interval: 80,
        reset: false,
        viewFactor: 0.2,
      });
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