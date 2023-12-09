const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;
const pool = require('./db');
const routes = require('./routes')
app.use(cors());

app.use(express.json())

app.use(express.static('public'));


app.use('/',routes);





app.listen(PORT, ()=>{
    console.log("Server started and listening on port ",PORT)
})