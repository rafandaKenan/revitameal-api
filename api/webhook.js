// api/webhook.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { reference, status } = req.body;

    // TODO: update status di Firestore (orders/{reference})
    console.log("Webhook Mayar:", reference, status);

    return res.status(200).json({ message: "Webhook diterima" });
  } catch (error) {
    console.error("Error webhook:", error);
    return res.status(500).json({ message: "Gagal memproses webhook" });
  }
}
