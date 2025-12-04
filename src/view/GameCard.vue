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
import ScrollReveal from 'scrollreveal';

const sr = ScrollReveal();

const imageSources = ref([]);
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
    const loadedImages = list.sort((a, b) => sortLikeWin(a.gameName, b.gameName));

    imageSources.value = loadedImages.map(item => ({
      src: item.url,
      name: getGameName(item.gameName)
    }));
    total.value = loadedImages.length;
    nextTick(() => {
      observeImages();
      sr.reveal('.game-card-reveal', {
        // 动画持续时间
        duration: 200,
        // 移动距离
        distance: '150px',
        // 动画起始方向 (top, bottom, left, right)
        origin: 'top',
        // 初始透明度
        opacity: 0,
        // 缩放比例
        scale: 0.3,
        // 自定义缓动函数
        easing: 'cubic-bezier(0.5, 0, 0.5, 1)',
        // 每个元素之间的间隔时间
        interval: 80,
        // 是否每次进入视窗都执行动画
        reset: false,
        // 元素可见比例才触发动画
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
