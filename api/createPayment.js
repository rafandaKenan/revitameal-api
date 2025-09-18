const axios = require('axios');

module.exports = async (req, res) => {
  // Tangani permintaan preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const MAYAR_SECRET_KEY = process.env.MAYAR_SECRET_KEY; // Gunakan .env atau Vercel Environment Variables
  const { amount, description, customer_name, customer_email } = req.body;

  if (!MAYAR_SECRET_KEY) {
    return res.status(500).json({ error: 'MAYAR_SECRET_KEY is not set.' });
  }

  try {
    const response = await axios.post(
      'https://api.mayar.id/payment/create',
      {
        amount: amount,
        description: description,
        customer_name: customer_name,
        customer_email: customer_email,
        return_url: 'http://localhost:5173/success', // URL setelah pembayaran berhasil
        // Tambahkan data lain jika diperlukan
      },
      {
        headers: {
          'Authorization': `Bearer ${MAYAR_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const redirectUrl = response.data.data.redirect_url;
    res.status(200).json({ redirect_url: redirectUrl });

  } catch (error) {
    console.error('Mayar API Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to create payment.' });
  }
};
