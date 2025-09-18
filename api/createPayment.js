export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const MAYAR_API_KEY = process.env.MAYAR_API_KEY;
    const { orderId, total, customer_email } = req.body;

    const payload = {
      amount: total,
      currency: "IDR",
      reference_id: orderId,
      customer_email,
      redirect_url: "https://yourwebsite.com/order/success",
      callback_url: "https://your-vercel-app.vercel.app/api/webhook"
    };

    const r = await fetch("https://mcp.mayar.id/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MAYAR_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    res.status(200).json({ checkout_url: data.checkout_url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal membuat payment link" });
  }
}
