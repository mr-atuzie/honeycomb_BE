const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema(
  {
    userId: {
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
    status: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Withdraw = mongoose.model("Withdraw", withdrawSchema);
module.exports = Withdraw;
