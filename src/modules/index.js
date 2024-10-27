// Description: File chính để chạy chương trình
const pt = require('puppeteer');
const minimal_args = require("../constant/minimalArgs");
require('dotenv').config();

// Import các module cần thiết
const { login } = require('./loginModule'); // Import hàm đăng nhập
const crawlCTDT = require("./crawlCTDT");  // Import hàm lấy chương trình đào tạo
const crawlMTQuyet = require("./crawlMTQuyet");  // Import hàm lấy môn tiên quyết
const crawlDKMH = require("./crawlDKMH"); // Import hàm lấy danh sách môn học dang ký
const crawlXemHocPhi = require("./crawlXemHocPhi");
const crawlHoaDon = require("./crawlHoaDon");
const { extractAllTimetable } = require('./crawlTKBTuan'); // Import hàm lấy thời khóa biểu
const { extractTKBHK } = require('./crawlTKBHK'); // Import hàm lấy thời khóa biểu học kỳ
const { extractLichThi } = require('./crawlLichThi'); // Import hàm lấy lịch thi
const { getGrades } = require('./crawlDiem'); // Import hàm lấy điểm

const crawlAllCTDT = require("./crawlAllCTDT");


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
    {waitUntil: 'networkidle2', timeout: 60000});

  // Gọi hàm đăng nhập từ module loginModule
  await login(page);

  // // Các thao tác khác sau khi đăng nhập

  // await crawlCTDT(page);  // Gọi hàm từ module lấy chương trình đào tạo

  // await crawlMTQuyet(page);  // Gọi hàm từ module lấy môn tiên quyết

  // // await crawlAllCTDT(page);  // Gọi hàm từ module lấy tất cả chương trình đào tạo

  // await crawlDKMH(page);  // Gọi hàm từ module lấy danh sách môn học đăng ký

  // await crawlXemHocPhi(page);  // Gọi hàm từ module lấy học phí

  // await crawlHoaDon(page);  // Gọi hàm từ module lấy hóa đơn
  
  // await extractAllTimetable(page);  // Gọi hàm từ module lấy thời khóa biểu tuần

  // await extractTKBHK(page);  // Gọi hàm từ module lấy thời khóa biểu học kỳ

  // await extractLichThi(page);  // Gọi hàm từ module lấy lịch thi

  await getGrades(page); // Gọi hàm từ module lấy điểm


  // Close the browser
  await browser.close();
});