const express = require('express')
const app = express()
const port = 3000

const router = require('./routes.js');


app.use(express.static('static'));

app.use("/", router);


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})