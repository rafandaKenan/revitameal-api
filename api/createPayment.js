export default function handler(req, res) {
  const allowedOrigins = [
    "http://localhost:5173",                  // untuk development
    "https://revitameal-82d2e.web.app"        // untuk production di Firebase Hosting
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // lanjutkan handler API kamu
  res.status(200).json({ message: "OK" });
}
