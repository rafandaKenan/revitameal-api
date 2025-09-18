export default async function handler(req, res) {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { total, orderId, customer_email } = req.body;

    if (!total || !orderId || !customer_email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Request ke Mayar API
    const response = await fetch("https://app.mayar.id/api/v1/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAYAR_API_KEY}`,
      },
      body: JSON.stringify({
        total,
        reference_id: orderId,
        customer_email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Payment API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
