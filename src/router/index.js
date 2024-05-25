import { createRouter, createWebHistory } from 'vue-router'
import TemperatureChart from '../views/TemperatureChart.vue'
import PrecipitationChart from '../views/PrecipitationChart.vue'
import Top10Cities from '../views/Top10Cities.vue'

const routes = [
  {
    path: '/',
    name: 'TemperatureChart',
    component: TemperatureChart
  },
  {
    path: '/temperature-chart',
    name: 'TemperatureChart',
    component: TemperatureChart
  },
  {
    path: '/precipitation-chart',
    name: 'PrecipitationChart',
    component: PrecipitationChart
  },
  {
    path: '/top10-cities',
    name: 'Top10Cities',
    component: Top10Cities
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
