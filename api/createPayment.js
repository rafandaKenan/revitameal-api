const axios = require("axios");

module.exports = async (req, res) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://revitameal-82d2e.web.app",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const MAYAR_SECRET_KEY = process.env.MAYAR_SECRET_KEY;
    const { amount, description, customer_name, customer_email } = req.body;

    const response = await axios.post(
      "https://api.mayar.id/v1/payment",
      {
        amount,
        description,
        customer_name,
        customer_email,
        return_url: "https://revitameal-82d2e.web.app/success",
      },
      {
        headers: {
          Authorization: `Bearer ${MAYAR_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Normalisasi response → frontend selalu terima redirect_url
    res.status(200).json({
      redirect_url: response.data.payment_url || response.data.redirect_url,
      raw: response.data, // debug: seluruh respon dari Mayar
    });
  } catch (error) {
    console.error("Mayar API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Payment creation failed", detail: error.response?.data });
  }
};
