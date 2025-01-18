import { createRouter, createWebHashHistory } from 'vue-router'
import MobilePage from '@/view/MobilePage.vue';

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '',
            redirect: 'gameList'
        },
        {
            path: '/mobile',
            name: 'Mobile',
            component: MobilePage
          },
        {
            path: '/gameList',
            name: 'gameList',
            component: () => import('@/view/GameCard.vue')
        },
        {
            path: '/2024',
            name: '2024',
            component: () => import('@/view/Game2024.vue')
        }
    ]
});

router.beforeEach((to, from, next) => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobile = /android/i.test(userAgent) ||
        /iPad|iPhone|iPod/.test(userAgent) ||
        /windows phone/i.test(userAgent) ||
        /iemobile/i.test(userAgent) ||
        /blackberry/i.test(userAgent) ||
        /webos/i.test(userAgent);

    if (isMobile) {
        next({ name: 'Mobile' });
    } else {
        next();
    }
});

export default router;
