const axios = require("axios");

module.exports = async (req, res) => {
  // HAPUS SEMUA KODE CORS DI SINI!
  // Vercel akan menanganinya dari vercel.json

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const MAYAR_SECRET_KEY = process.env.MAYAR_SECRET_KEY;
    if (!MAYAR_SECRET_KEY) {
      return res.status(500).json({ error: "Missing MAYAR_SECRET_KEY in env" });
    }

    const { amount, description, customer_name, customer_email } = req.body;

    const response = await axios.post(
      "https://api.mayar.id/v1/payment-link",
      {
        amount,
        description: description || "Revitameal Order",
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

    res.status(200).json({
      redirect_url: response.data.payment_url || response.data.redirect_url,
      raw: response.data,
    });
  } catch (error) {
    console.error("Mayar API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Payment creation failed",
      detail: error.response?.data || error.message,
    });
  }
};
