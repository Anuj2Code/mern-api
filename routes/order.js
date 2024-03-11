const Order = require("../models/Order");
const express = require('express');
const router  = express.Router()
const {JWTauth, verfiyAdmin} = require('../middleware/JWTauth')
const {createOrder,singleOrder,myOrder,getAllOrder,updateOrder,deleteOrder,successOrder} = require('../controller/order')

router.post('/createOrder',createOrder)
router.get('/singleOrder/:id',singleOrder)
router.get('/myOrder',myOrder)
router.get('/getAllOrder',getAllOrder)
router.put('/updateOrder/:id',updateOrder)
router.delete('/deleteOrder/:id',deleteOrder)
router.post('/sucess',successOrder)

module.exports = router;