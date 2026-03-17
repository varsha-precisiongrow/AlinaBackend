const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  name: String,
  slug: String,
  price: Number,
  description: String
});

module.exports = mongoose.model("Test", testSchema);