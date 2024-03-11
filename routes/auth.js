const express = require('express');
const router  = express.Router()
const {JWTauth,verfiyAdmin} = require('../middleware/JWTauth')
const {register,login, forgetPassword,ResetPassword,getUserDetails,updatePassword,updateProfile,getAllUser,getSingleUser,updateUserRole,deleteUser} = require('../controller/auth');

router.post('/register',register);
router.post('/login',login);
router.post('/password/forgot',forgetPassword);
router.put('/password/reset/:token',ResetPassword);
router.get('/getuser',JWTauth,getUserDetails);
router.put('/update/:id',updatePassword);
router.put('/updateProfile/:id',updateProfile);
router.get('/getalluser',getAllUser);
router.get('/getSingleUser/:id',getSingleUser);
router.put('/changeRole/:id',updateUserRole);
router.delete('/deleteUser/:id',deleteUser)
module.exports = router