const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Speicherort außerhalb public
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

app.post('/upload', upload.single('file'), (req, res) => {
  const username = req.body.username;
  if (!req.file) return res.status(400).send('Keine Datei übermittelt.');

  // Loggen für den Entwickler
  const logPath = path.join(__dirname, 'upload-log.json');
  const log = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath)) : [];
  log.push({ username, filename: req.file.filename, timestamp: Date.now() });
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));

  res.json({ success: true, message: 'Upload erfolgreich. Danke!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});
