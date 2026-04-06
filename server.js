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
//    Twilio Setup (SMS)
// ================================ */
// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// console.log("TWILIO SID CHECK:", process.env.TWILIO_ACCOUNT_SID);

// /* ================================
//    MODELS
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
//     items: Array,
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
//     phone: String,
//     email: String,
//     age: Number,
//     gender: String,
//     items: Array,
//     appointmentDate: String,
//     paymentMethod: String,
//     totalAmount: Number,
//     doctorName: String,
//     createdAt: { type: Date, default: Date.now },
//   },
//   { collection: "bookings" }
// );
// const Booking = mongoose.model("Booking", bookingSchema);

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

// /* -------- Single Test -------- */
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
//    Razorpay
// ================================ */
// app.post("/create-order", async (req, res) => {
//   try {
//     const instance = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET,
//     });

//     const order = await instance.orders.create({
//       amount: req.body.amount * 100,
//       currency: "INR",
//       receipt: "receipt_" + Date.now(),
//     });

//     res.json(order);
//   } catch (error) {
//     console.error("Razorpay Error:", error);
//     res.status(500).send("Error creating order");
//   }
//   });

//   /* ================================
//     BOOKING API (SMS FINAL)
//   ================================ */
//   app.post("/booking", async (req, res) => {
//     try {
//     // console.log("🔥 Booking API hit");

//     // const newBooking = new Booking(req.body);
//     // await newBooking.save();

//     // console.log("✅ Booking saved");

//     // const testList =
//     //   req.body.items?.map((t, i) => `${i + 1}. ${t.name}`).join("\n") ||
//     //   "No tests";
//      console.log("📦 Incoming Data:", req.body);

// // safer phone
// const phone = req.body.phone.startsWith("+91")
//   ? req.body.phone
//   : `+91${req.body.phone}`;

//    // safer items

//     const testData = req.body.items || [];
//     const testList = testData.length > 0
//     ? testData.map((t, i) => `${i + 1}. ${t.name}`).join("\n")
//     : "No tests";

//     // 📲 Patient SMS
//     try {
//       const msg = await client.messages.create({
//         body: `✅ Booking Confirmed!

//       Patient: ${req.body.patientName}
//       Date: ${req.body.appointmentDate}
//       Amount: ₹${req.body.totalAmount}

//       Alina Diagnostics`,
//         from: process.env.TWILIO_SMS_NUMBER,
//         to: `+91${req.body.phone}`,
//       });

//       console.log("✅ Patient SMS:", msg.sid);
//     } catch (err) {
//       console.log("❌ Patient SMS Error:", err.message);
//     }

//     // 👨‍🔬 Technician SMS
//     try {
//       const msg = await client.messages.create({
//         body: `🚨 New Booking Alert!

//         Patient: ${req.body.patientName}
//         Phone: ${req.body.phone}

//         Tests:
//         ${testList}

//         Date: ${req.body.appointmentDate}
//         Amount: ₹${req.body.totalAmount}`,
//         from: process.env.TWILIO_SMS_NUMBER,
//         to: "+919930888088",
//       });

//       console.log("✅ Technician SMS:", msg.sid);
//     } catch (err) {
//       console.log("❌ Technician SMS Error:", err.message);
//     }

//     res.json({ success: true });

//   } catch (error) {
//     console.log("❌ FULL ERROR:", error.message);
//     res.status(500).json({ message: "Error saving booking" });
//   }
// });

// /* ================================
//    CONTACT API (SMS)
// ================================ */
// app.post("/contact", async (req, res) => {
//   try {
//     const { name, phone, subject } = req.body;

//     await new Contact(req.body).save();

//     await client.messages.create({
//       from: process.env.TWILIO_SMS_NUMBER,
//       to: "+919930888088",
//       body: `📩 New Contact!

//       Name: ${name}
//       Phone: ${phone}
//       Subject: ${subject}`,
//     });

//     await client.messages.create({
//       from: process.env.TWILIO_SMS_NUMBER,
//       to: `+91${phone}`,
//       body: `🙏 Thank you for contacting Alina Diagnostics!`,
//     });

//     res.json({ success: true });

//   } catch (error) {
//     console.log("❌ Contact Error:", error.message);
//     res.status(500).json({ message: "Error" });
//   }
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
   Twilio Setup (SMS)
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
    items: Array,
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
    items: Array,
    appointmentDate: String,
    paymentMethod: String,
    totalAmount: Number,
    doctorName: String,
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

/* -------- Single Test -------- */
app.get("/tests/:slug", async (req, res) => {
  try {
    const test = await Test.findOne({ slug: req.params.slug });

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.json(test);
  } catch (error) {
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
   Razorpay
================================ */
// app.post("/create-order", async (req, res) => {
//   try {
//     const instance = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET,
//     });

//     const order = await instance.orders.create({
//       amount: req.body.amount * 100,
//       currency: "INR",
//       receipt: "receipt_" + Date.now(),
//     });

//     res.json(order);
//   } catch (error) {
//     console.error("Razorpay Error:", error);
//     res.status(500).send("Error creating order");
//   }
// });
app.post("/create-order", async (req, res) => {
  try {
    console.log("💰 Incoming amount:", req.body.amount);

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amount = Number(req.body.amount);

    if (!amount) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const order = await instance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    console.log("✅ ORDER CREATED:", order);

    res.json(order);

  } catch (error) {
    console.log("❌ Razorpay ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});
/* ================================
   BOOKING API (SAVE + SMS)
================================ */
app.post("/booking", async (req, res) => {
  try {
    console.log("📦 Incoming Data:", req.body);

    // ✅ SAVE TO MONGODB
    const newBooking = new Booking(req.body);
    await newBooking.save();
    console.log("✅ Booking saved in MongoDB");

    // ✅ SAFE PHONE
    const phone = req.body.phone.startsWith("+91")
      ? req.body.phone
      : `+91${req.body.phone}`;

    // ✅ ITEMS LIST
    const testData = req.body.items || [];
    const testList =
      testData.length > 0
        ? testData.map((t, i) => `${i + 1}. ${t.name}`).join("\n")
        : "No tests";

    /* 📲 PATIENT SMS */
    try {
      const msg = await client.messages.create({
        body: `✅ Booking Confirmed!

Patient: ${req.body.patientName}
Date: ${req.body.appointmentDate}
Amount: ₹${req.body.totalAmount}

Alina Diagnostics`,
        from: process.env.TWILIO_SMS_NUMBER,
        to: phone,
      });

      console.log("✅ Patient SMS:", msg.sid);
    } catch (err) {
      console.log("❌ Patient SMS Error:", err.message);
    }

    /* 👨‍🔬 TECHNICIAN SMS */
    try {
      const msg = await client.messages.create({
        body: `🚨 New Booking Alert!

Patient: ${req.body.patientName}
Phone: ${phone}

Tests:
${testList}

Date: ${req.body.appointmentDate}
Amount: ₹${req.body.totalAmount}`,
        from: process.env.TWILIO_SMS_NUMBER,
        to: "+919930888088",
      });

      console.log("✅ Technician SMS:", msg.sid);
    } catch (err) {
      console.log("❌ Technician SMS Error:", err.message);
    }

    res.json({
      success: true,
      message: "Booking saved & SMS sent ✅",
    });

  } catch (error) {
    console.log("❌ FULL ERROR:", error.message);
    res.status(500).json({ message: "Error saving booking" });
  }
});

/* ================================
   CONTACT API (SMS)
================================ */
app.post("/contact", async (req, res) => {
  try {
    const { name, phone, subject } = req.body;

    await new Contact(req.body).save();

    const formattedPhone = phone.startsWith("+91")
      ? phone
      : `+91${phone}`;

    await client.messages.create({
      from: process.env.TWILIO_SMS_NUMBER,
      to: "+919930888088",
      body: `📩 New Contact!

Name: ${name}
Phone: ${formattedPhone}
Subject: ${subject}`,
    });

    await client.messages.create({
      from: process.env.TWILIO_SMS_NUMBER,
      to: formattedPhone,
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

// app.use((req, res, next) => {
//   res.setHeader("Content-Type", "text/html; charset=UTF-8");
//   next();
// });

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
//     phone: String,
//     email: String,
//     age: Number,
//     gender: String,
//     tests: Array,
//     appointmentDate: String,
//     paymentMethod: String,
//     totalAmount: Number,
//     doctorName: String, // ✅ added
//     createdAt: { type: Date, default: Date.now },
//   },
//   { collection: "bookings" }
// );
// const Booking = mongoose.model("Booking", bookingSchema);

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
// /* -------- Single Test Details (FIXED) -------- */
// app.get("/tests/:slug", async (req, res) => {
//   try {
//     console.log("🔍 Fetching test:", req.params.slug);

//     const test = await Test.findOne({ slug: req.params.slug });

//     if (!test) {
//       console.log("❌ Test not found");
//       return res.status(404).json({ message: "Test not found" });
//     }

//     console.log("✅ Test found");
//     res.json(test);

//   } catch (error) {
//     console.log("❌ Error fetching test:", error.message);
//     res.status(500).json({ message: "Error fetching test" });
//   }
//   });
//   /* -------- Corporate Wellness -------- */
//   app.get("/corporate-wellness", async (req, res) => {
//     try {
//       const packages = await CorporateWellnessPackage.find();
//       res.json(packages);
//     } catch {
//       res.status(500).json({ message: "Error fetching packages" });
//     }
//   });

//     /* ================================
//       Razorpay
//     ================================ */
//     app.post("/create-order", async (req, res) => {
//       try {
//         const instance = new Razorpay({
//           key_id: process.env.RAZORPAY_KEY_ID,
//           key_secret: process.env.RAZORPAY_KEY_SECRET,
//         });

//         const order = await instance.orders.create({
//           amount: req.body.amount * 100,
//           currency: "INR",
//           receipt: "receipt_" + Date.now(),
//         });

//         res.json(order);
//       } catch (error) {
//         console.error("Razorpay Error:", error);
//         res.status(500).send("Error creating order");
//       }
//     });

//     /* ================================
//       BOOKING API (FINAL)
//     ================================ */
//     app.post("/booking", async (req, res) => {
//       try {
//     console.log("🔥 Booking API hit");

//     console.log("PHONE:", req.body.phone);
//     console.log("FINAL TO:", `whatsapp:+91${req.body.phone}`);

//     const newBooking = new Booking(req.body);
//     await newBooking.save();

//     console.log("✅ Booking saved in DB");

//     // 🧪 Test list format
//     const testList =
//       req.body.tests?.map((t, i) => `${i + 1}. ${t.name}`).join("\n") ||
//       "No tests";

//     /* =========================
//        📲 PATIENT MESSAGE
//     ========================= */
//     // try {
//     //   const patientMsg = await client.messages.create({
//     //     body: `✅ Booking Confirmed!

//     // Patient: ${req.body.patientName}
//     // Date: ${req.body.appointmentDate}
//     // Amount: ₹${req.body.totalAmount}

//     // Alina Diagnostics`,

//     //     from: process.env.TWILIO_PHONE_NUMBER,
//     //     to: `+91${req.body.phone}`,
//     //   });

//     //   console.log("✅ Patient SMS Sent:", patientMsg.sid);

//     // } catch (err) {
//     //   console.log("❌ Patient SMS Error:", err);
//     // }
// const patientMsg = await client.messages.create({
//   body: `✅ Booking Confirmed!

// Patient: ${req.body.patientName}
// Date: ${req.body.appointmentDate}
// Amount: ₹${req.body.totalAmount}

// Alina Diagnostics`,
//   from: "whatsapp:+14155238886",
//   to: `whatsapp:+91${req.body.phone}`,  // ✅ FIXED
// });
//     /* =========================
//        👨‍🔬 TECHNICIAN MESSAGE
//     ========================= */
//     try {
//       const techMsg = await client.messages.create({
//         from: "whatsapp:+14155238886",
//         to: "whatsapp:+919930888088",
//         body: `🚨 *New Booking Alert*

//       👤 Patient: ${req.body.patientName}
//       📞 Phone: ${req.body.phone}

//       🧪 Tests:
//       ${testList}

//       📅 Date: ${req.body.appointmentDate}
//       💰 Amount: ₹${req.body.totalAmount}`,
//       });

//       console.log("✅ Technician Message SID:", techMsg.sid);
//     } catch (err) {
//       console.log("❌ Technician WhatsApp Error:", err.message);
//     }

//     res.json({
//       success: true,
//       message: "Booking saved & WhatsApp sent ✅",
//     });

//   } catch (error) {
//     console.log("❌ FULL ERROR:", error.message);
//     res.status(500).json({ message: "Error saving booking" });
//   }
// });

// /* ================================
//    CONTACT API
// ================================ */
// app.post("/contact", async (req, res) => {
//   try {
//     const { name, phone, subject } = req.body;

//     await new Contact(req.body).save();

//     await client.messages.create({
//       from: "whatsapp:+14155238886",
//       to: "whatsapp:+919930888088",
//       body: `📩 New Contact!

//       Name: ${name}
//       Phone: ${phone}
//       Subject: ${subject}`,
//     });

//     await client.messages.create({
//       from: "whatsapp:+14155238886",
//       to: `whatsapp:+91${phone}`,
//       body: `🙏 Thank you for contacting Alina Diagnostics!`,
//     });

//     res.json({ success: true });

//   } catch (error) {
//     console.log("❌ Contact Error:", error.message);
//     res.status(500).json({ message: "Error" });
//   }
// });

// /* ================================
//    SERVER
// ================================ */
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


