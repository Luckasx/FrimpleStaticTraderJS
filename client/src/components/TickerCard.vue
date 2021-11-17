<template>
  <b-container fluid>
    <div class="mt-3">
     <b-card
      :header="oticker"
      header-tag="header"
      bg-variant="dark"
      text-variant="white"
    >
      <b-card-text>
    <b-row v-if="temDados">
      <b-col cols="3">
        <b-input-group class="range_buttons">
          <b-input-group-prepend>
            <b-button variant="dark" @click="getDays(7)">1W</b-button>
            <b-button variant="dark" @click="getMonths(1)">1M</b-button>
            <b-button variant="dark" @click="getMonths(3)" >3M</b-button>
            <b-button variant="dark" @click="getMonths(6)">6M</b-button>
            <b-button variant="dark" @click="getCurrentYear()">YTD</b-button>
            <b-button variant="dark" @click="getMonths(12)"              >1Y</b-button>
            <b-button variant="dark" @click="getMonths(60)">5y</b-button>
            <b-button variant="dark" @click="getAll()">All</b-button>
          </b-input-group-prepend>
        </b-input-group>
      </b-col>
      <b-col class="mt-3" cols="9">
        <b-form inline>
          <b-form-group
            id="input-group-1"
            label="Exponential Moving Average:"
            label-for="input-1"
            class="mr-3"
          ></b-form-group>
          <b-form-checkbox-group
            id="checkbox-group-1"
            v-model="selected_emas"
            :options="emas"
            name="flavour-1"
            @change="updateEmas()"
          ></b-form-checkbox-group>
        </b-form>
      </b-col>
    </b-row>
    <b-row class="mt-3" v-if="temDados">
      <b-col cols="12">
      <!-- <Plotly :data="sdata" :layout="layout_template"></Plotly> -->
      <apexchart type="line" height="350" :options="chartOptions" :series="series"></apexchart>
      </b-col>
    </b-row>
    <b-row v-if="!temDados">
      <b-alert show variant="warning">No quotes found for {{ oticker }} </b-alert>
    </b-row>
</b-card-text>
      
    </b-card>
    </div>
  </b-container>
</template>

<script>
// import { Plotly } from "vue-plotly";
import VueApexCharts from 'vue-apexcharts'


const axios = require("axios");

const template_row = {
  close: [],
  high: [],
  low: [],
  open: [],
  type: "candlestick",
  x: [],
  xaxis: "x",
  yaxis: "y",
};

export default {
  props: { oticker: String },
  components: {
     'apexchart':VueApexCharts,
  },
  data: function () {
    return {
      original: [],
      sdata: [],
      emas: [
        { text: 7, value: 7, color: "orange" },
        { text: 9, value: 9, color: "red" },
        { text: 25, value: 25, color: "purple" },
        { text: 50, value: 50, color: "brown" },
      ],
      selected_emas: [9, 25],
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
          rangebreaks:[
            {
             bounds: [6, 1],
              //values: ["sat", "mon"],
              pattern:'day of week'
            }
          ],
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
       series: [{
            name: 'Website Blog',
            type: 'column',
            data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160]
          }, {
            name: 'Social Media',
            type: 'line',
            data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16]
          }],
          chartOptions: {
            chart: {
              height: 350,
              type: 'line',
            },
            stroke: {
              width: [0, 4]
            },
            title: {
              text: 'Traffic Sources'
            },
            dataLabels: {
              enabled: true,
              enabledOnSeries: [1]
            },
            labels: ['01 Jan 2001', '02 Jan 2001', '03 Jan 2001', '04 Jan 2001', '05 Jan 2001', '06 Jan 2001', '07 Jan 2001', '08 Jan 2001', '09 Jan 2001', '10 Jan 2001', '11 Jan 2001', '12 Jan 2001'],
            xaxis: {
              type: 'datetime'
            },
            yaxis: [{
              title: {
                text: 'Website Blog',
              },
            
            }, {
              opposite: true,
              title: {
                text: 'Social Media'
              }
            }]
          },
    };
  },
  async mounted() {
    this.original = await this.getStockData(this.oticker);

    this.sdata = [this.original[0]];

    this.getEmas();

    this.layouts.push(this.layout_template);
  },
  computed: {
    temDados: function() {
      try{
        
        return this.sdata[0].x.length > 0;
      }
      catch(err){
        console.log("ERRRRRRRRRRRO", err);
        return false;
      }
    },
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
    getEmas() {
      for (let x = 0; x < this.selected_emas.length; x++) {
        let v = this.selected_emas[x];

        let dataema = this.EMACalc(this.sdata, v);

        dataema.line.color = this.emas.find((el) => el.value == v).color;

        this.sdata.push(dataema);
      }
    },
    loadStockData(goal) {
      try {
        this.sdata = [JSON.parse(JSON.stringify(template_row))];

        //this.sdata[0] = template_row;

        let el = this.original[0];

        for (let x = 0; x < this.original[0].x.length; x++) {
          let d = el.x[x];

          if (Date.parse(d) > goal) {
            this.addStockRow(this.sdata[0], el, x);
          }
        }

        //this.sdata = [this.sdata[0]];

        this.getEmas();
      } catch (err) {
        console.error("err", err);
      }
    },
    getDays(days) {
      let goal = new Date();

      goal.setDate(goal.getDate() - days);

      console.log(goal, days);

      this.loadStockData(goal);
    },
    getCurrentYear() {
      try {
        this.sdata = [JSON.parse(JSON.stringify(template_row))];

        let el = this.original[0];

        let currentYear = new Date().getFullYear();

        for (let x = 0; x < this.original[0].x.length; x++) {
          let d = el.x[x];

          if (new Date(d).getFullYear() >= currentYear) {
            this.addStockRow(this.sdata[0], el, x);
          }
        }

        this.getEmas();
      } catch (err) {
        console.error("err", err);
      }
    },
    getMonths(months) {
      let goal = new Date();

      goal = goal.setMonth(goal.getMonth() - months);

      this.loadStockData(goal);
    },
    getAll() {
      this.sdata = [this.original[0]];
      this.getEmas();
    },
    addStockRow(data, el, x) {
      data.close.push(el.close[x]);
      data.high.push(el.high[x]);
      data.low.push(el.low[x]);
      data.open.push(el.open[x]);
      data.x.push(el.x[x]);
    },
    updateEmas() {
      console.log("updating", this.selected_emas);

      this.sdata = [this.sdata[0]];
      this.getEmas();
    },
  },
};
</script>

<style scoped>
.range_buttons button {
  font-size: 12px !important;
}
</style>