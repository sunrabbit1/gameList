import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/fonts/font.css';
import './assets/main.css';

const app = createApp(App);

app.use(router);

app.mount('#app');

