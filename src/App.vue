<template>
  <div id="app">
    <header class="app-header">
      <img alt="logo" src="@/assets/logo.png" class="logo">
    </header>
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

.app-header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.logo {
  width: 100px; /* Adjust the width as needed */
  height: auto;
}

nav {
  display: flex;
  flex-wrap: wrap; /* Allow wrapping */
  justify-content: center;
  margin-bottom: 20px;
}

nav a {
  margin: 5px; /* Adjusted margin for better spacing */
  padding: 10px 20px;
  text-decoration: none;
  color: #fff;
  background-color: #007bff;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  flex: 1 1 200px; /* Flex properties for responsiveness */
  text-align: center;
}

nav a:hover {
  background-color: #0056b3;
}

/* Media Queries for Responsiveness */
@media (max-width: 600px) {
  .logo {
    width: 80px; /* Smaller logo for mobile */
  }

  nav a {
    padding: 8px 15px;
    font-size: 14px; /* Smaller text for mobile */
  }
}

@media (max-width: 400px) {
  nav a {
    flex: 1 1 100%; /* Full width links on very small screens */
  }
}
</style>
