const https = require("https");
const fs = require("fs");
const express = require("express");
const path = require("path");

const app = express();

// Adjust path to serve static files from the parent directory
app.use(express.static(path.join(__dirname, "..")));

// Explicitly serve JS modules and other static files
app.get("*.js", (req, res) => {
  res.type("application/javascript");
  res.sendFile(path.join(__dirname, "..", req.path));
});

// Handle all other requests and fallback to `index.html`
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Load SSL key and certificate from the parent directory
const options = {
  key: fs.readFileSync(path.join(__dirname, "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert.pem")),
};

// Start the HTTPS server
https.createServer(options, app).listen(3000, () => {
  console.log("Server running at https://localhost:3000");
});
