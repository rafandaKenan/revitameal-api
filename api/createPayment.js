const axios = require("axios");

module.exports = async (req, res) => {
  // Set CORS headers
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://revitameal-82d2e.web.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const MAYAR_SECRET_KEY = process.env.MAYAR_SECRET_KEY;
    if (!MAYAR_SECRET_KEY) {
      console.error('❌ MAYAR_SECRET_KEY not found');
      return res.status(500).json({ error: "Server configuration error" });
    }

    const { amount, description, customer_name, customer_email, orderId } = req.body;

    // Validasi input
    if (!amount || !customer_email) {
      return res.status(400).json({ 
        error: "Amount dan customer email diperlukan",
        details: req.body
      });
    }

    console.log('📦 Creating payment for order:', orderId);

    // ✅ FORMAT YANG BENAR sesuai dokumentasi Mayar
    const mayarData = {
      amount: Number(amount),
      description: description || `Order ${orderId || 'Revitameal'}`,
      customer_email: customer_email, // ✅ Perbaikan: snake_case
      customer_name: customer_name || 'Customer', // ✅ Perbaikan: snake_case
      redirect_url: "https://revitameal-82d2e.web.app/success", // ✅ Perbaikan: snake_case
      // callback_url: "https://your-domain.com/callback" // optional, ✅ Perbaikan: snake_case
    };

    console.log('🔄 Sending to Mayar:', mayarData);

    // ✅ ENDPOINT YANG BENAR
    const response = await axios.post(
      "https://api.mayar.id/v1/payment-links",
      mayarData,
      {
        headers: {
          "Authorization": `Bearer ${MAYAR_SECRET_KEY}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        timeout: 15000
      }
    );

    console.log('✅ Mayar response received');

    // ✅ Response format sesuai dokumentasi
    res.status(200).json({
      success: true,
      redirect_url: response.data.url,
      payment_id: response.data.id,
      order_id: orderId,
      raw: response.data
    });

  } catch (error) {
    console.error("❌ Mayar API Error:");
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
      
      res.status(error.response.status).json({
        error: "Payment creation failed",
        detail: error.response.data,
        status: error.response.status
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(408).json({
        error: "Timeout - Mayar API tidak merespons"
      });
    } else {
      console.log('Error message:', error.message);
      res.status(500).json({
        error: "Internal server error",
        detail: error.message
      });
    }
  }
};
