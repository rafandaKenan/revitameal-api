export default async function handler(req, res) {
  const { items, total } = req.body;

  try {
    const response = await fetch("https://api.mayar.id/v1/payment-links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAYAR_SECRET_KEY}`,
      },
      body: JSON.stringify({
        title: "Pesanan LunchBoost",
        amount: total,
        currency: "IDR",
        customer_email: "user@example.com", // bisa diisi dari form user
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error create payment:", error);
    res.status(500).json({ error: "Gagal membuat link pembayaran" });
  }
}
