// api/chibo.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ambil kunci API dari lingkungan Vercel
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = request.body;

    if (!message) {
      return response.status(400).json({ error: "Message is required" });
    }

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const result = await chat.sendMessage(message);
    const text = (await result.response).text();

    return response.status(200).json({ response: text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return response.status(500).json({ error: "Gagal terhubung dengan asisten AI." });
  }
}
