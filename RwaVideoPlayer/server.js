import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// ✅ Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "test.html"));
});

// ✅ API Endpoints mapping (from appx v1–v4 .py files)
const APPX_ENDPOINTS = {
  v1: "https://api.appx.one/v1/course/get/get_all_purchases",
  v2: "https://api.appx.one/v2/course/get/get_all_purchases",
  v3: "https://api.appx.one/v3/course/get/get_all_purchases",
  v4: "https://api.appx.one/v4/course/get/get_all_purchases"
};

// ✅ Fetch Batches Route
app.post("/api/batches", async (req, res) => {
  const { token, userid, version } = req.body;

  if (!token || !userid || !version) {
    return res.status(400).json({ error: "Token, UserID and Version are required" });
  }

  const endpoint = APPX_ENDPOINTS[version];
  if (!endpoint) {
    return res.status(400).json({ error: "Invalid API version selected" });
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": token,
        "client-id": "1" // ✅ ye header appx .py se confirm karna hoga
      },
      body: JSON.stringify({ userId: userid })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch from AppX API",
        details: data
      });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching batches:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
