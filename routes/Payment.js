const express = require('express');
const router  = express.Router()
const {processPayment,sendStripeApiKey}  = require('../controller/Payment')

router.post('/payment/process',processPayment)
router.get('/key',sendStripeApiKey)
module.exports = router