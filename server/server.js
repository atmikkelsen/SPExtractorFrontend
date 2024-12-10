const https = require("https");
const fs = require("fs");
const express = require("express");
const path = require("path");

const app = express();

// Serve static files from the root directory
app.use(express.static(__dirname));

// Handle all other requests and fallback to `index.html`
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Load SSL key and certificate
const options = {
  key: fs.readFileSync(path.join(__dirname, "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert.pem")),
};

// Start the HTTPS server
https.createServer(options, app).listen(3000, () => {
  console.log("Server running at https://localhost:3000");
});
