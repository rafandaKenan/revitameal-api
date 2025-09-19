const axios = require('axios');
const cors = require('cors');

// Konfigurasi CORS
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",            // dev
      "https://revitameal-82d2e.web.app"  // production di Firebase Hosting
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = async (req, res) => {
  // Jalankan middleware CORS
  await new Promise((resolve, reject) => {
    cors(corsOptions)(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  // Tangani permintaan preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Ambil data dari body request
  const { amount, description, customer_name, customer_email } = req.body;
  const MAYAR_SECRET_KEY = process.env.MAYAR_SECRET_KEY; // pakai env di Vercel

  if (!MAYAR_SECRET_KEY) {
    return res.status(500).json({ error: "MAYAR_SECRET_KEY tidak ditemukan di environment variables" });
  }

  try {
    // Request ke Mayar API
    const response = await axios.post(
      "https://app.mayar.id/api/v1/payment/create",
      {
        amount,
        description,
        customer_name,
        customer_email,
        // ganti sesuai domain kamu di prod
        return_url: "https://revitameal-82d2e.web.app/success",
      },
      {
        headers: {
          Authorization: `Bearer ${MAYAR_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error membuat payment:", error.response?.data || error.message);
    res.status(500).json({
      error: "Gagal membuat payment",
      details: error.response?.data || error.message,
    });
  }
};
