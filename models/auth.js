const mongoose = require("mongoose");
const JWT = require("jsonwebtoken");
const crypto = require("crypto")

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
      minLength: [5, "Name must be atleast 5 chars"],
      maxLength: [50, "Name must not be more than 50 chars"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "user email is required"],
      unique: [true, "already register !"],
    },
    password: {
      type: String,
      required: [true, " pasword is required"],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.methods = {
  jwtToken() {
    return JWT.sign(
      { id: this._id, email: this.email },
      `${process.env.Secret}`,
      { expiresIn: '24h' }
    );
  },
};
// genearte forget password token
userSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};
module.exports = mongoose.model("User", userSchema);
