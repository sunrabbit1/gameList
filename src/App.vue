<template>
  <div>
    <Navbar />
    <div id="game">
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

onMounted(async () => {
  var str = navigator.userAgent;
  var ipad = str.match(/(iPad).*OS\s([\d_]+)/);
  var isIphone = !ipad && str.match(/(iPhone\sOS)\s([\d_]+)/);
  var isAndroid = str.match(/(Android)\s+([\d.]+)/);

  if (isIphone) {
    // 404
    this.$router.push('/404')
  } else if (isAndroid) {
    // 404
  }
});
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
