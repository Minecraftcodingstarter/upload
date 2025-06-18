const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const username = req.body.username.trim();
    const dir = path.join(__dirname, 'uploads', username);
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

  const filepath = `uploads/${username}/${req.file.filename}`;
  res.json({ success: true, path: filepath, url: `http://localhost:${PORT}/${filepath}` });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
  console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});
