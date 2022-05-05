const express = require('express')
const app = express()
let port = 4000 || process.env.PORT;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log('Example app listening on njj')
})