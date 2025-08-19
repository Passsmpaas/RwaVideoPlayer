import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Static serve (test.html / frontend files)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// ===============================
// 🔹 RWA API PROXY (Batches)
// ===============================
app.get("/api/batches", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    // ✅ Actual RWA endpoint (replace with correct one if needed)
    const response = await fetch("https://rozgarapinew.teachx.in/api/v1/batches", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch from RWA API" });
    }

    const data = await response.json();

    // 🔹 Forward the real API response
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching batches:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ===============================
// 🔹 Root route
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "test.html"));
});

// ===============================
// 🔹 Start server
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
