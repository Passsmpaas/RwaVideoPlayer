import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// __dirname handle karna (ESM me default nahi hota)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static serve karega (public folder)
app.use(express.static(path.join(__dirname, "public")));

// Example API proxy route (API_KEY optional hai agar tum use karna chaho)
app.get("/api/test", async (req, res) => {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts/1", {
      headers: {
        "Authorization": `Bearer ${process.env.API_KEY || ""}`
      }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Root route (test.html serve karega)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "test.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Stream Proxy is running on port ${PORT}`);
});
