const express = require('express');
const multer  = require('multer')
const cookieParser = require('cookie-parser')
const connectToMongo = require('./config/db');
const authRoute = require('./routes/auth');
const proRoute = require('./routes/product')
const orderRoute = require('./routes/order')
const paymentRoute = require('./routes/Payment')
const cloudinary = require('cloudinary')
const fileUpload = require("express-fileupload");
const bodyParser = require('body-parser')
const path = require("path");
require('dotenv').config()
var cors = require('cors') 
const app = express();
const base = process.env.base || 8800;

connectToMongo()
const port = base;
app.use(cors({
    origin:["https://mern-api-sand.vercel.app/"],
    methods:["POST","GET","DELETE","PUT"],
    credentials:true
}));
app.use(cookieParser());  
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.json({limit: '50mb'}));

app.use(fileUpload({
 useTempFiles:true
}));

app.get('/',(req,res)=>{
  res.send('vcdt')
})

app.use('/api/auth',authRoute);
app.use('/api/item',proRoute);
app.use('/api/order',orderRoute)
app.use('/api/payment',paymentRoute)

app.listen(port,()=>{
    console.log('connect to backend');
})