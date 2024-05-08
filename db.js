const mongoose = require("mongoose");
require("dotenv").config();
const mongoURL = process.env.MONGODB_URL_LOCAL ;
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology:true
})
const db = mongoose.connection;
db.on("connected",()=>{
    console.log('connected to Mongodb server')
});
db.on('error',(err)=>{
    console.error('Mongodb connection error :',err);
})
db.on('disconnected',()=>{
    console.log('MongoDB disconnected');
})
module.exports = db;