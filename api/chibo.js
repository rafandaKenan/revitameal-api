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
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Server misconfigured: API key missing." });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Kamu adalah Chibo, asisten virtual nutrisi.
Tugasmu adalah memberikan jawaban singkat, jelas, dan praktis seputar diet, menu sehat, kebutuhan gizi, dan pemesanan makanan.
Hindari menjelaskan peranmu. Jawablah langsung sesuai konteks pertanyaan pengguna.`,
                },
              ],
            },
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const data = await geminiRes.json();

    if (!data || data.error) {
      return res.status(500).json({
        error: "Gemini API error",
        details: data.error || "Unknown error",
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf, tidak ada respon dari Gemini.";

    return res.status(200).json({ response: text });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
