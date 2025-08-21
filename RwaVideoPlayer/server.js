import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "test.html"));
});

// Helper to build headers
function buildHeaders(ins, userid, token) {
  return {
    "Client-Service": "Appx",
    "Auth-Key": "appxapi",
    "User-ID": userid,
    "Authorization": token,
    "User_app_category": "",
    "Language": "en",
    "Host": ins,
    "User-Agent": "okhttp/4.9.1",
  };
}

// Fetch Batches
app.post("/api/batches", async (req, res) => {
  try {
    const { ins, userid, token } = req.body;
    if (!ins || !userid || !token) return res.status(400).json({ error: "Institute, UserID, and Token required" });

    const hdr = buildHeaders(ins, userid, token);
    const response = await fetch(`https://${ins}/get/mycourse?userid=${userid}`, { headers: hdr });
    const data = await response.json();
    if (!data.data) return res.status(404).json({ error: "No batches found" });
    res.json(data.data);
  } catch (err) {
    console.error("❌ Error fetching batches:", err);
    res.status(500).json({ error: "Failed to fetch batches" });
  }
});

// Fetch Subjects
app.post("/api/subjects", async (req, res) => {
  try {
    const { ins, userid, token, courseid } = req.body;
    if (!ins || !userid || !token || !courseid) return res.status(400).json({ error: "Institute, UserID, Token, and CourseID required" });

    const hdr = buildHeaders(ins, userid, token);
    const response = await fetch(`https://${ins}/get/allsubjectfrmlivecourseclass?courseid=${courseid}`, { headers: hdr });
    const data = await response.json();
    if (!data.data) return res.status(404).json({ error: "No subjects found" });
    res.json(data.data);
  } catch (err) {
    console.error("❌ Error fetching subjects:", err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// Fetch Topics + Multiple Resolutions
app.post("/api/topics", async (req, res) => {
  try {
    const { ins, userid, token, courseid, subjectid } = req.body;
    if (!ins || !userid || !token || !courseid || !subjectid)
      return res.status(400).json({ error: "Institute, UserID, Token, CourseID, and SubjectID required" });

    const hdr = buildHeaders(ins, userid, token);
    const response = await fetch(
      `https://${ins}/get/alltopicfrmlivecourseclass?courseid=${courseid}&subjectid=${subjectid}`,
      { headers: hdr }
    );
    const data = await response.json();
    if (!data.data) return res.status(404).json({ error: "No topics found" });

    const topics = data.data.map((topic) => {
      // Collect multiple resolutions for each video
      const videos = [];
      if (topic.download_link) {
        // Assuming the API returns links with resolutions in some format
        const qualities = ["720p", "480p", "360p"]; // adjust according to real API
        qualities.forEach((q) => {
          videos.push({ resolution: q, url: topic.download_link.replace("720p", q) });
        });
      } else if (topic.pdf_link) {
        videos.push({ resolution: "pdf", url: topic.pdf_link });
      }

      return {
        topicid: topic.topicid,
        topic_name: topic.topic_name,
        videos,
      };
    });

    res.json(topics);
  } catch (err) {
    console.error("❌ Error fetching topics:", err);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
      
