// index.js
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json()); // Để parse JSON từ body request
// Route đơn giản
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});
app.use("/api", require("./src/routers/index"))

// Bắt đầu server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
