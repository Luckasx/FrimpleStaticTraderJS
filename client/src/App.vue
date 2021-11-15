<template>
  <div id="app">
       <b-navbar toggleable="lg" type="dark" variant="dark">
           <b-navbar-brand href="#">Frimplestatic JS (free, simple, static and js)</b-navbar-brand>
      </b-navbar>
        <homexmen msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import Vue from 'vue';
import Home from './components/Home.vue'
import TickerCard from './components/TickerCard.vue'

Vue.component("homexmen", Home);
Vue.component("ticker-card", TickerCard);

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
  /* margin-top: 60px; */
}
</style>
