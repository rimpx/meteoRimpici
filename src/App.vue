<template>
  <div id="app">
    <nav>
      <router-link to="/">Temperature Chart</router-link> |
      <router-link to="/precipitation">Precipitation Chart</router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Optionally add some styles for navigation */
nav a {
  padding: 10px;
  text-decoration: none;
  color: blue;
}
nav a.router-link-exact-active {
  color: red;
}
</style>
