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
      <h3>{{ s.ticker }}</h3>
      <Plotly :data="s.data" :layout="s.layout" ></Plotly>
    </div>
  </b-container>
</template>

<script>
import { Plotly } from "vue-plotly";

const axios = require("axios");

export default {
  name: "Home",
  components: {
    Plotly,
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
      layout_template: {
        dragmode: "zoom",
        margin: {
          r: 10,
          t: 25,
          b: 40,
          l: 60,
        },
        showlegend: false,
        xaxis: {
          autorange: true,
          domain: [0, 1],
          range: ["2017-01-03 12:00", "2017-02-15 12:00"],
          rangeslider: { visible: false },
          title: "Date",
          type: "date",
        },
        yaxis: {
          autorange: true,
          domain: [0, 1],
          range: [114.609999778, 137.410004222],
          type: "linear",
        },
      },
      tickers_list: ["AAPL", "PETR3.SA", "ABEV3.SA", "TIMS3.SA"],
    };
  },
  methods: {
    EMACalc(mArray, mRange) {
      var k = 2 / (mRange + 1);
      // first item is just the same as the first item in the input
      console.log("mArray",mArray);

      let datas_array = [mArray[0].x[0]];
      let emaArray = [mArray[0].close[0]];
      // for the rest of the items, they are computed with the previous one
      for (var i = 1; i < mArray[0].close.length; i++) {
        emaArray.push(mArray[0].close[i] * k + emaArray[i - 1] * (1 - k));
        datas_array.push(mArray[0].x[i]);
      }
      return {
        x: datas_array,
        y: emaArray,
        mode: "lines",
        name: "EMA_" + mRange,
        line: { dash:'dashdot', color: "black" },
        type: "scatter",
      };
    },
    async loadCharts() {
      this.datas = [];

      this.layouts = [];

      this.stocks = this.istocks;

      this.istocks = "";

      this.astocks = this.stocks.replace("\n", "").split(";");

      // console.log(this.astocks);

      for (let x = 0; x < this.astocks.length; x++) {
        let el = this.astocks[x];

        if (el != "") {
          let data = await this.getStockData(el);
          
          let ema9 = await this.EMACalc(data,9);
          
          let ema25 = await this.EMACalc(data,25);
          ema25.line.color = "purple"

          this.datas.push([ data[0], ema9, ema25]);

          this.layouts.push(this.layout_template);

          console.log(this.datastocks);
        }
      }
    },
    getStockData: async (ticker) => {
      try {
        let response = await axios.get(`/api/${ticker}`);

        let res = [
          {
            x: response.data.map((el) => el.date),
            close: response.data.map((el) => el.close),
            high: response.data.map((el) => el.high),
            low: response.data.map((el) => el.low),
            open: response.data.map((el) => el.open),
            type: "candlestick",
            xaxis: "x",
            yaxis: "y",
          },
        ];

        //console.log("res", res)

        return res;
      } catch (err) {
        console.error(err);
        return [];
      }
    },
  },
  mounted() {
    const randomElement =
      this.tickers_list[Math.floor(Math.random() * this.tickers_list.length)];
    this.istocks = randomElement;
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


