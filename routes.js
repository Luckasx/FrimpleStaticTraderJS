const express = require('express');
const app = express();
const path = require('path');

app.get('/hello', (req, res) => {
    res.send('Hello External World!')
})

// sendFile will go here
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'static/index.html'));
  });



module.exports = app;