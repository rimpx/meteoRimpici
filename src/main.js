import { createApp } from 'vue';
import App from './App.vue';
import VueApexCharts from 'vue-apexcharts';

const app = createApp(App);

// Registra globalmente il componente di ApexCharts
app.component('apex-chart', VueApexCharts);

app.mount('#app');
