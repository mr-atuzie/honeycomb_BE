const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fistname: {
      type: String,
      trim: true,
      required: [true, "Please enter your firstname"],
    },
    lastname: {
      type: String,
      trim: true,
      required: [true, "Please enter your lastname"],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Please enter your email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      trim: true,
      minLength: [6, "Password must be up to 6 characters"],
    },
    accountNumber: {
      type: String,
      trim: true,
      minLength: [10, "Password must be up to 10 characters"],
    },
    accountBalance: {
      type: Number,
      default: 0,
    },
    intrest: {
      type: Number,
      default: 0,
    },
    document: {
      type: Object,
    },
    kycStatus: {
      type: String,
    },
    admin: {
      type: Boolean,
      default: false,
    },
    DOB: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
