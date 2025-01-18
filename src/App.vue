<template>
  <div>
    <Navbar />
    <div id="game">
      {{ deviceType }}
      <div class="game-list-container">
        <RouterView v-slot="{ Component }">
          <template v-if="Component">
            <Transition name="fade" mode="out-in">
              <keep-alive>
                <Suspense>
                  <template #default>
                    <component :is="Component"></component>
                  </template>
                  <template #fallback>
                    <div>Loading...</div>
                  </template>
                </Suspense>
              </keep-alive>
            </Transition>
          </template>
        </RouterView>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterView } from 'vue-router';
import Navbar from './components/Navbar.vue';

const isMobile = ref(false);
const deviceType = ref('');

onMounted(async () => {
  checkDeviceType();
});

const checkDeviceType = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // 检测常见的移动设备特征
  if (
    /android/i.test(userAgent) ||
    /iPad|iPhone|iPod/.test(userAgent) ||
    /windows phone/i.test(userAgent) ||
    /iemobile/i.test(userAgent) ||
    /blackberry/i.test(userAgent) ||
    /webos/i.test(userAgent)
  ) {
    isMobile.value = true;
    deviceType.value = '移动设备';
  } else {
    isMobile.value = false;
    deviceType.value = '桌面设备';
  }
};
</script>

<style>
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

/* .title {
  margin-bottom: 20px;
  text-align: center;
} */

.game-list-container {
  width: 100%;
  max-width: 1260px;
  padding: 0 15px;
  box-sizing: border-box;
}

/* .game-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
} */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s cubic-bezier(0.02, 0.01, 0.47, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
