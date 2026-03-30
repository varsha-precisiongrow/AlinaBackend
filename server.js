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

// 🔹 Test Schema
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

// 🔹 Corporate Wellness
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

// 🔹 Booking Schema
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

// 🔹 ✅ Contact Schema (FIXED)
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

app.get("/test", (req, res) => {
  res.send("Server is working ✅");
});

// 👉 Browser test
app.get("/contact", (req, res) => {
  res.send("Contact API working ✅ (Use POST)");
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
   BOOKING API
================================ */
app.post("/booking", async (req, res) => {
  try {
    console.log("🔥 Booking API hit");

    const newBooking = new Booking(req.body);
    await newBooking.save();

    console.log("✅ Booking saved in DB");

    // 📲 Patient WhatsApp
    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:+91${req.body.phone}`,
      body: `✅ Booking Confirmed!

Patient: ${req.body.patientName}
Test: ${req.body.testName}
Date: ${req.body.appointmentDate}

- Alina Diagnostics`,
    });

    // 📲 Admin WhatsApp
    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: "whatsapp:+919930888088",
      body: `🚨 New Booking Alert!

Patient: ${req.body.patientName}
Phone: ${req.body.phone}
Test: ${req.body.testName}`,
    });

    res.json({
      success: true,
      message: "Booking saved & WhatsApp sent ✅",
    });

  } catch (error) {
    console.log("❌ Booking Error:", error);
    res.status(500).json({ message: "Error saving booking" });
  }
});

/* ================================
   CONTACT API
================================ */
app.post("/contact", async (req, res) => {
  try {
    console.log("🔥 Contact API hit");

    const { name, email, phone, subject, message } = req.body;

    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    await newContact.save();
    console.log("✅ Contact saved in DB");

    // 📲 Admin WhatsApp
    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: "whatsapp:+919930888088",
      body: `📩 New Contact Form!

Name: ${name}
Phone: ${phone}
Email: ${email}
Subject: ${subject}

Message:
${message}`,
    });

    // 📲 User WhatsApp
    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:+91${phone}`,
      body: `🙏 Thank you for contacting Alina Diagnostics!

We received your query:
"${subject}"

We will contact you soon.`,
    });

    res.json({
      success: true,
      message: "Contact saved & WhatsApp sent ✅",
    });

  } catch (error) {
    console.log("❌ Contact Error:", error);
    res.status(500).json({ message: "Error saving contact" });
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

// const bookingSchema = new mongoose.Schema(
//   {
//     patientName: String,
//     phone: String,
//     testName: String,
//     appointmentDate: String,
//     createdAt: { type: Date, default: Date.now },
//   },
//   { collection: "bookings" }
// );
// const Booking = mongoose.model("Booking", bookingSchema);

// /* ================================
//    ROUTES
// ================================ */

// app.get("/", (req, res) => {
//   res.send("Backend server is running 🚀");
// });

// /* ================================
//    CONTACT API
// ================================ */
// app.post("/contact", async (req, res) => {
//   try {
//     console.log("🔥 Contact API hit");

//     const { name, email, phone, subject, message } = req.body;

//     // ✅ SAVE TO DB
//     const newContact = new Contact({
//       name,
//       email,
//       phone,
//       subject,
//       message,
//     });

//     await newContact.save();
//     console.log("✅ Contact saved in DB");

//     // 🔴 IMPORTANT: validate phone
//     const formattedPhone = `whatsapp:+91${phone}`;

//     // 📲 ADMIN MESSAGE
//     try {
//       const adminMsg = await client.messages.create({
//         from: "whatsapp:+14155238886",
//         to: "whatsapp:+919930888088",
//         body: `📩 New Contact Form!

//         Name: ${name}
//         Phone: ${phone}
//         Email: ${email}
//         Subject: ${subject}

//         Message:
//         ${message}`,
//       });

//       console.log("✅ Admin WhatsApp SID:", adminMsg.sid);
//     } catch (err) {
//       console.log("❌ Admin WhatsApp Error:", err.message);
//     }

//     // 📲 USER MESSAGE
//     try {
//       const userMsg = await client.messages.create({
//         from: "whatsapp:+14155238886",
//         to: formattedPhone,
//         body: `🙏 Thank you for contacting Alina Diagnostics!

//         We received your query:
//         "${subject}"

//         We will contact you soon.`,
//       });

//       console.log("✅ User WhatsApp SID:", userMsg.sid);
//     } catch (err) {
//       console.log("❌ User WhatsApp Error:", err.message);
//     }

//     res.json({
//       success: true,
//       message: "Contact saved & WhatsApp processed ✅",
//     });

//   } catch (error) {
//     console.log("❌ Contact Error:", error);
//     res.status(500).json({ message: "Error saving contact" });
//   }
// });

// /* ================================
//    BOOKING API
// ================================ */
// app.post("/booking", async (req, res) => {
//   try {
//     console.log("🔥 Booking API hit");

//     const { patientName, phone, testName, appointmentDate } = req.body;

//     const newBooking = new Booking({
//       patientName,
//       phone,
//       testName,
//       appointmentDate,
//     });

//     await newBooking.save();
//     console.log("✅ Booking saved in DB");

//     const formattedPhone = `whatsapp:+91${phone}`;

//     // 📲 PATIENT MESSAGE
//     try {
//       const patientMsg = await client.messages.create({
//         from: "whatsapp:+14155238886",
//         to: formattedPhone,
//         body: `✅ Booking Confirmed!

//         Patient: ${patientName}
//         Test: ${testName}
//         Date: ${appointmentDate}

//         - Alina Diagnostics`,
//       });

//       console.log("✅ Patient WhatsApp SID:", patientMsg.sid);
//     } catch (err) {
//       console.log("❌ Patient WhatsApp Error:", err.message);
//     }

//     // 📲 ADMIN MESSAGE

//     try {
//       const adminMsg = await client.messages.create({
//         from: "whatsapp:+14155238886",
//         to: "whatsapp:+919930888088",
//         body: `🚨 New Booking Alert!

//         Patient: ${patientName}
//         Phone: ${phone}
//         Test: ${testName}`,
//       });

//       console.log("✅ Admin WhatsApp SID:", adminMsg.sid);
//     } catch (err) {
//       console.log("❌ Admin WhatsApp Error:", err.message);
//     }

//     res.json({
//       success: true,
//       message: "Booking saved & WhatsApp processed ✅",
//     });

//   } catch (error) {
//     console.log("❌ Booking Error:", error);
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

