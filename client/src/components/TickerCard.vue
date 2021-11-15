<template>
  <div>
    <h3>{{ oticker }}</h3>
    <div>
      <b-input-group>
        <b-input-group-prepend>
          <b-button variant="outline-info">1W</b-button>
          <b-button variant="outline-secondary" @click="getMonths(1)"
            >1M</b-button
          >
          <b-button variant="outline-primary" @click="getMonths(3)"
            >3M</b-button
          >
          <b-button variant="outline-primary" @click="getMonths(6)"
            >6M</b-button
          >
          <b-button variant="outline-primary">YTD</b-button>
          <b-button variant="outline-primary" @click="getMonths(12)"
            >1Y</b-button
          >
          <b-button variant="outline-primary" @click="getMonths(60)"
            >5y</b-button
          >
          <b-button variant="outline-primary" @click="getAll()">All</b-button>
        </b-input-group-prepend>
      </b-input-group>
    </div>
    <Plotly :data="sdata" :layout="layout_template"></Plotly>
  </div>
</template>

<script>
import { Plotly } from "vue-plotly";

const axios = require("axios");

export default {
  props: {  oticker: String},
  components: {
    Plotly,
  },
  data: function () {
    return {
      original: [],
      sdata:  [],
      emas: [{d:9, color: "red" }, {d:25, color:"purple"}],
      layout_template: {
        dragmode: "zoom",
        margin: {
          r: 10,
          t: 25,
          b: 40,
          l: 60,
        },
        height: 600,
        showlegend: false,
        
        xaxis: {
          automargin: true,
          autorange: true,
          domain: [0, 1],
          rangeselector: {
            x: 0,
            y: 1.2,
            xanchor: "left",
          },
          rangeslider: { visible: false },
          title: "Date",
          type: "date",
        },
        yaxis: {
          autorange: true,
          domain: [0, 1],
          type: "linear",
        },
      },
    };
  },
  async mounted() {
    
          this.original = await this.getStockData(this.oticker);

          this.sdata = [this.original[0]];

          this.getEmas()

          this.layouts.push(this.layout_template);
  },
  methods: {
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
     EMACalc(mArray, mRange) {
      var k = 2 / (mRange + 1);
      // first item is just the same as the first item in the input
      console.log("mArray", mArray);

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
        line: { dash: "dashdot", color: "black" },
        type: "scatter",
      };
    },
    getEmas(){

      for(let x = 0; x < this.emas.length; x++){

            let el = this.emas[x];

            let dataema = this.EMACalc(this.sdata, el.d);

            dataema.line.color = el.color;

            this.sdata.push(dataema);
            
          }

    },
    getMonths(months) {
      try {
        let goal = new Date();

        goal = goal.setMonth(goal.getMonth() - months);

        this.sdata = [];
        this.sdata[0] = {
          close: [],
          high: [],
          low: [],
          open: [],
          type: "candlestick",
          x: [],
          xaxis: "x",
          yaxis: "y",
        };
        let el = this.original[0];

        for (let x = 0; x < this.original[0].x.length; x++) {
          let d = el.x[x];

          if (Date.parse(d) > goal) {
            this.sdata[0].close.push(el.close[x]);
            this.sdata[0].high.push(el.high[x]);
            this.sdata[0].low.push(el.low[x]);
            this.sdata[0].open.push(el.open[x]);
            this.sdata[0].x.push(el.x[x]);
          }
        }

        this.sdata = [this.sdata[0]];

        this.getEmas();

        console.log("depois", this.sdata);
      } catch (err) {
        console.error("err", err);
      }
    },
    getAll() {
      this.sdata = [this.original[0]];
      this.getEmas()
    },
  },
};
</script>
