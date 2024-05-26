<template>
  <div id="app">
    <nav>
      <router-link to="/temperature-chart">Temperature Chart</router-link>
      <router-link to="/top10-cities">Top 10 Hottest Cities</router-link>
      <router-link to="/precipitation-chart">Precipitation Chart</router-link>
      <router-link to="/italian-region-chart">Italian Region Chart</router-link>
    </nav>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

nav {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

nav a {
  margin: 0 15px;
  padding: 10px 20px;
  text-decoration: none;
  color: #fff;
  background-color: #007bff;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

nav a:hover {
  background-color: #0056b3;
}
</style>
