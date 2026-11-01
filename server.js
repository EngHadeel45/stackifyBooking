
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const app = express();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const { supabase } = require("./lib/supabase");

app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

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

    // 1. حفظ الحجز أولاً
    const { data, error } = await supabase
      .from("booking")
      .insert([{
        name,
        phone: formattedPhone,
        booking_date,
        booking_time
      }])
      .select()
      .single();

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return res.status(500).json({
        success: false,
        error: "Booking could not be saved"
      });
    }

    // 2. إرسال SMS للعميل
    let smsStatus = "not_sent";

    try {
      await client.messages.create({
        body: `تم تأكيد موعدك\nالاسم: ${name}\nالتاريخ: ${booking_date}\nالوقت: ${booking_time}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });

      smsStatus = "sent";
    } catch (smsError) {
      console.error("SMS ERROR:", smsError.message);
      smsStatus = "failed";
    }

    // 3. إرسال WhatsApp لصاحبة الموقع
    let whatsappStatus = "not_sent";

    try {
      await client.messages.create({
        body: `🔥 حجز جديد!\nالاسم: ${name}\nالهاتف: ${formattedPhone}\nالتاريخ: ${booking_date}\nالوقت: ${booking_time}`,
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: process.env.OWNER_WHATSAPP
      });

      whatsappStatus = "sent";
    } catch (whatsappError) {
      console.error("WHATSAPP ERROR:", whatsappError.message);
      whatsappStatus = "failed";
    }

    // 4. الحجز ناجح حتى لو فشل أحد الإشعارات
    return res.json({
      success: true,
      data,
      notifications: {
        sms: smsStatus,
        whatsapp: whatsappStatus
      }
    });

  } catch (err) {
    console.error("BOOKING ERROR:", err);

    return res.status(500).json({
      success: false,
      error: "Unexpected server error"
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running 🚀");
});
