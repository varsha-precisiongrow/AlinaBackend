import mongoose from "mongoose";

/* ================================
   Test Schema
================================ */

const testSchema = new mongoose.Schema({
  title: String,
  content: [String],
});

/* ================================
   Corporate Wellness Schema
================================ */

const corporateWellnessSchema = new mongoose.Schema({
  title: String,
  slug: String,
  price: String,
  tests: [testSchema],
}, { collection: "CorporateWellnessData" }); // ✅ your real collection name

/* ================================
   Model
================================ */

const CorporateWellnessData = mongoose.model(
  "CorporateWellnessData",
  corporateWellnessSchema
);

export default CorporateWellnessData;