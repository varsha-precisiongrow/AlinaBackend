// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const Razorpay = require("razorpay");
// const twilio = require("twilio");

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
//    Twilio Setup
// ================================ */
// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// console.log("TWILIO SID CHECK:", process.env.TWILIO_ACCOUNT_SID);

// /* ================================
//    MODELS
// ================================ */

// // 🔹 Test Schema
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

// // 🔹 Corporate Wellness
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

// // 🔹 Booking Schema
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
//     tests: Array, // 🔥 IMPORTANT (store full tests)
//     appointmentDate: String,
//     paymentMethod: String,
//     totalAmount: Number,
//     createdAt: { type: Date, default: Date.now },
//   },
//   { collection: "bookings" }
// );
// const Booking = mongoose.model("Booking", bookingSchema);

// // 🔹 Contact Schema
// const contactSchema = new mongoose.Schema(
//   {
//     name: String,
//     email: String,
//     phone: String,
//     subject: String,
//     message: String,
//     createdAt: { type: Date, default: Date.now },
//   },
//   { collection: "contacts" }
// );
// const Contact = mongoose.model("Contact", contactSchema);

// /* ================================
//    ROUTES
// ================================ */

// app.get("/", (req, res) => {
//   res.send("Backend server is running 🚀");
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
//   try {
//     const instance = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET,
//     });

//     const options = {
//       amount: req.body.amount * 100,
//       currency: "INR",
//       receipt: "receipt_" + Date.now(),
//     };

//     const order = await instance.orders.create(options);
//     res.json(order);
//   } catch (error) {
//     console.error("Razorpay Error:", error);
//     res.status(500).send("Error creating order");
//   }
// });

// /* ================================
//    BOOKING API (🔥 FIXED)
// ================================ */
// app.post("/booking", async (req, res) => {
//   try {
//     console.log("🔥 Booking API hit");

//     const newBooking = new Booking(req.body);
//     await newBooking.save();

//     console.log("✅ Booking saved in DB");

//     // 🔥 FIX: Multiple tests support
//     const testNames = req.body.tests
//       ?.map((item) => item.name)
//       .join(", ");

//     /* =========================
//        📲 PATIENT MESSAGE
//     ========================= */
//     try {
//       const patientMsg = await client.messages.create({
//         from: "whatsapp:+14155238886",
//         to: `whatsapp:+91${req.body.phone}`,
//         body: `✅ Booking Confirmed!

// Patient: ${req.body.patientName}
// Tests: ${testNames}
// Date: ${req.body.appointmentDate}

// - Alina Diagnostics`,
//       });

//       console.log("✅ Patient Message SID:", patientMsg.sid);
//     } catch (err) {
//       console.log("❌ Patient WhatsApp Error:", err.message);
//     }

//     /* =========================
//        📲 TECHNICIAN MESSAGE
//     ========================= */
//     try {
//       const adminMsg = await client.messages.create({
//         from: "whatsapp:+14155238886",
//         to: "whatsapp:+919930888088",
//         body: `🚨 New Booking Alert!

// Patient: ${req.body.patientName}
// Phone: ${req.body.phone}
// Tests: ${testNames}
// Date: ${req.body.appointmentDate}`,
//       });

//       console.log("✅ Technician Message SID:", adminMsg.sid);
//     } catch (err) {
//       console.log("❌ Technician WhatsApp Error:", err.message);
//     }

//     res.json({
//       success: true,
//       message: "Booking saved & messages processed ✅",
//     });

//   } catch (error) {
//     console.log("❌ Booking Error:", error);
//     res.status(500).json({ message: "Error saving booking" });
//   }
// });

// /* ================================
//    CONTACT API
// ================================ */
// app.post("/contact", async (req, res) => {
//   try {
//     console.log("🔥 Contact API hit");

//     const { name, email, phone, subject, message } = req.body;

//     const newContact = new Contact({
//       name,
//       email,
//       phone,
//       subject,
//       message,
//     });

//     await newContact.save();

//     // Admin
//     try {
//       await client.messages.create({
//         from: "whatsapp:+14155238886",
//         to: "whatsapp:+919930888088",
//         body: `📩 New Contact!

// Name: ${name}
// Phone: ${phone}
// Subject: ${subject}`,
//       });
//     } catch (err) {
//       console.log("❌ Admin WhatsApp Error:", err.message);
//     }

//     // User
//     try {
//       await client.messages.create({
//         from: "whatsapp:+14155238886",
//         to: `whatsapp:+91${phone}`,
//         body: `🙏 Thank you for contacting us!`,
//       });
//     } catch (err) {
//       console.log("❌ User WhatsApp Error:", err.message);
//     }

//     res.json({
//       success: true,
//       message: "Contact saved & WhatsApp sent ✅",
//     });

//   } catch (error) {
//   console.log("❌ FULL ERROR:", error.message);
//   console.log("❌ MORE:", error);

//   res.status(500).json({ message: error.message });
// }
// });

// /* ================================
//    SERVER
// ================================ */
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const twilio = require("twilio");

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
   Twilio Setup
================================ */
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

console.log("TWILIO SID CHECK:", process.env.TWILIO_ACCOUNT_SID);

/* ================================
   MODELS
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
    phone: String,
    email: String,
    age: Number,
    gender: String,
    tests: Array,
    appointmentDate: String,
    paymentMethod: String,
    totalAmount: Number,
    doctorName: String, // ✅ added
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "bookings" }
);
const Booking = mongoose.model("Booking", bookingSchema);

const contactSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    subject: String,
    message: String,
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "contacts" }
);
const Contact = mongoose.model("Contact", contactSchema);

/* ================================
   ROUTES
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
   Razorpay
================================ */
app.post("/create-order", async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    res.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).send("Error creating order");
  }
});

/* ================================
   BOOKING API (FINAL)
================================ */
app.post("/booking", async (req, res) => {
  try {
    console.log("🔥 Booking API hit");

    console.log("PHONE:", req.body.phone);
    console.log("FINAL TO:", `whatsapp:+91${req.body.phone}`);

    const newBooking = new Booking(req.body);
    await newBooking.save();

    console.log("✅ Booking saved in DB");

    // 🧪 Test list format
    const testList =
      req.body.tests?.map((t, i) => `${i + 1}. ${t.name}`).join("\n") ||
      "No tests";

    /* =========================
       📲 PATIENT MESSAGE
    ========================= */
    try {
      const patientMsg = await client.messages.create({
        from: "whatsapp:+14155238886",
        to: `whatsapp:+91${req.body.phone}`,
        body: `✅ *Booking Confirmed!*

👤 Patient: ${req.body.patientName}
📅 Date: ${req.body.appointmentDate}

🧪 Tests:
${testList}

💰 Amount: ₹${req.body.totalAmount}
👨‍⚕️ Doctor: ${req.body.doctorName || "N/A"}

🏥 Alina Diagnostics`,
      });

      console.log("✅ Patient Message SID:", patientMsg.sid);
    } catch (err) {
      console.log("❌ Patient WhatsApp Error:", err.message);
    }

    /* =========================
       👨‍🔬 TECHNICIAN MESSAGE
    ========================= */
    try {
      const techMsg = await client.messages.create({
        from: "whatsapp:+14155238886",
        to: "whatsapp:+919930888088",
        body: `🚨 *New Booking Alert*

👤 Patient: ${req.body.patientName}
📞 Phone: ${req.body.phone}

🧪 Tests:
${testList}

📅 Date: ${req.body.appointmentDate}
💰 Amount: ₹${req.body.totalAmount}`,
      });

      console.log("✅ Technician Message SID:", techMsg.sid);
    } catch (err) {
      console.log("❌ Technician WhatsApp Error:", err.message);
    }

    res.json({
      success: true,
      message: "Booking saved & WhatsApp sent ✅",
    });

  } catch (error) {
    console.log("❌ FULL ERROR:", error.message);
    res.status(500).json({ message: "Error saving booking" });
  }
});

/* ================================
   CONTACT API
================================ */
app.post("/contact", async (req, res) => {
  try {
    const { name, phone, subject } = req.body;

    await new Contact(req.body).save();

    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: "whatsapp:+919930888088",
      body: `📩 New Contact!

Name: ${name}
Phone: ${phone}
Subject: ${subject}`,
    });

    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:+91${phone}`,
      body: `🙏 Thank you for contacting Alina Diagnostics!`,
    });

    res.json({ success: true });

  } catch (error) {
    console.log("❌ Contact Error:", error.message);
    res.status(500).json({ message: "Error" });
  }
});

/* ================================
   SERVER
================================ */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});