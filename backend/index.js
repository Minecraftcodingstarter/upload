// backend/index.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Speicher-Setup: Dateien in private_uploads/username speichern
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const username = req.body.username.trim();
    const dir = path.join(__dirname, 'private_uploads', username);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Statische Freigabe des Upload-Ordners unter /uploads
app.use('/uploads', express.static(path.join(__dirname, 'private_uploads')));

// Upload-Route mit URL-Rückgabe
app.post('/upload', upload.single('file'), (req, res) => {
  const username = req.body.username.trim();
  if (!req.file) return res.status(400).send('Keine Datei übermittelt.');

  const fileUrl = `${BASE_URL}/uploads/${username}/${req.file.filename}`;

  // Optional: Upload-Log führen
  try {
    const logPath = path.join(__dirname, 'upload-log.json');
    let log = [];
    if (fs.existsSync(logPath)) {
      log = JSON.parse(fs.readFileSync(logPath));
    }
    log.push({ username, filename: req.file.filename, timestamp: new Date().toISOString() });
    fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
  } catch (e) {
    console.error('Fehler beim Schreiben des Upload-Logs:', e);
  }

  res.json({ success: true, url: fileUrl });
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 Backend läuft unter ${BASE_URL}`);
});
