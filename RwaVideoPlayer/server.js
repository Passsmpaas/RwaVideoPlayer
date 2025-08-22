
import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import { fetchBatches, fetchSubjects, fetchTopics } from './modules/api.js';

const app = express();
const PORT = process.env.PORT || 10000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "test.html"));
});

app.post("/api/batches", fetchBatches);
app.post("/api/subjects", fetchSubjects);
app.post("/api/topics", fetchTopics);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
