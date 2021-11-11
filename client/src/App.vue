<template>
  <div id="app">
        <homexmen msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import Vue from 'vue';
import Home from './components/Home.vue'

Vue.component("homexmen", Home);

export default {
  name: 'App',
 
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
