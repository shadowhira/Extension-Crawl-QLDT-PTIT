// Description: File chính để chạy chương trình
const pt = require('puppeteer');
const minimal_args = require("../src/constant/minimalArgs");
require('dotenv').config();

// Import các module cần thiết
const { selectAndClickUl } = require('./selectFeature'); // Import hàm chọn thẻ ul
const { getGrades } = require('./gradeModule'); // Import hàm lấy điểm
const { extractAllTimetable } = require('./allTKB'); // Import hàm lấy thời khóa biểu
const { extractTKBHK } = require('./tkbhk'); // Import hàm lấy thời khóa biểu học kỳ
const { extractLichThi } = require('./lichThi'); // Import hàm lấy lịch thi

// Lấy thông tin đăng nhập từ file .env
const PASSWORD = process.env.QLDT_PASSWORD;
const USERNAME = process.env.QLDT_USERNAME;

// Khởi tạo browser
pt.launch({
  headless: false,
  args: minimal_args,
  userDataDir: './path/to/cache/resource', // cache tài nguyên
}).then(async browser => {
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 500 });

  // Chặn các tài nguyên không cần thiết như ảnh, font, media, stylesheet
  await page.setRequestInterception(true);
  page.on('request', request => {
    const resourceType = request.resourceType();
    if (['image', 'media'].includes(resourceType)) {
      request.abort(); // Chặn các tài nguyên không cần thiết
    } else {
      request.continue();
    }
  });

  // Launch URL
  await page.goto('https://qldt.ptit.edu.vn/#/home', 
    {waitUntil: 'networkidle2', timeout: 30000});

  // Login process
  await page.type("input[name='username']", USERNAME);
  await page.type("input[name='password']", PASSWORD);
  await Promise.all([
    page.click("button[class='btn btn-primary mb-1 ng-star-inserted']"),
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
  ]);

  console.log("Logged in successfully!");

  
  await extractAllTimetable(page);  // Gọi hàm từ module lấy thời khóa biểu tuần

  await extractTKBHK(page);  // Gọi hàm từ module lấy thời khóa biểu học kỳ

  await extractLichThi(page);  // Gọi hàm từ module lấy lịch thi

  await getGrades(page); // Gọi hàm từ module lấy điểm


  // Close the browser
  await browser.close();
});
