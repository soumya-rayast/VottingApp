const express = require("express");
const app = express();
const db = require("./db")
require("dotenv").config();

const  bodyParser = require("body-parser");
app.unsubscribe(bodyParser.json());
const PORT  = process.env.PORT || 3000;

const userRoutes = require("./routes/UserRoutes");

app.use("/user",userRoutes);

app.listen(PORT,()=>{
    console.log('Listing on port 3000');
})
