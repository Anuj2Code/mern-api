const express = require('express');
const {JWTauth,verfiyAdmin} = require('../middleware/JWTauth')
const router  = express.Router()
const {createProduct,getAllProduct,updateProduct,deletePro,getPro,filter,createReview,deleteReview,getAllReiview,getAllProducts} = require('../controller/Product');

router.post('/product/new',createProduct);
router.get('/product/all/product-list',getAllProduct);
router.put('/product/update/:id',updateProduct);
router.delete('/product/delete/:id',deletePro);
router.get('/product/details/:id',getPro);
router.get('/filter',filter);
router.put('/createReview',createReview);
router.delete('/deleteReivew',deleteReview);
router.get('/getAllReview',getAllReiview);
router.get('/getPo',getAllProducts)
// router.get('/deal',getDeal)

module.exports = router