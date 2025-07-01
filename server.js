// server.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose(); // Add SQLite
const app = express();

// Initialize SQLite database
const db = new sqlite3.Database('./responses.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create responses table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      process TEXT NOT NULL,
      question TEXT NOT NULL,
      response TEXT NOT NULL,
      file_path TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from public folder

// Paths (keep your existing file handling setup)
const uploadFolder = path.join(__dirname, 'uploads');
const downloadFolder = path.join(__dirname, 'downloads');

// Ensure folders exist
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });
if (!fs.existsSync(downloadFolder)) fs.mkdirSync(downloadFolder, { recursive: true });

// Multer setup (keep your existing configuration)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Modified route to save responses to SQLite
app.post("/responses", upload.single('file'), async (req, res) => {
  try {
    const { process, responses } = req.body;
    const file = req.file;

    if (!responses || !Array.isArray(responses)) {
      return res.status(400).send("Invalid responses format.");
    }

    // Insert each response into the database
    const stmt = await db.prepare("INSERT INTO responses (process, question, response, file_path) VALUES (?, ?, ?, ?)");
    
    for (const response of responses) {
      await stmt.run(
        process,
        response.question,
        response.response,
        file ? path.join(uploadFolder, file.filename) : null
      );
    }

    await stmt.finalize();
    res.status(200).send({ message: "Responses saved to database successfully." });
  } catch (err) {
    console.error("Error saving responses:", err);
    res.status(500).send("Error saving responses to database.");
  }
});

// Keep your existing routes for file download
app.get("/download/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(downloadFolder, fileName);

  if (fs.existsSync(filePath)) {
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error downloading file.");
      }
    });
  } else {
    res.status(404).send("File not found.");
  }
});

// Add a new route to fetch responses (optional)
app.get("/responses", (req, res) => {
  db.all("SELECT * FROM responses", [], (err, rows) => {
    if (err) {
      return res.status(500).send("Error fetching responses.");
    }
    res.status(200).json(rows);
  });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
