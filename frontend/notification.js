console.log("FORM SUBMIT WORKING");

// نمسك الفورم من الـ HTML
const form = document.getElementById("bookingForm");

// عنصر الرسالة
const statusMessage = document.getElementById("statusMessage");

// نراقب الفورم
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  console.log("🔥 FORM SUBMIT TRIGGERED");

  // نجيب القيم أول
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();

  console.log("PHONE VALUE:", phone);

  const formattedPhone = phone.startsWith("+965")
    ? phone
    : `+965${phone}`;

  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  statusMessage.textContent = "جاري إرسال الحجز...";
  statusMessage.style.color = "blue";

  if (!name || !phone) {
    statusMessage.textContent = "Please fill all fields";
    statusMessage.style.color = "red";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        phone: formattedPhone,
        booking_date: date,
        booking_time: time
      })
    });

    const data = await response.json();

    console.log("SERVER RESPONSE:", data);

    if (data.success) {
      statusMessage.textContent = "Booked Successfully ✔️";
      statusMessage.style.color = "green";
      form.reset();
    } else {
      statusMessage.textContent = data.error || "Booking failed";
      statusMessage.style.color = "red";
    }

  } catch (error) {
    console.log(error);
    statusMessage.textContent = "Server Error";
    statusMessage.style.color = "red";
  }
});