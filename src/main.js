import Vue from 'vue';
import App from './App.vue';
import VueApexCharts from 'vue-apexcharts';

Vue.component('apexchart', VueApexCharts);

new Vue({
  render: h => h(App),
}).$mount('#app');
