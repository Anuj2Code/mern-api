const mongoose = require('mongoose');
require('dotenv').config()
const url = process.env.url
console.log(url);
const url1 = url;
const connectToMongo = async()=>{
 await mongoose.connect(url1).then(()=>{
     console.log('hello connect ho gaya');
 }).catch((err)=>{
   console.log(err);
 })
}
module.exports = connectToMongo;