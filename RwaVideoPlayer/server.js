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
    if (!ins || !userid || !token)
      return res.status(400).json({ error: "Institute, UserID, and Token required" });

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
    if (!ins || !userid || !token || !courseid)
      return res.status(400).json({ error: "Institute, UserID, Token, and CourseID required" });

    const hdr = buildHeaders(ins, userid, token);
    const response = await fetch(
      `https://${ins}/get/allsubjectfrmlivecourseclass?courseid=${courseid}`,
      { headers: hdr }
    );
    const data = await response.json();
    if (!data.data) return res.status(404).json({ error: "No subjects found" });
    res.json(data.data);
  } catch (err) {
    console.error("❌ Error fetching subjects:", err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// Fetch Topics + Filter v2 transcoded links
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
      let videos = [];

      // collect all possible links from API response
      const possibleLinks = [];
      if (topic.download_link) possibleLinks.push(topic.download_link);
      if (topic.file_url) possibleLinks.push(topic.file_url);
      if (topic.stream_url) possibleLinks.push(topic.stream_url);
      if (topic.videopath) possibleLinks.push(topic.videopath);
      if (topic.bitrate_urls && Array.isArray(topic.bitrate_urls)) {
        topic.bitrate_urls.forEach((b) => possibleLinks.push(b.url || b.link));
      }

      // filter only non-DRM transcoded v2 links
      const validLinks = possibleLinks.filter(
        (u) => u && u.includes("transcoded-videos.securevideo.in") && !u.includes("drm")
      );

      console.log("🎥 Valid links for", topic.topic_name, ":", validLinks);

      // make resolution objects
      validLinks.forEach((u) => {
        let resLabel = "Auto";
        if (u.includes("720")) resLabel = "720p";
        else if (u.includes("480")) resLabel = "480p";
        else if (u.includes("360")) resLabel = "360p";
        videos.push({ quality: resLabel, url: u });
      });

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
