
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
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err));

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

/* ✅ TEST ROUTE */
app.get("/test", (req, res) => {
  res.send("Server is working ✅");
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

/* ================================
   Razorpay Order API
================================ */
app.post("/create-order", async (req, res) => {
  console.log("🔥 CREATE ORDER API HIT");
  console.log("KEY ID:", process.env.RAZORPAY_KEY_ID);

  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const order = await instance.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).send("Error creating order");
  }
});

/* ================================
   Save Booking
================================ */

// const twilio = require("twilio");

// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

/* ================================
   Save Booking
================================ */
// app.post("/booking", async (req, res) => {
//   try {
//     console.log("🔥 Booking API hit hua");

//     const newBooking = new Booking(req.body);
//     await newBooking.save();

//     console.log("✅ Booking saved in DB");

//     // ✅ Patient WhatsApp message
//     console.log("📤 Sending message to patient...");

//     const patientMsg = await client.messages.create({
//       from: "whatsapp:+14155238886",
//       to: `whatsapp:+91${req.body.phone}`,
//       body: `✅ Booking Confirmed!

// Patient: ${req.body.patientName}
// Test: ${req.body.testName}
// Date: ${req.body.appointmentDate}

// 📍 Technician will visit soon.
// - Alina Diagnostics`,
//     });

//     console.log("✅ Patient message SID:", patientMsg.sid);

//     // ✅ Technician WhatsApp message
//     console.log("📤 Sending message to technician...");

//     const techMsg = await client.messages.create({
//       from: "whatsapp:+14155238886",
//       to: "whatsapp:+919930888088",
//       body: `🚨 New Booking Alert!

// Patient: ${req.body.patientName}
// Phone: ${req.body.phone}
// Address: ${req.body.street}, ${req.body.city}
// Test: ${req.body.testName}
// Date: ${req.body.appointmentDate}

// 👉 Please visit patient.`,
//     });

//     console.log("✅ Technician message SID:", techMsg.sid);

//     res.json({
//       success: true,
//       message: "Booking saved & WhatsApp sent ✅",
//     });

//   } catch (error) {
//     console.log("❌ ERROR:", error);
//     res.status(500).json({ message: "Error saving booking" });
//   }
// });
app.post("/booking", async (req, res) => {
  try {
    console.log("🔥 Booking API hit hua");

    // ✅ Move Twilio here
    const twilio = require("twilio");
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // 🔍 Debug (important)
    console.log("SID:", process.env.TWILIO_ACCOUNT_SID);

    const newBooking = new Booking(req.body);
    await newBooking.save();

    console.log("✅ Booking saved in DB");

    // ✅ Patient WhatsApp message
    const patientMsg = await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:+91${req.body.phone}`,
      body: `✅ Booking Confirmed!

      Patient: ${req.body.patientName}
      Test: ${req.body.testName}
      Date: ${req.body.appointmentDate}

      📍 Technician will visit soon.
      - Alina Diagnostics`,
          });

    console.log("✅ Patient message SID:", patientMsg.sid);

    // ✅ Technician WhatsApp message
    const techMsg = await client.messages.create({
      from: "whatsapp:+14155238886",
      to: "whatsapp:+919930888088",
      body: `🚨 New Booking Alert!

      Patient: ${req.body.patientName}
      Phone: ${req.body.phone}
      Address: ${req.body.street}, ${req.body.city}
      Test: ${req.body.testName}
      Date: ${req.body.appointmentDate}

      👉 Please visit patient.`,
    });

    console.log("✅ Technician message SID:", techMsg.sid);

    res.json({
      success: true,
      message: "Booking saved & WhatsApp sent ✅",
    });

  } catch (error) {
    console.log("❌ ERROR:", error);
    res.status(500).json({ message: "Error saving booking" });
  }
});

/* ================================
   Server
================================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const Razorpay = require("razorpay");

// const app = express();

// /* ================================
//    Middleware
// ================================ */
// app.use(cors());
// app.use(express.json());

// /* ================================
//    MongoDB Connection
// ================================ */
// mongoose
//   .connect(process.env.MONGO_URI, {
//     serverSelectionTimeoutMS: 5000,
//   })
//   .then(() => console.log("MongoDB Connected ✅"))
//   .catch((err) => console.log("MongoDB Error ❌", err));

// /* ================================
//    Models
// ================================ */

// const testSchema = new mongoose.Schema(
//   {
//     id: Number,
//     name: String,
//     slug: String,
//     mrp: Number,
//     price: Number,
//     sample: String,
//     reportTime: String,
//     fasting: String,
//     includes: String,
//     sections: Array,
//   },
//   { collection: "Test_Info" }
// );

// const Test = mongoose.model("Test", testSchema);

// const corporateWellnessSchema = new mongoose.Schema(
//   {
//     id: Number,
//     title: String,
//     price: String,
//     tests: Array,
//   },
//   { collection: "corporateWellnessData" }
// );

// const CorporateWellnessPackage = mongoose.model(
//   "CorporateWellnessPackage",
//   corporateWellnessSchema
// );

// const bookingSchema = new mongoose.Schema(
//   {
//     bookingId: String,
//     patientName: String,
//     firstName: String,
//     lastName: String,
//     phone: String,
//     email: String,
//     street: String,
//     city: String,
//     zip: String,
//     age: Number,
//     gender: String,
//     altPhone: String,
//     testName: String,
//     appointmentDate: String,
//     paymentMethod: String,
//     totalAmount: Number,
//     createdAt: { type: Date, default: Date.now },
//   },
//   { collection: "bookings" }
// );

// const Booking = mongoose.model("Booking", bookingSchema);

// /* ================================
//    Routes
// ================================ */

// app.get("/", (req, res) => {
//   res.send("Backend server is running 🚀");
// });

// /* ✅ TEST ROUTE */
// app.get("/test", (req, res) => {
//   res.send("Server is working ✅");
// });

// /* -------- Tests -------- */
// app.get("/tests", async (req, res) => {
//   try {
//     const tests = await Test.find();
//     res.json(tests);
//   } catch {
//     res.status(500).json({ message: "Error fetching tests" });
//   }
// });

// app.get("/tests/:slug", async (req, res) => {
//   try {
//     const test = await Test.findOne({ slug: req.params.slug });

//     if (!test) return res.status(404).json({ message: "Test not found" });

//     res.json(test);
//   } catch {
//     res.status(500).json({ message: "Error fetching test" });
//   }
// });

// /* -------- Corporate Wellness -------- */

// app.get("/corporate-wellness", async (req, res) => {
//   try {
//     const packages = await CorporateWellnessPackage.find();
//     res.json(packages);
//   } catch {
//     res.status(500).json({ message: "Error fetching packages" });
//   }
// });

// /* ================================
//    Razorpay Order API
// ================================ */
// app.post("/create-order", async (req, res) => {
//   console.log("🔥 CREATE ORDER API HIT");
//   console.log("KEY ID:", process.env.RAZORPAY_KEY_ID);

//   try {
//     const instance = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET,
//     });

//     const options = {
//       amount: req.body.amount * 100,
//       currency: "INR",
//       receipt: "receipt_order_" + Date.now(),
//     };

//     const order = await instance.orders.create(options);
//     res.json(order);
//   } catch (error) {
//     console.error("Razorpay Error:", error);
//     res.status(500).send("Error creating order");
//   }
// });

// /* ================================
//    Save Booking
// ================================ */
// app.post("/booking", async (req, res) => {
//   try {
//     const newBooking = new Booking(req.body);
//     await newBooking.save();

//     res.json({ success: true, message: "Booking saved ✅" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Error saving booking" });
//   }
// });

// /* ================================
//    Server
// ================================ */
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });