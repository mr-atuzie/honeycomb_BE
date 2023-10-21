const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    referred: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },

    amount: {
      type: Number,
    },
    date: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Referral = mongoose.model("Referral", referralSchema);
module.exports = Referral;
