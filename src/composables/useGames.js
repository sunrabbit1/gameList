import { ref, computed } from 'vue';

/**
 * 加载 games.json 的 composable
 * - 暴露 games / loading / error / years / reload
 * - 轻量校验：缺字段的项 console.warn 但不阻断
 */
export function useGames() {
  const games = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}games.json`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      // 新格式检测
      if (data.records && Array.isArray(data.records) && data.games) {
        const gameMap = new Map(data.games.map(g => [g.id, g]));
        const list = [];
        data.records.forEach((record, index) => {
          const game = gameMap.get(record.gameId);
          if (!game) {
            console.warn('[useGames] 记录引用游戏不存在，跳过', record);
            return;
          }
          list.push({
            id: `record_${index}`,
            name: game.name,
            cover: game.cover,
            studio: game.studio || game.name,
            year: record.year !== undefined ? record.year : null,
            month: record.month !== undefined ? record.month : null,
          });
        });
        games.value = list;
      } else if (Array.isArray(data.games)) {
        // 旧格式兼容（原逻辑）
        const list = Array.isArray(data.games) ? data.games : [];
        games.value = list.filter((g) => {
          const ok =
            g &&
            typeof g.id === 'string' &&
            typeof g.name === 'string' &&
            typeof g.cover === 'string' &&
            (typeof g.year === 'number' || g.year === null);
          if (!ok) console.warn('[useGames] 非法数据条目，已跳过：', g);
          return ok;
        }).map((g) => {
          // month 字段可选：缺省视为 null；若存在则校验 1-12
          if (g.month !== undefined && g.month !== null) {
            if (!Number.isInteger(g.month) || g.month < 1 || g.month > 12) {
              console.warn('[useGames] 非法的 month 字段，视为 null：', g);
              return { ...g, month: null };
            }
          }
          return g;
        });
      }
    } catch (e) {
      error.value = e?.message || String(e);
      games.value = [];
    } finally {
      loading.value = false;
    }
  }

  // 年份去重降序（排除 null / undefined）
  const years = computed(() =>
    [...new Set(games.value.map((g) => g.year))]
      .filter((y) => y != null)
      .sort((a, b) => b - a)
  );

  // 立即加载
  load();

  return { games, loading, error, years, reload: load };
}
