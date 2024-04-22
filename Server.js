const express = require("express");
const app = express();
const db = require("./db")
require("dotenv").config();


const  bodyParser = require("body-parser");

app.use(bodyParser.json());
const PORT  = process.env.PORT || 3000;


const userRoutes = require("./routes/UserRoutes");
const candidateRoutes = require("./routes/CandidateRoutes");

app.use("/user",userRoutes);
app.use("/candidate",candidateRoutes);

app.listen(PORT,()=>{
    console.log('Listing on port 3000');
})

