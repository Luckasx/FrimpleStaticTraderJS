<template>
  <b-container fluid>
    <div class="mt-3">
      <b-card :header="oticker" header-tag="header" bg-variant="light">
        <b-card-text>
          <b-row v-if="temDados">
            <b-col cols="3">
              <b-input-group class="range_buttons">
                <b-input-group-prepend>
                  <b-button variant="dark" @click="getDays(7)">1W</b-button>
                  <b-button variant="dark" @click="getMonths(1)">1M</b-button>
                  <b-button variant="dark" @click="getMonths(3)">3M</b-button>
                  <b-button variant="dark" @click="getMonths(6)">6M</b-button>
                  <b-button variant="dark" @click="getCurrentYear()"
                    >YTD</b-button
                  >
                  <b-button variant="dark" @click="getMonths(12)">1Y</b-button>
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
              <trading-vue
                :data="this.$data"
                ref="tradingVue"
                :width="width"
                :height="height"
                :chart-config="{ DEFAULT_LEN: 200 }"
                :color-back="colors.back"
                :color-grid="colors.grid"
                :color-text="colors.text"
                :color-cross="colors.cross"
                :color-candle-dw="colors.candle_dw"
                :color-wick-dw="colors.wick_dw"
                :color-title="colors.tvTitle"
                :title-txt="oticker"
                class="bolder"
              ></trading-vue>
              <span class="night-mode">
                <input type="checkbox" v-model="night" />
                <label class="ml-1">Night Mode</label>
              </span>
            </b-col>
          </b-row>
          <b-row v-if="!temDados">
            <b-alert show variant="warning"
              >No quotes found for {{ oticker }}
            </b-alert>
          </b-row>
        </b-card-text>
      </b-card>
    </div>
  </b-container>
</template>

<script>
import TradingVue from "trading-vue-js";
import { Overlay } from "trading-vue-js";

const axios = require("axios");

export default {
  props: { oticker: String },
  mixins: [Overlay],
  components: { TradingVue },
  data: function () {
    return {
      selected_emas: [9, 25],
      colorText: "#111111",
      width: window.innerWidth * 0.95,
      height: 550,
      night: true,
      chart: {
        colorText: "red",
        type: "Candles",
        indexBased: true,
      },
      onchart:[

      ],
      ohlcv: [],
      original: [],
      sdata: [],
      emas: [
        { text: 7, value: 7, color: "orange" },
        { text: 9, value: 9, color: "red" },
        { text: 25, value: 25, color: "purple" },
        { text: 50, value: 50, color: "brown" },
      ],
    };
  },
  async mounted() {
    
    this.ohlcv = await this.getStockData(this.oticker);
    this.getEmas();
    

    this.$nextTick(() => {
      let begin = this.$refs.tradingVue.getRange()[0];
      let now = new Date().getTime();
      this.$refs.tradingVue.setRange(begin, now);
    });
    //this.renderChart();
  },

  computed: {
    temDados: function () {
      return true;
    },
    colors() {
      return this.night
        ? {
            back: "#121827",
            grid: "#3e3e3e",
            text: "#35a776",
            cross: "#dd64ef",
            candle_dw: "#e54077",
            wick_dw: "#e54077",
          }
        : {
            back: "#fff",
            grid: "#eee",
            text: "#333",
            candle_dw: "black",
            wick_dw: "black",
          };
    },
  },
  methods: {
    getStockData: async (ticker) => {
      try {
        let response = await axios.get(`/api/${ticker}`);

        let res = [];

        response.data.forEach((el) => {
          res.push([
            new Date(el.date).getTime(),
            el.open,
            el.high,
            el.low,
            el.close,
            0,
          ]);
        });

        return res;
      } catch (err) {
        console.error(err);
        return [];
      }
    },
    EMACalc(mArray, mRange) {
      
      var k = 2 / (mRange + 1);

      // first item is just the same as the first item in the input
      let emaArray = [[mArray[0][0], mArray[0][4]]];

      // for the rest of the items, they are computed with the previous one
      for (var i = 1; i < mArray.length; i++) {
        emaArray.push([mArray[i][0], mArray[i][4] * k + emaArray[i - 1][1] * (1 - k)]);
        
      }

      return emaArray;
    },
    getEmas() {

      this.onchart = [];

      for (let x = 0; x < this.selected_emas.length; x++) {
        let v = this.selected_emas[x];

        let dataema = this.EMACalc(this.ohlcv, v);

        this.onchart.push(
          {
            "name": `EMA ${v}`,
            "type": "EMA",
            "data": dataema,
            "settings": {"color": this.emas.find(el => el.value == v).color,  lineWidth: 2}
          }
        )
        
      }
    },
    loadStockData(goal) {
      try {
        
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
        //this.sdata = [JSON.parse(JSON.stringify(template_row))];

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

.night-mode {
    position: absolute;
    top: 15px;
    right: 80px;
    color: #888;
    font: 11px -apple-system,BlinkMacSystemFont,
        Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,
        Fira Sans,Droid Sans,Helvetica Neue,
        sans-serif
}

.bolder{
  font-family: 'Arial', Courier, monospace !important;
  font-weight: bold;
}

</style>