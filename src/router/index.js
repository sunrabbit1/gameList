import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '',
            redirect: 'gameList'
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

export default router;
