Vue.component('exampleComponent', require('./components/ExampleComponent.vue')); 

window.onload = () => {

  var app = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!',
      stocks: ["AAPL","PETR3.SA"],
      data:[{
        x: [1,2,3,4],
        y: [10,15,13,17],
        type:"scatter"
      }],
      layout:{
        title: "My graph"
      }
    }
  })

  //plotaCandle("wege3.SA");
  //console.log("olá");
}

const plotaCandle = (stock) => {

  const fetchUsers = (stock) => {
    axios.get(`api/${stock}`)
        .then(response => {
            const stock_data = response.data;
            
            var trace1 = {

              x: stock_data.map(el => el.date),
          
              close: stock_data.map(el => el.adjClose),
          
              // decreasing: { line: { color: '#7F7F7F' } },
          
              high: stock_data.map(el => el.high),
          
              low: stock_data.map(el => el.low),
          
              open: stock_data.map(el => el.open),
          
              type: 'candlestick',
              xaxis: 'x',
              yaxis: 'y'
            };

            var data = [trace1];

            var layout = {
              plot_bgcolor:"black",
              paper_bgcolor:"gray",
              dragmode: 'zoom',
              margin: {
                r: 10,
                t: 25,
                b: 40,
                l: 60
              },
              showlegend: false,
              xaxis: {
                autorange: true,
                color: '#222',
                domain: [0, 1],
                range: ['2017-01-03 12:00', '2017-02-15 12:00'],
                rangeslider: {  visible: false, range: ['2017-01-03 12:00', '2017-02-15 12:00'] },
                title: 'Date',
                type: 'date'
              },
              yaxis: {
                autorange: true,
                domain: [0, 1],
                range: [114.609999778, 137.410004222],
                type: 'linear'
              }
            };
          
            var template = {data: {}, layout: baseLayout};
          
            Plotly.newPlot('myDiv', data, layout);

        })
        .catch(error => console.error(error));
  };

  fetchUsers(stock);

 
}

let baseLayout = {
  title: 'Watermark Template',
  // items with a `name` attribute in template.images will be added to any
  // plot using this template
 
  showlegend: false
};