export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version"
  );

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { total, orderId, customer_email } = req.body;

    const response = await fetch("https://api.mayar.id/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAYAR_API_KEY}`,
      },
      body: JSON.stringify({
        amount: total,
        currency: "IDR",
        reference: orderId,
        customer_email,
        callback_url: "https://revitameal-chibo-1ov3xfix4-ackermanrafandra-9111s-projects.vercel.app/api/webhook",
        success_redirect_url: "https://revitameal-chibo-1ov3xfix4-ackermanrafandra-9111s-projects.vercel.app/success",
        failed_redirect_url: "https://revitameal-chibo-1ov3xfix4-ackermanrafandra-9111s-projects.vercel.app/failed",
      }),
    });

    const data = await response.json();
    return res.status(200).json({ payment: data });
  } catch (error) {
    console.error("Error createPayment:", error);
    return res.status(500).json({ message: "Gagal membuat pembayaran" });
  }
}
