const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    type: {
      type: String,
    },
    amount: {
      type: Number,
    },
    date: {
      type: Date,
    },
    currentBalance: {
      type: Number,
    },
    oldBalance: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
