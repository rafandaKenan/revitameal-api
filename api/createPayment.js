export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { total, customer_email } = req.body;

    if (!total) {
      return res.status(400).json({ error: "Total amount is required" });
    }

    if (!process.env.MAYAR_SECRET_KEY) {
      return res
        .status(500)
        .json({ error: "Server misconfigured: API key missing." });
    }

    const mayarRes = await fetch("https://api.mayar.id/v1/payment-links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAYAR_SECRET_KEY}`,
      },
      body: JSON.stringify({
        title: "Pesanan LunchBoost",
        amount: total,
        currency: "IDR",
        customer_email: customer_email || "default@example.com",
      }),
    });

    const data = await mayarRes.json();

    if (!data || data.error) {
      return res.status(500).json({
        error: "Mayar API error",
        details: data.error || "Unknown error",
      });
    }

    // response dari Mayar biasanya ada URL payment
    return res.status(200).json({ payment: data });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
}
