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
  },
  { timestamps: true }
);

const Investment = mongoose.model("Investment", investmentSchema);
module.exports = Investment;
