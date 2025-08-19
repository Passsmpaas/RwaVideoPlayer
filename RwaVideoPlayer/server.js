import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// For serving test.html
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// ✅ Proxy route for batches
app.get("/api/batches", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    // 👉 yaha tumhe RWA ka actual API endpoint dalna hai
    // Example: https://api.rwa.com/v1/batches
    // Filhaal demo ke liye static data bhej raha hu
    /*
    const response = await fetch("https://rwa-api.com/batches", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    */

    // ❌ Demo batches only (replace with actual API response later)
    const data = {
      batches: [
        { name: "Batch 1 - Maths", streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
        { name: "Batch 2 - Science", streamUrl: "https://moctv.live/hls/moctv.m3u8" }
      ]
    };

    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching batches:", err);
    res.status(500).json({ error: "Failed to fetch batches" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
