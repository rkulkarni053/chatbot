const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Directory to store files
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // Unique file name
  },
});
const upload = multer({ storage });

// Ensure the uploads directory exists
const fs = require("fs");
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

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

// Save responses to the database
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

// Routes

// GET /questions/:process - Fetch questions for a specific process
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

// POST /responses - Save user responses to the database (with optional file upload)
app.post("/responses", upload.single("file"), (req, res) => {
  const { process, responses } = req.body;
  const filePath = req.file ? req.file.path : null;

  // Validate request body
  if (!process || !responses || !Array.isArray(JSON.parse(responses))) {
    return res.status(400).json({ error: "Process and an array of responses are required." });
  }

  // Parse responses as JSON
  const parsedResponses = JSON.parse(responses);

  // Save responses to the database
  saveToDatabase(process, parsedResponses, filePath, res);
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
