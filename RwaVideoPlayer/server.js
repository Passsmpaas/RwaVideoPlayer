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

// Serve frontend
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
    if (!ins || !userid || !token) {
      return res.status(400).json({ error: "Institute, UserID, and Token required" });
    }

    const hdr = buildHeaders(ins, userid, token);
    const response = await fetch(`https://${ins}/get/mycourse?userid=${userid}`, { headers: hdr });
    const data = await response.json();

    // Format for frontend
    const batches = data.data.map(b => ({
      id: b.id,
      name: b.course_name,
    }));

    res.json({ batches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch batches" });
  }
});

// Fetch Subjects
app.post("/api/subjects", async (req, res) => {
  try {
    const { ins, userid, token, courseid } = req.body;
    if (!ins || !userid || !token || !courseid) {
      return res.status(400).json({ error: "Institute, UserID, Token, and CourseID required" });
    }

    const hdr = buildHeaders(ins, userid, token);
    const response = await fetch(`https://${ins}/get/allsubjectfrmlivecourseclass?courseid=${courseid}`, { headers: hdr });
    const data = await response.json();

    res.json({ subjects: data.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// Fetch Topics + Download Links
app.post("/api/topics", async (req, res) => {
  try {
    const { ins, userid, token, courseid, subjectid } = req.body;
    if (!ins || !userid || !token || !courseid || !subjectid) {
      return res.status(400).json({ error: "Institute, UserID, Token, CourseID, and SubjectID required" });
    }

    const hdr = buildHeaders(ins, userid, token);
    const response = await fetch(`https://${ins}/get/alltopicfrmlivecourseclass?courseid=${courseid}&subjectid=${subjectid}`, { headers: hdr });
    const data = await response.json();

    const topics = data.data.map(t => ({
      topicid: t.topicid,
      topic_name: t.topic_name,
      download_link: t.download_link || t.pdf_link || null,
    }));

    res.json({ topics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
         
