<template>
  <b-container fluid>
    <b-row>
      <b-col cols="6">
        <!-- Using components -->
        <b-input-group size="md" class="mt-3">
          <b-form-input placeholder="Search Tickers" v-model="istocks" />
          <b-input-group-append>
            <b-button variant="outline-success" @click="loadCharts"
              >Load</b-button
            >
            <b-button variant="outline-success" @click="loadRandomCharts"
              >Surprise me!</b-button
            >
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>

    <b-row v-for="s of datastocks" :key="s.ticker">
      <b-col>
        <ticker-card
          :datas="s"
          :oticker="s.ticker"
          :olayout="s.layout"
          :key="s.ticker"
        ></ticker-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import TickersList from "../assets/tickers.js";

export default {
  name: "Home",
  components: {},
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

      this.astocks = this.stocks.replace(/\n|\s/g, "").split(";");

      let ind = this.astocks.indexOf("");
      if (ind > -1) {
        this.astocks.splice(ind, 1);
      }
    },
    getRandomElement() {
      const randomElement =
        this.tickers_list[Math.floor(Math.random() * this.tickers_list.length)];
      return randomElement;
    },
    loadRandomCharts(){
      this.istocks = "";
      let rqt = Math.random() * 30

      for(let x = 0; x < rqt; x++){
        this.istocks += this.getRandomElement() + ";"
      }

      this.loadCharts();
      this.istocks = "";
    }
  },
  mounted() {
    this.istocks = "ABEV3.SA;EGIE3.SA;FLRY3.SA;TIMS3.SA;TUPY3.SA;WEGE3.SA";
    //this.istocks = "TIMS3.SA;";

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


