const axios = require('axios');
const cors = require('cors'); // Tambahkan baris ini

// Konfigurasi CORS
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = async (req, res) => {
  // Jalankan middleware cors terlebih dahulu
  await new Promise((resolve, reject) => {
    cors(corsOptions)(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });

  // Logika API utama
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const MAYAR_SECRET_KEY = process.env.MAYAR_SECRET_KEY;
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
        return_url: 'http://localhost:5173/success',
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
