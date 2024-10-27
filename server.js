const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;

// Định nghĩa endpoint để bắt đầu quá trình crawl
app.post('/start-crawl', (req, res) => {
  console.log("Starting crawl...", req.body);

  // Chạy file Puppeteer
  exec('node startCrawl.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ message: 'Crawl failed.' });
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    res.json({ message: 'Crawl started.' });
  });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
