<template>
  <div class="hello">
    HELLO
    <Plotly :data="data" :layout="layout" :display-mode-bar="false"></Plotly>
  </div>
</template>

<script>

import { Plotly } from 'vue-plotly'
const axios = require('axios');

export default {
  name: 'Home',
  components: {
    Plotly
  },
  props: {
    msg: String
  },
   data() {
    return {
      data:[{
        x: [1,2,3,4],
        y: [10,15,13,17],
        type:"scatter"
      }],
      layout:{
        title: "My graph"
      }
    }
  },
  mounted(){
      axios.get('/api/AAPL')
    .then(function (response) {
      // handle success
      console.log(response);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
