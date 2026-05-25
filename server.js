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

app.post("/book", async (req, res) => {
  try {
    const { name, phone, booking_date, booking_time } = req.body;

    if (!name || !phone || !booking_date || !booking_time) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const formattedPhone = phone.startsWith("+")
      ? phone
      : "+965" + phone;

    const { data, error } = await supabase
      .from("booking")
      .insert([{ name, phone: formattedPhone, booking_date, booking_time }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    await client.messages.create({
      body: `📅 تم تأكيد موعدك\n👤 ${name}\n📆 ${booking_date}\n⏰ ${booking_time}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    await client.messages.create({
      body: `🔥 عندك حجز جديد\n👤 ${name}\n📞 ${formattedPhone}\n📆 ${booking_date}\n⏰ ${booking_time}`,
      from: "whatsapp:+14155238886",
      to: "whatsapp:+96598704772"
    });

    return res.json({ success: true, data });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000 🚀");
});