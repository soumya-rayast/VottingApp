const express = require("express");
const app = express();
require("dotenv").config();
const  bodyParser = require("body-parser");
app.unsubscribe(bodyParser.json());
const PORT  = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log('Listing on port 3000');
})
