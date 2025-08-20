import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// Path setup (for ES module support)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(__dirname));

// ✅ Serve test.html on root "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "test.html"));
});

// ✅ API route to fetch batches
app.post("/api/batches", async (req, res) => {
  const { token, userid } = req.body;

  if (!token || !userid) {
    return res.status(400).json({ error: "Token and UserID are required" });
  }

  try {
    const response = await fetch(
      "https://api.classplusapp.com/v2/course/get/get_all_purchases",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authorization": token,
          "client-id": "1",
        },
        body: JSON.stringify({ userId: userid }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch from RWA API",
        details: data,
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
