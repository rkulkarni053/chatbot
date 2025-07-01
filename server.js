// Backend: server.js
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Ensure the uploads directory exists
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Initialize SQLite Database
const db = new sqlite3.Database("./responses.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS responses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          process TEXT,
          question TEXT,
          response TEXT,
          filePath TEXT,
          dateAdded TEXT
        )`,
        (err) => {
          if (err) {
            console.error("Error creating table:", err.message);
          }
        }
      );
    });
  }
});

// Utility to save responses
const saveToDatabase = (process, responses, filePath, res) => {
  const query = `INSERT INTO responses (process, question, response, filePath, dateAdded) VALUES (?, ?, ?, ?, ?)`;
  const dateAdded = new Date().toISOString();

  db.serialize(() => {
    const stmt = db.prepare(query);
    responses.forEach(({ question, response }) => {
      stmt.run([process, question, response, filePath, dateAdded], (err) => {
        if (err) {
          console.error("Error saving response:", err.message);
          res.status(500).json({ error: "Failed to save responses." });
        }
      });
    });
    stmt.finalize();
    res.json({ message: "Responses and file saved successfully!" });
  });
};

// GET /questions/:process - Sample placeholder (optional)
app.get("/questions/:process", (req, res) => {
  const process = req.params.process.toLowerCase();
  if (process === "onboarding") {
    res.json([
      "Please download, sign, and upload the onboarding acknowledgment.",
    ]);
  } else if (process === "offboarding") {
    res.json([
      "Please download, sign, and upload the offboarding acknowledgment.",
    ]);
  } else {
    res.status(400).json({ error: "Invalid process. Use 'onboarding' or 'offboarding'." });
  }
});

// POST /responses - Save responses and file
app.post("/responses", upload.single("file"), (req, res) => {
  const { process, responses } = req.body;
  const filePath = req.file ? req.file.path : null;

  if (!process || !responses) {
    return res.status(400).json({ error: "Missing process or responses." });
  }

  let parsedResponses;
  try {
    parsedResponses = JSON.parse(responses);
  } catch (err) {
    return res.status(400).json({ error: "Invalid responses format." });
  }

  if (!Array.isArray(parsedResponses)) {
    return res.status(400).json({ error: "Responses must be an array." });
  }

  saveToDatabase(process, parsedResponses, filePath, res);
});

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
