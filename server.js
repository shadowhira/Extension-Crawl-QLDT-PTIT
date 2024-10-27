// index.js
const express = require('express');
const app = express();
const PORT = 3000;

// Route đơn giản
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});
app.use("/api", require("../backend/src/routers"))

// Bắt đầu server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
