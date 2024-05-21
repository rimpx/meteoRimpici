<template>
  <div id="app">
    <h1>Temperature Chart</h1>
    <TemperatureChart />
    <h1>Precipitation Chart</h1>
    <PrecipitationChart />
  </div>
</template>

<script>
import TemperatureChart from './views/TemperatureChart.vue'
import PrecipitationChart from './views/PrecipitationChart.vue'

export default {
  name: 'App',
  components: {
    TemperatureChart,
    PrecipitationChart
  }
}
</script>

<style>
</style>
