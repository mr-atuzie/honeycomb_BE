const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    name: {
      type: String,
    },
    type: {
      type: String,
    },

    email: {
      type: String,
    },
    amount: {
      type: Number,
    },
    regFee: {
      type: Number,
    },
    intrest: {
      type: Number,
    },
    payout: {
      type: Number,
    },
    maturity: {
      type: Date,
    },
    status: {
      type: String,
      default: "",
    },
    paid: {
      type: Number,
      default: 0,
    },
    week: {
      type: Number,
      default: 0,
    },
    reinvest: {
      type: Boolean,
      default: false,
    },
    activated: {
      type: Boolean,
      default: false,
    },
    month: {
      type: String,
    },
  },
  { timestamps: true }
);

const Investment = mongoose.model("Investment", investmentSchema);
module.exports = Investment;
