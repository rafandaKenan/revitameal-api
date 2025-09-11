export default async function handler(req, res) {
  // ✅ Setup CORS
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

    // ✅ Cek apakah API key terbaca
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY not found in environment variables!");
      return res.status(500).json({ error: "Server misconfigured: API key missing." });
    }

    console.log("✅ GEMINI_API_KEY loaded");
    console.log("📩 User message:", message);

    // 🔥 Panggil Gemini API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await geminiRes.json();

    // ✅ Log response biar kelihatan di Vercel Logs
    console.log("📩 Gemini raw response:", JSON.stringify(data, null, 2));

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
    console.error("🔥 Internal server error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
