require('dotenv').config();

// Hàm đăng nhập
async function login(page, username, password) {
  // const USERNAME = process.env.QLDT_USERNAME;
  // const PASSWORD = process.env.QLDT_PASSWORD;

  // // Điền thông tin đăng nhập và thực hiện đăng nhập
  // await page.type("input[name='username']", USERNAME);
  // await page.type("input[name='password']", PASSWORD);

  await page.type("input[name='username']", username);
  await page.type("input[name='password']", password);

  await Promise.all([
    page.click("button[class='btn btn-primary mb-1 ng-star-inserted']"),
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
  ]);

  console.log("Logged in successfully!");
}

module.exports = { login };
