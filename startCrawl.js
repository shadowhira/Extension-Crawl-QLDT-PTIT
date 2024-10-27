const puppeteer = require('puppeteer');
const minimal_args = require("./src/constant/minimalArgs");
// const chromeLauncher = require('chrome-launcher');
const storage = require('node-localstorage').LocalStorage;

// Khởi tạo local storage
const localStorage = new storage('./scratch');

(async () => {
  // Sử dụng dynamic import để import chrome-launcher
  const chromeLauncher = await import('chrome-launcher');

  const USERNAME = localStorage.getItem('username');
  const PASSWORD = localStorage.getItem('password');

  if (!USERNAME || !PASSWORD) {
    console.log("Missing credentials.");
    return;
  }

  const browser = await puppeteer.launch({
    headless: false,
    args: minimal_args,
    userDataDir: './path/to/cache/resource',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 500 });

  // Chặn tài nguyên không cần thiết
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (['image', 'media'].includes(request.resourceType())) {
      request.abort();
    } else {
      request.continue();
    }
  });

  await page.goto('https://qldt.ptit.edu.vn/#/home', { waitUntil: 'networkidle2', timeout: 60000 });

  // Đăng nhập với tài khoản và mật khẩu từ local storage
  await page.type("input[name='username']", USERNAME);
  await page.type("input[name='password']", PASSWORD);
  await Promise.all([
    page.click("button[class='btn btn-primary mb-1 ng-star-inserted']"),
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
  ]);

  console.log("Logged in successfully!");

  // Gọi các hàm crawl khác như crawlCTDT, crawlMTQuyet...
  
  await browser.close();
})();
