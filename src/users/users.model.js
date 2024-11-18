const mongoose = require("mongoose");
const configs = require("../../configs");
const bcrypt = require("bcrypt-nodejs");
const usersSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      trim: true,
      length: 42,
      // required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      trim: true,
      default: configs.defaultAvatarImage,
    },
    nickName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      trim: true,
      default: "user",
    },
    password: {
      type: String,
      trim: true,
    },
    emailVerificationToken: {
      type: String,
      trim: true,
      unique: true,
    },
    isSocial: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Bcrypt middleware on UserSchema
usersSchema.pre("save", function (next) {
  var user = this;

  if (!user.isModified("password")) return next();

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

//Password verification
usersSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model("users", usersSchema);
