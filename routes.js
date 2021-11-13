const express = require('express');
const app = express();
const path = require('path');


// require syntax (if your code base does not support imports)
const yahooFinance = require('yahoo-finance2').default; // NOTE the .default


//const results = await yahooFInance.search('AAPL', { someOption: true, etc });

// sendFile will go here
// app.get('/js', function (req, res) {
//     res.sendFile(path.join(__dirname, 'static/index.html'));
// });

app.get('/api/:stock', async (req, res) => {
    try {
        const query = req.params.stock;
        const queryOptions = { period1: '2017-02-01' };
        const result = await yahooFinance.historical(query, queryOptions);
        res.send(result)
    }
    catch (err) {
        console.log(err);
        res.send(err);
    }
})

// sendFile will go here
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'static/index.html'));
});



module.exports = app;