const axios = require("axios");
const cors = require('cors');

// Gunakan middleware CORS
const corsMiddleware = cors({
  origin: ['http://localhost:5173', 'https://revitameal-82d2e.web.app'],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

module.exports = async (req, res) => {
  // Jalankan middleware CORS
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });

  // Handle preflight request (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Hanya izinkan metode POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const MAYAR_SECRET_KEY = process.env.MAYAR_SECRET_KEY;
    if (!MAYAR_SECRET_KEY) {
      return res.status(500).json({ error: "MAYAR_SECRET_KEY tidak ditemukan" });
    }

    const { amount, description, customer_name, customer_email, orderId } = req.body;

    const response = await axios.post(
      "https://api.mayar.id/v1/payment-link",
      {
        amount,
        description: description || "Pesanan Revitameal",
        customer_name,
        customer_email,
        return_url: "https://revitameal-82d2e.web.app/success",
        callback_url: `https://revitameal-82d2e.web.app/api/payment-callback?orderId=${orderId}`
      },
      {
        headers: {
          Authorization: `Bearer ${MAYAR_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      redirect_url: response.data.payment_url || response.data.redirect_url,
      raw: response.data,
    });
  } catch (error) {
    console.error("Error API Mayar:", error.response?.data || error.message);
    res.status(500).json({
      error: "Pembuatan pembayaran gagal",
      detail: error.response?.data || error.message,
    });
  }
};
