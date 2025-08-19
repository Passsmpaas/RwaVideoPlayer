// server.js
import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// __dirname define karna (ESM ke liye)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static files serve karna (yahan tera test.html hoga)
app.use(express.static(path.join(__dirname, "public")));

// Proxy route for video stream
app.get("/proxy", async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send("❌ Missing url");

    console.log("🔗 Proxy fetching:", targetUrl);

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36",
      },
    });

    if (!response.ok) {
      return res.status(response.status).send("❌ Upstream fetch failed");
    }

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream"
    );

    response.body.pipe(res);
  } catch (err) {
    console.error("Proxy Error:", err.message);
    res.status(500).send("❌ Proxy Failed: " + err.message);
  }
});

// Start server
app.listen(PORT, () =>
  console.log(`✅ Stream Proxy running at http://localhost:${PORT}`)
);
