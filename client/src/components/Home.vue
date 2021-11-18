<template>
  <b-container fluid>
    <!-- Using components -->
    <b-input-group class="mt-3">
      <input placeholder="Search Tickers" v-model="istocks" />
      <b-input-group-append>
        <b-button variant="outline-success" @click="loadCharts">Load</b-button>
      </b-input-group-append>
       
    </b-input-group>

    <div v-for="s of datastocks" :key="s.ticker">
      <ticker-card :datas="s" :oticker="s.ticker" :olayout="s.layout" :key="s.ticker" :emas="selected_emas"></ticker-card>
    </div>
  </b-container>
</template>

<script>

import TickersList from '../assets/tickers.js';

export default {
  name: "Home",
  components: {
    
  },
  props: {
    msg: String,
  },
  data() {
    return {
      datas: [],
      layouts: [],
      istocks: "",
      stocks: "",
      astocks: [],
      tickers_list: TickersList,
     
    };
  },
  methods: {
   
    async loadCharts() {
      this.datas = [];

      this.layouts = [];

      this.stocks = this.istocks;

      this.istocks = "";

      this.astocks = this.stocks.replace("\n", "").split(";");
      
    },
    
  },
  mounted() {
    const randomElement =
      this.tickers_list[Math.floor(Math.random() * this.tickers_list.length)];
    this.istocks = randomElement;
    this.istocks = "AAPL";
    this.loadCharts();
    this.istocks = "";
  },
  computed: {
    datastocks() {
      return this.astocks.map((el, i) => {
        return { ticker: el, data: this.datas[i], layout: this.layouts[i] };
      });
    },
  },
};
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


