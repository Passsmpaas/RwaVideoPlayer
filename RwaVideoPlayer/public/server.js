import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// Path setup (for ES module support)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (if needed later)
app.use(express.static(__dirname));

// ✅ Serve test.html on root "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "test.html"));
});

// ✅ API route to fetch batches (demo for now)
app.get("/api/batches", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    // 🔹 Demo response (later replace with actual RWA API call)
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
  
