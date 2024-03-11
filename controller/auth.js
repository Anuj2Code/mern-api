const User = require("../models/auth");
const emailValidator = require("email-validator");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2

cloudinary.config({ 
  cloud_name: "dc0qbtc4t",
  api_key: 528993286837345, 
  api_secret: "C0bRoCjoxkLWC0UxPxlWLLBvRNM"
});


const register = async (req, res) => {
  const emailValid = emailValidator.validate(req.body.email);
  if (!emailValid) {
    return res.status(400).json({
      success: false,
      message: "please provide a valid email id",
    });
  }
  cloudinary.uploader.upload(req.body.avatar,async(err,result)=>{
    console.log(result);
    try {
      const salt = bcrypt.genSaltSync(10);
       const hash = bcrypt.hashSync(req.body.password, salt);
       if(req.body.username.length<5){
         return res.status(400).json({
           message:"Username must be of 5 character"
         })
       }
       const newUser = new User({
         username: req.body.username,
         email: req.body.email,
         password: hash,
         avatar: {
           public_id:result.public_id,
           url: result.url,
         },
       });
       await newUser.save();
       res.status(200).json({
        data: newUser
       });
     } catch (error) {
       if (error.code === 11000) {
         return res.status(400).json({
           success: false,
           message: "Account already exist with provided email_id ",
         });
       }
       return res.status(400).json({
         success: false,
         message: error, // mesage mil laga inside the error object
       });
     }
 }) 
}


const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Every field is required !",
    });
  }
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        success: false,
        message: "Invalid credential !",
      });
    }
    const token = user.jwtToken();
    const options = {
      expiresIn: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    res.cookie("token", token, options);
    res.status(200).json({
      success: true,
      data: user,
    });
    console.log(user);
  } catch (error) {
    res.status(400).json(error);
  }
};


const forgetPassword = async (req, res) => {

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(500).json({
      success: false,
      message: "User not Found !",
    });
  }
  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save();

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/password/reset/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it.`; // \n is used to change the line

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
      data:user
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const ResetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
    console.log(resetPasswordToken);
    
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  console.log(user);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Reset Password Token is invalid or has been expired",
    });
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Password does not match with confirm password",
    });
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);
  user.password = hash;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  await user.save();

  const token = user.jwtToken();
  const options = {
    expiresIn: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.cookie("token", token, options);
  res.status(200).json({
    success: true,
    data: user,
  });
};

const getUserDetails= async(req,res)=>{
   try {
    const user = await User.findById(req.user.id);
    return res.status(200).json({
      success:true,
      message:user
    })
   } catch (error) {
    return res.status(400).json(error)
   }
}

const updatePassword = async(req,res)=>{
  try {
    const user = await User.findById(req.params.id).select("+password");
    const matchPass = await bcrypt.compare(req.body.oldPassword, user.password);
    if(!matchPass){
      return res.status(200).json({
        success:false,
        message:"Old Password is wrong !"
      })
    }
    if(req.body.newpassword!==req.body.confirmPassword){
      return res.status(200).json({
        success:false,
        message:"password is not match with the confirm password !"
      })
    }
    const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.newpassword, salt);
  user.password = hash;
    await user.save();

    const token = user.jwtToken();
    const options = {
      expiresIn: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    res.cookie("token", token, options);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
     return res.status(400).json(error)
  }
}

const updateProfile = async(req,res)=>{
  if(req.body.image!==''){
    const user = await User.findById(req.params.id);
    console.log(user);
     cloudinary.uploader.destroy(req.query.img,(err,resul)=>{
      console.log(resul);
      console.log(req.body.avatar);
     });

  cloudinary.uploader.upload(req.body.image, async(err,result)=>{
    console.log(result,'ftfuf');
    const newObject= {
      email:req.body.email,
      username:req.body.username
     }
     const user = await User.findByIdAndUpdate(req.params.id,newObject,{new:true});
         user.avatar={
          public_id:result.public_id,
          url:result.url
         }
         
        await user.save();
         return res.status(200).json({
          success:true,
          data:user
         })
    });
  }
  else{
    try {
      const newObject= {
        email:req.body.email,
        username:req.body.username
       }
       const user = await User.findByIdAndUpdate(req.params.id,newObject,{new:true});
       return res.status(200).json({
        success:true,
        data:user
       })
     } catch (error) {
      return res.status(400).json(error)
     }
  }
}

const getAllUser = async(req,res)=>{
try {
  const user  = await User.find();
  return res.status(200).json({
    user
  })
} catch (error) {
  return res.status(400).json(error)
}
}

const getSingleUser = async(req,res)=>{
    try {
      const user = await User.findById(req.params.id);
      return res.status(200).json({
        data:  user
      })
    } catch (error) {
      return res.status(500).json(error)
    }
}

const updateUserRole = async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

 const user =  await User.findByIdAndUpdate(req.params.id, newUserData, { new: true});
  res.status(200).json({
    success: true,
    message:user
  });
};

const deleteUser = async(req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
      return res.status(400).json('user not found !')
  }
  const imageId = user.avatar.public_id;

  await cloudinary.uploader.destroy(imageId);
  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
}
module.exports = { register, login, forgetPassword,ResetPassword ,getUserDetails,updatePassword,updateProfile,getAllUser,getSingleUser,deleteUser,updateUserRole};
 