const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    hero: { type: String },
    about: { type: String },
    how: { type: String },
    value: { type: String },
  },
  { timestamps: true }
);

const Content = mongoose.model("Content", contentSchema);
module.exports = Content;
