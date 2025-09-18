// api/createPayment.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { total, orderId, customer_email } = req.body;

    // Panggil API Mayar
    const response = await fetch("https://api.mayar.id/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAYAR_API_KEY}`, // simpan API key di Vercel env
      },
      body: JSON.stringify({
        amount: total,
        currency: "IDR",
        reference: orderId,
        customer_email: customer_email,
        callback_url: "https://your-app.vercel.app/api/webhook", // untuk update status
        success_redirect_url: "https://your-app.vercel.app/success",
        failed_redirect_url: "https://your-app.vercel.app/failed",
      }),
    });

    const data = await response.json();

    return res.status(200).json({ payment: data });
  } catch (error) {
    console.error("Error createPayment:", error);
    return res.status(500).json({ message: "Gagal membuat pembayaran" });
  }
}
