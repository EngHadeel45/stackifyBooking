<<<<<<< HEAD
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const twilio = require("twilio");

// Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const { supabase } = require("./lib/supabase");

console.log("FILE PATH:", __filename);

app.use(express.json());
app.use(cors({
  origin: "*" // يسمح لأي عنوان يكلم السيرفر
}));

// ===============================
// API: حجز موعد
// ===============================
app.post("/book", async (req, res) => {
  try {

    const { name, phone, booking_date, booking_time } = req.body;

    if (!name || !phone || !booking_date || !booking_time) {
      return res.status(400).json({
        success: false,
        error: "Missing fields"
      });
    }

    const formattedPhone = phone.startsWith("+")
      ? phone
      : "+965" + phone;

    const { data, error } = await supabase
      .from("booking")
      .insert([
        {
          name,
          phone: formattedPhone,
          booking_date,
          booking_time
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
// رسالة العميل — SMS بدل WhatsApp
await client.messages.create({
  body: `📅 تم تأكيد موعدك

👤 الاسم: ${name}
📆 التاريخ: ${booking_date}
⏰ الوقت: ${booking_time}

حياكم الله 🤍`,
  from: process.env.TWILIO_PHONE_NUMBER, // رقم Twilio العادي مو WhatsApp
  to: formattedPhone // رقم العميل SMS عادي
});

// رسالة الأونر — WhatsApp يبقى كما هو
await client.messages.create({
  body: `🔥 عندك حجز جديد

👤 ${name}
📞 ${formattedPhone}
📆 ${booking_date}
⏰ ${booking_time}`,
  from: "whatsapp:+14155238886",
  to: "whatsapp:+96598704772"
});

    return res.json({
      success: true,
      data
    });

  } catch (err) {
    console.log("SERVER ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ===============================
// تشغيل السيرفر
// ===============================
app.listen(3000, () => {
  console.log("Server running on port 3000 🚀");
=======
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const twilio = require("twilio");

// Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const { supabase } = require("./lib/supabase");

console.log("FILE PATH:", __filename);

app.use(express.json());
app.use(cors({
  origin: "*" // يسمح لأي عنوان يكلم السيرفر
}));

// ===============================
// API: حجز موعد
// ===============================
app.post("/book", async (req, res) => {
  try {

    const { name, phone, booking_date, booking_time } = req.body;

    if (!name || !phone || !booking_date || !booking_time) {
      return res.status(400).json({
        success: false,
        error: "Missing fields"
      });
    }

    const formattedPhone = phone.startsWith("+")
      ? phone
      : "+965" + phone;

    const { data, error } = await supabase
      .from("booking")
      .insert([
        {
          name,
          phone: formattedPhone,
          booking_date,
          booking_time
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
// رسالة العميل — SMS بدل WhatsApp
await client.messages.create({
  body: `📅 تم تأكيد موعدك

👤 الاسم: ${name}
📆 التاريخ: ${booking_date}
⏰ الوقت: ${booking_time}

حياكم الله 🤍`,
  from: process.env.TWILIO_PHONE_NUMBER, // رقم Twilio العادي مو WhatsApp
  to: formattedPhone // رقم العميل SMS عادي
});

// رسالة الأونر — WhatsApp يبقى كما هو
await client.messages.create({
  body: `🔥 عندك حجز جديد

👤 ${name}
📞 ${formattedPhone}
📆 ${booking_date}
⏰ ${booking_time}`,
  from: "whatsapp:+14155238886",
  to: "whatsapp:+96598704772"
});

    return res.json({
      success: true,
      data
    });

  } catch (err) {
    console.log("SERVER ERROR:", err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ===============================
// تشغيل السيرفر
// ===============================
app.listen(3000, () => {
  console.log("Server running on port 3000 🚀");
>>>>>>> a5a2db0abe2b8fd4577ba0cdc9e5ec94384709a5
});