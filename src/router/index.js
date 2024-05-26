import { createRouter, createWebHistory } from 'vue-router';
import TemperatureChart from '../views/TemperatureChart.vue';
import Top10Cities from '../views/Top10Cities.vue';
import PrecipitationChart from '../views/PrecipitationChart.vue';
import ItalianRegionChart from '../views/ItalianRegionChart.vue';

const routes = [
  { path: '/', redirect: '/temperature-chart' },
  { path: '/temperature-chart', component: TemperatureChart },
  { path: '/top10-cities', component: Top10Cities },
  { path: '/precipitation-chart', component: PrecipitationChart },
  { path: '/italian-region-chart', component: ItalianRegionChart }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
