const JWT = require("jsonwebtoken");
const User = require('../models/auth')

const JWTauth = async (req, res, next) => {
  const token = (req.cookies && req.cookies.token) || null;
  if (!token){
    return res.status(400).json({
      success: false,
      message: "Not authorised !",
    });
  }
  try {
    const payLoad = JWT.verify(token, `${process.env.Secret}`);
    req.user = await User.findById(payLoad.id);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
        success:false,
        message:"Not authorised "
      })
  }
  next();
};

const verfiyAdmin = async (req, res, next) => {
    try {
      const user1 = await User.findById(req.user.id);
      console.log(user1);
      if (user1.role === "user") {
        return res.status(401).send({
          success: false,
          message: "UnAuthorized Access",
        });
      } else {
        next();
      }
    } 
    catch (error) {
        console.log(error);
      res.status(401).send({
        success: false,
        message: "Error ",
      });
    }
  };
module.exports = {JWTauth,verfiyAdmin}