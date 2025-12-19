/**
 * Simple Node.js server to serve the React build
 * Railway-safe (Express 5 / strict router compatible)
 */

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const BUILD_DIR = path.join(__dirname, "build");

// Serve static assets
app.use(express.static(BUILD_DIR));

// React SPA fallback (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(BUILD_DIR, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Serving build from ${BUILD_DIR}`);
});