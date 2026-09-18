const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 45 * 1024 * 1024 }
});

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

function requireConfig(res) {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    res.status(500).json({ ok: false, error: "Server is not configured yet." });
    return false;
  }
  return true;
}

app.post("/api/location", async (req, res) => {
  if (!requireConfig(res)) return;

  const { latitude, longitude, accuracy } = req.body || {};
  if (![latitude, longitude].every(Number.isFinite)) {
    return res.status(400).json({ ok: false, error: "Invalid location." });
  }

  const map = `https://maps.google.com/?q=${latitude},${longitude}`;
  const text =
    `📍 Location shared with permission\n` +
    `Latitude: ${latitude}\nLongitude: ${longitude}\n` +
    `Accuracy: ${Number.isFinite(accuracy) ? Math.round(accuracy) + " m" : "unknown"}\n` +
    `Map: ${map}`;

  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: ADMIN_CHAT_ID,
      text
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(502).json({ ok: false, error: "Could not send location to Telegram." });
  }
});

app.post("/api/video", upload.single("video"), async (req, res) => {
  if (!requireConfig(res)) return;
  if (!req.file) {
    return res.status(400).json({ ok: false, error: "No video received." });
  }

  try {
    const form = new FormData();
    form.append("chat_id", ADMIN_CHAT_ID);
    form.append("caption", "🎥 Video shared with permission");
    form.append("video", req.file.buffer, {
      filename: "recording.webm",
      contentType: req.file.mimetype || "video/webm"
    });

    await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`,
      form,
      { headers: form.getHeaders(), maxBodyLength: Infinity }
    );

    res.json({ ok: true });
  } catch (e) {
    res.status(502).json({ ok: false, error: "Could not send video to Telegram." });
  }
});

app.listen(PORT, () => {
  console.log(`SS0123 Web App running on port ${PORT}`);
});
