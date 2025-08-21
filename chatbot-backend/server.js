// server.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const cors = require("cors");

// Initialize SQLite database
const db = new sqlite3.Database("./responses.db", (err) => {
  if (err) {
    console.error("Error opening database", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    // Create responses table if it doesn't exist
    db.run(`DROP TABLE IF EXISTS responses`, () => {
      db.run(`CREATE TABLE responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    process TEXT ,
    question TEXT,
    response TEXT,
    file_path TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
    });
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Uploads folder path - using local directory instead of hardcoded OneDrive path
const uploadsPath = path.join(__dirname, "uploads");

// Ensure uploads folder exists
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log(`Created uploads folder: ${uploadsPath}`);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

app.post("/responses", upload.single("file"), async (req, res) => {
  const { process } = req.body;
  const file = req.file;

  // Parse responses from string to array
  let responses;
  try {
    responses = JSON.parse(req.body.responses);
    if (!Array.isArray(responses)) {
      return res.status(400).send("responses should be an array.");
    }
  } catch (err) {
    return res.status(400).send("Invalid JSON format for responses.");
  }

  const filePath = file ? path.join(uploadsPath, file.filename) : null;

  if (file) {
    console.log(`File uploaded: ${file.filename}`);
    console.log(`Full path: ${filePath}`);
  }

  const stmt = db.prepare(`
    INSERT INTO responses (process, question, response, file_path)
    VALUES (?, ?, ?, ?)
  `);

  try {
    // Loop over array and insert each row
    for (const response of responses) {
      await new Promise((resolve, reject) => {
        stmt.run(
          process,
          response.question,
          response.response,
          filePath,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    stmt.finalize((err) => {
      if (err) console.error("Finalize error:", err.message);
    });

    res.status(200).send("Responses saved successfully.");
  } catch (err) {
    res.status(500).send("Database error.");
  }
});

// Keep your existing routes for file download
app.get("/", (req, res) => {
  res.send("HI");
});

app.get("/download/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(uploadsPath, fileName);

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
const PORT = 5600;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Files will be saved to: ${uploadsPath}`);
});
