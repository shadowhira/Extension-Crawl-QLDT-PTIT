require('dotenv').config();
const { crawlWithRetry, tryWithRetry } = require('./retryModule'); // Import các hàm retry

// Hàm đăng nhập
async function login(page) {
  const USERNAME = process.env.QLDT_USERNAME;
  const PASSWORD = process.env.QLDT_PASSWORD;

  // Điền thông tin đăng nhập và thực hiện đăng nhập
  await page.type("input[name='username']", USERNAME);
  await page.type("input[name='password']", PASSWORD);

  await Promise.all([
    page.click("button[class='btn btn-primary mb-1 ng-star-inserted']"),
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
  ]);

  console.log("Logged in successfully!");
}

module.exports = { login };
