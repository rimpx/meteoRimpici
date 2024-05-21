import { createApp } from 'vue';
import App from './App.vue';
import VueApexCharts from '@apexcharts/vue3';

const app = createApp(App);

app.use(VueApexCharts);
app.component('apex-chart', VueApexCharts);

app.mount('#app');
