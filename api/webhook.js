// /api/webhook.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    const event = req.body;

    if (event.status === "paid") {
      await db.collection("orders").doc(event.reference_id).update({
        status: "paid",
        paid_at: new Date()
      });
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Webhook gagal" });
  }
}
