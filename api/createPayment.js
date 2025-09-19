const axios = require("axios");

module.exports = async (req, res) => {
  // Set CORS headers untuk localhost development
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://revitameal-82d2e.web.app' // tambahkan domain production jika ada
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 jam

  // Handle preflight request
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
      return res.status(500).json({ error: "MAYAR_SECRET_KEY tidak ditemukan di environment" });
    }

    const { amount, description, customer_name, customer_email } = req.body;

    // Validasi input
    if (!amount || !customer_email) {
      return res.status(400).json({ error: "Amount dan customer_email diperlukan" });
    }

    const response = await axios.post(
      "https://api.mayar.id/v1/payment-link",
      {
        amount: Number(amount),
        description: description || "Pesanan Revitameal",
        customer_name: customer_name || "Customer",
        customer_email,
        return_url: "https://revitameal-82d2e.web.app/success",
        callback_url: "https://revitameal-82d2e.web.app/api/payment-callback" // optional
      },
      {
        headers: {
          Authorization: `Bearer ${MAYAR_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000 // timeout 10 detik
      }
    );

    res.status(200).json({
      success: true,
      redirect_url: response.data.url || response.data.payment_url,
      payment_id: response.data.id,
      raw: response.data
    });

  } catch (error) {
    console.error("Error dari API Mayar:", error.response?.data || error.message);
    
    if (error.response) {
      // Error dari Mayar API
      res.status(error.response.status).json({
        error: "Gagal membuat pembayaran",
        detail: error.response.data,
        status: error.response.status
      });
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      res.status(408).json({
        error: "Timeout - API Mayar tidak merespons"
      });
    } else {
      // Other errors
      res.status(500).json({
        error: "Internal server error",
        detail: error.message
      });
    }
  }
};
