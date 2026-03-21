
// require('dotenv').config();

// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");


// const app = express();

// app.use(cors());
// app.use(express.json());

// /* ================================
//    MongoDB Connection
// ================================ */

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB Connected ✅"))
//   .catch(err => {
//     console.log("MongoDB Error ❌", err);
//   });


// /* ================================
//    Test Schema (Matches MongoDB Data)
// ================================ */

// const testSchema = new mongoose.Schema({
//   id: Number,
//   name: String,
//   slug: String,
//   mrp: Number,
//   price: Number,
//   sample: String,
//   reportTime: String,
//   fasting: String,
//   includes: String,
//   sections: Array
// }, { collection: "Test_Info" });

// const Test = mongoose.model("Test", testSchema);


// /* ================================
//    Corporate Wellness Package Schema
// ================================ */

// const corporateWellnessSchema = new mongoose.Schema({
//   id: Number,
//   title: String,
//   price: String,
//   tests: Array
// }, { collection: "corporateWellnessData" });

// const CorporateWellnessPackage = mongoose.model(
//   "CorporateWellnessPackage",
//   corporateWellnessSchema
// );


// /* ================================
//    Booking Schema (Full Checkout / Patient)
// ================================ */

// const bookingSchema = new mongoose.Schema({
//   bookingId: String,
//   patientName: String,
//   firstName: String,
//   lastName: String,
//   phone: String,
//   email: String,
//   street: String,
//   city: String,
//   zip: String,
//   age: Number,
//   gender: String,
//   altPhone: String,
//   testName: String,
//   appointmentDate: String,
//   paymentMethod: String,
//   totalAmount: Number,
//   createdAt: { type: Date, default: Date.now }
// }, { collection: "bookings" });

// const Booking = mongoose.model("Booking", bookingSchema);


// /* ================================
//    Default Route
// ================================ */

// app.get("/", (req, res) => {
//   res.send("Backend server is running");
// });


// /* ================================
//    Fetch All Tests
// ================================ */

// app.get("/tests", async (req, res) => {
//   try {
//     const tests = await Test.find();
//     res.json(tests);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching tests" });
//   }
// });


// /* ================================
//    Fetch Single Test by Slug
// ================================ */

// app.get("/tests/:slug", async (req, res) => {
//   try {
//     const test = await Test.findOne({ slug: req.params.slug });

//     if (!test) {
//       return res.status(404).json({ message: "Test not found" });
//     }

//     res.json(test);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching test" });
//   }
// });


// /* ================================
//    Fetch Corporate Wellness Packages
// ================================ */

// app.get("/corporate-wellness", async (req, res) => {
//   try {
//     const packages = await CorporateWellnessPackage.find();
//     res.json(packages);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching wellness packages" });
//   }
// });



// /* ================================
//    Create Razorpay Order
// ================================ */
// const Razorpay = require("razorpay");

// const razorpay = new Razorpay({
//   key_id: process.env.KEY_ID,
//   key_secret: process.env.KEY_SECRET,
// });

// app.post("/test-order", async (req, res) => {
//   try {
//     const { amount } = req.body;

//     const options = {
//       amount: amount * 100, // convert ₹ to paise
//       currency: "INR",
//       receipt: "receipt_" + Date.now(),
//     };

//     const order = await razorpay.orders.create(options);

//     res.json(order);
//   } catch (error) {
//     console.log("Razorpay Error:", error);
//     res.status(500).json({ message: "Error creating order" });
//   }
// });



// /* ================================
//    Save Booking (Full Checkout / Patient)
// ================================ */

// app.post("/booking", async (req, res) => {
//   try {
//     const newBooking = new Booking(req.body);
//     await newBooking.save();

//     res.json({ message: "Booking saved successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Error saving booking" });
//   }
// });

// /* ================================
//    Start Server
// ================================ */

// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");

const app = express();

/* ================================
   Middleware
================================ */
app.use(cors());
app.use(express.json());

/* ================================
   MongoDB Connection
================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err));

/* ================================
   Razorpay Setup
================================ */
const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

/* ================================
   Models
================================ */

const testSchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
    slug: String,
    mrp: Number,
    price: Number,
    sample: String,
    reportTime: String,
    fasting: String,
    includes: String,
    sections: Array,
  },
  { collection: "Test_Info" }
);

const Test = mongoose.model("Test", testSchema);

const corporateWellnessSchema = new mongoose.Schema(
  {
    id: Number,
    title: String,
    price: String,
    tests: Array,
  },
  { collection: "corporateWellnessData" }
);

const CorporateWellnessPackage = mongoose.model(
  "CorporateWellnessPackage",
  corporateWellnessSchema
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: String,
    patientName: String,
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    street: String,
    city: String,
    zip: String,
    age: Number,
    gender: String,
    altPhone: String,
    testName: String,
    appointmentDate: String,
    paymentMethod: String,
    totalAmount: Number,
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "bookings" }
);

const Booking = mongoose.model("Booking", bookingSchema);

/* ================================
   Routes
================================ */

app.get("/", (req, res) => {
  res.send("Backend server is running 🚀");
});

/* -------- Tests -------- */
app.get("/tests", async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch {
    res.status(500).json({ message: "Error fetching tests" });
  }
});

app.get("/tests/:slug", async (req, res) => {
  try {
    const test = await Test.findOne({ slug: req.params.slug });

    if (!test) return res.status(404).json({ message: "Test not found" });

    res.json(test);
  } catch {
    res.status(500).json({ message: "Error fetching test" });
  }
});

/* -------- Corporate Wellness -------- */
app.get("/corporate-wellness", async (req, res) => {
  try {
    const packages = await CorporateWellnessPackage.find();
    res.json(packages);
  } catch {
    res.status(500).json({ message: "Error fetching packages" });
  }
});

app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.log("Razorpay Error ❌", error);
    res.status(500).json({ message: "Error creating order" });
  }
});

/* ================================
   Save Booking
================================ */
app.post("/booking", async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();

    res.json({ success: true, message: "Booking saved ✅" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error saving booking" });
  }
});

/* ================================
   Server
================================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});

