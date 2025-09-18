// /pages/api/createPayment.js (Next.js / Vercel Function)
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { total, orderId, customer_email } = req.body;

    // 🔑 ambil API key Mayar dari environment variable
    const MAYAR_API_KEY = process.env.MAYAR_API_KEY;

    // panggil Mayar API
    const response = await fetch("https://api.mayar.id/v1/payment-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MAYAR_API_KEY}`,
      },
      body: JSON.stringify({
        amount: total,
        order_ref: orderId,
        customer: { email: customer_email },
        redirect_url: "https://your-frontend-domain.com/order-history",
      }),
    });

    const data = await response.json();
    return res.status(200).json({ payment: data });
  } catch (error) {
    console.error("Error creating payment link:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
