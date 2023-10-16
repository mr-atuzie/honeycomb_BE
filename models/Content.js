const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    hero: { type: Object },
    about: { type: Object },
    service: { type: Object },
  },
  { timestamps: true }
);

const Content = mongoose.model("Content", contentSchema);
module.exports = Content;
