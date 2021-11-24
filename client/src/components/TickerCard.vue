<template>
  <b-container fluid>
    <div class="mt-3">
      <b-card :header="oticker" header-tag="header" bg-variant="light">
        <b-card-text>
          <b-row v-if="temDados">
            <b-col class="" cols="9">
              <b-form inline>
                <b-form-group
                  id="input-group-1"
                  label="Exponential Moving Average:"
                  label-for="input-1"
                  class="mr-3"
                ></b-form-group>
                <b-form-checkbox-group
                  id="checkbox-group-ema"
                  v-model="selected_emas"
                  :options="emas"
                  name="flavour-1"
                  @change="updateEmas()"
                ></b-form-checkbox-group>
                <b-form-group
                  v-bind:id="'input-group-1-' + oticker"
                  label="Simple Moving Average:"
                  label-for="input-1"
                  class="mr-3"
                ></b-form-group>
                <b-form-checkbox-group
                  v-bind:id="'checkbox-group-sma' + oticker"
                  v-model="selected_smas"
                  :options="smas"
                  name="flavour-sma"
                  @change="updateSmas()"
                ></b-form-checkbox-group>


                <label :for="'checkboxbb_' + oticker" class="ml-auto mb-0">Bollinger Bands</label>
                <b-form-checkbox
                  v-bind:id="'checkboxbb_' + oticker"
                  v-model="bollinger_bands"
                  name="checkbox-1"                  
                  @change="getLines()"
                  class="ml-1"
                  ></b-form-checkbox
                >
              </b-form>
            </b-col>
            <b-col class="text-right">
              <label class="text-primary"
                ><b>Min: {{ minimal }} ({{ minimalDate }})</b></label
              >
              <br />
              <label class="ml-3 text-danger"
                ><b>Max: {{ maximal }} ({{ maximalDate }})</b></label
              >
            </b-col>
          </b-row>
          <b-row class="mt-3">
            <template v-for="l in links">
              <b-col cols="1" :key="l.href" class="text-left">
                <a :href="l.href" target="_blank"
                  ><img :src="l.ico" width="24px"
                /></a>
              </b-col>
            </template>
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
                :overlays="overlays"
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
// import { Overlay } from "trading-vue-js";
import Overlays from "tvjs-overlays";

const axios = require("axios");

export default {
  props: { oticker: String },
  // mixins: [Overlay],
  components: { TradingVue },
  data: function () {
    return {
      bollinger_bands: false,
      selected_emas: [9, 25],
      selected_smas: [100],
      colorText: "#111111",
      width: window.innerWidth * 0.95,
      height: 550,
      night: true,
      chart: {
        colorText: "red",
        type: "Candles",
        indexBased: true,
        data: [],
        tf: '1d'
      },
      onchart: [],
      ohlcv: [],
      original: [],
      sdata: [],
      links: [],
      emas: [
        { text: 7, value: 7, color: "orange" },
        { text: 9, value: 9, color: "red" },
        { text: 25, value: 25, color: "purple" },
        { text: 50, value: 50, color: "white" },
      ],
      smas: [
        { text: 100, value: 100, color: "pink" },
        { text: 250, value: 250, color: "yellow" },
      ],
      overlays: [Overlays["BB"]],
    };
  },
  async mounted() {
    this.oticker = this.oticker.toUpperCase();
    this.ohlcv = await this.getStockData(this.oticker);
    this.getLines();
    this.getLinks();

    this.chart.data = null;
    this.chart.data = this.ohlcv;

    this.$nextTick(() => {
      let begin = this.$refs.tradingVue.getRange()[0];
      let now = new Date().getTime();
      this.$refs.tradingVue.setRange(begin, now);      
    });
    //this.renderChart();
  },

  computed: {
    closes() {
      if (this.ohlcv.length == 0) {
        return 0;
      }
      return this.ohlcv.map((el) => el[4]);
    },
    minimal() {
      if (this.ohlcv.length == 0) {
        return 0;
      }
      return Math.min(...this.closes);
    },
    maximal() {
      if (this.ohlcv.length == 0) {
        return 0;
      }
      return Math.max(...this.closes);
    },
    minimalDate() {
      return new Date(this.getQuoteDate(this.minimal))
        .toLocaleString()
        .substr(0, 10);
    },
    maximalDate() {
      return new Date(this.getQuoteDate(this.maximal))
        .toLocaleString()
        .substr(0, 10);
    },
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
    getQuoteDate(quote) {
      if (this.ohlcv.length > 0) {
        let e = this.ohlcv.find((el) => el[4] == quote);
        return e[0];
      }
    },
    getLinks() {
      let pureTicker = this.oticker.toUpperCase().replace(".SA", "");

      this.links.push({
        href: "https://finance.yahoo.com/quote/" + this.oticker,
        ico: "https://s.yimg.com/cv/apiv2/default/fp/20180826/icons/favicon_y19_32x32.ico",
      });

      this.links.push({
        href: "https://www.google.com/search?q=" + pureTicker,
        ico: "https://www.google.com/favicon.ico",
      });

      this.links.push({
        href: "https://www.tradingview.com/symbols/" + pureTicker,
        ico: "https://www.tradingview.com/static/images/favicon.ico",
      });

      if (this.oticker.toUpperCase().indexOf(".SA") > -1) {
        this.links.push({
          href: "https://www.suno.com.br/acoes/" + pureTicker,
          ico: "https://www.suno.com.br/acoes/favicon.ico",
        });
      }
    },
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
            el.volume,
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
        emaArray.push([
          mArray[i][0],
          mArray[i][4] * k + emaArray[i - 1][1] * (1 - k),
        ]);
      }

      return emaArray;
    },
    getEmas() {
      this.onchart = [];

      for (let x = 0; x < this.selected_emas.length; x++) {
        let v = this.selected_emas[x];

        let dataema = this.EMACalc(this.ohlcv, v);

        this.onchart.push({
          name: `EMA ${v}`,
          type: "EMA",
          data: dataema,
          settings: {
            color: this.emas.find((el) => el.value == v).color,
            lineWidth: 2,
          },
        });
      }
    },
    calcBollingerBands() {
      let sma20 = this.SMACalc(this.ohlcv, 20);

      let std = this.calcStandardDeviation(this.ohlcv, sma20, 20);

      sma20.forEach((el) => {
        let stdd = std.find((es) => es[0] == el[0]);

        if (stdd == undefined) {
          return;
        }

        stdd = stdd[1];
        
        el[2] = el[1];
        el[3] = el[2] + stdd * 2;
        el[1] = el[2] - stdd * 2;
      });

      
      return sma20;
    },
    calcStandardDeviation(dohlcv, dsma, period) {
      let ret = [];

      try {
        ret.push([dohlcv[period][0], 0]);
      } catch (err) {
        console.log(err);
      }

      for (let x = period; x < dohlcv.length; x++) {
        // console.log(x);
        let counter = 0;
        let squared_diff = 0;
        let mean = dsma.find((el) => el[0] == dohlcv[x][0])[1];

        while (counter < period && x - counter >= 0) {
          let close = dohlcv[x - counter][4];
          squared_diff += Math.pow(close - mean, 2);
          counter++;
        }

        let variance = squared_diff / counter;

        let std = Math.sqrt(variance);

        ret.push([dohlcv[x][0], std]);
      }

      return ret;
    },
    getSmas() {
      for (let x = 0; x < this.selected_smas.length; x++) {
        let v = this.selected_smas[x];

        let datasma = this.SMACalc(this.ohlcv, v);

        this.onchart.push({
          name: `SMA ${v}`,
          type: "SMA",
          data: datasma,
          settings: {
            color: this.smas.find((el) => el.value == v).color,
            lineWidth: 2,
          },
        });
      }
    },
    SMACalc(mArray, window = 5) {
      let prices = mArray.map((el) => el[4]);
      let dates = mArray.map((el) => el[0]);

      //console.log("marray", mArray, "prices", prices, "dates", dates);

      if (!prices || prices.length < window) {
        return [];
      }

      let index = window - 1;
      const length = prices.length + 1;

      const simpleMovingAverages = [];

      while (++index < length) {
        const windowSlice = prices.slice(index - window, index);
        const sum = windowSlice.reduce((prev, curr) => prev + curr, 0);
        simpleMovingAverages.push([dates[index], sum / window]);
      }

      return simpleMovingAverages;
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

        this.getEmas();
      } catch (err) {
        console.error("err", err);
      }
    },
    getDays(days) {
      let goal = new Date();

      goal.setDate(goal.getDate() - days);

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

        this.getLines();
      } catch (err) {
        console.error("err", err);
      }
    },
    getLines() {
      
      this.getEmas();
      this.getSmas();

      if (this.bollinger_bands == true)  {
        let bbdata = this.calcBollingerBands();

        this.onchart.push({
          name: "Bollinger Bands",
          type: "BB",
          data: bbdata,
          settings: {
            color: "#a4e0f4",
            backColor: "#a4e0f433",
            showMid: false,
            lineWidth: 1.5,
            length: 20,
          },
        });
      }
    },
    getMonths(months) {
      let goal = new Date();

      goal = goal.setMonth(goal.getMonth() - months);

      this.loadStockData(goal);
    },
    getAll() {
      this.sdata = [this.original[0]];
      this.getLines();
    },
    addStockRow(data, el, x) {
      data.close.push(el.close[x]);
      data.high.push(el.high[x]);
      data.low.push(el.low[x]);
      data.open.push(el.open[x]);
      data.x.push(el.x[x]);
    },
    updateEmas() {
      this.getLines();
    },
    updateSmas() {
      this.getLines();
    }
    
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
  font: 11px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
    Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

.bolder {
  font-family: "Arial", Courier, monospace !important;
  font-weight: bold;
}
</style>