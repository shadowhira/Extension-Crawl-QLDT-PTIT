const puppeteer = require("puppeteer");
const minimal_args = require("../constant/minimalArgs");
require('dotenv').config(); 
const { selectAndClickUl } = require('./selectFeature'); // Import hàm chọn thẻ ul
const fs = require("fs");


const crawlHoaDon = async (page) => {
  // Chọn và click thẻ ul (truyền chỉ số từ dưới lên, ví dụ: 4)
  const ulIndexFromBottom = 5; // Thẻ <ul> thứ 4 từ dưới lên
  await selectAndClickUl(page, ulIndexFromBottom);

  // Chờ đến khi bảng xuất hiện
  await page.waitForSelector("table.table-hover");

  // Lấy tất cả các hàng trong tbody của bảng
  const data = await page.$$eval("table.table-hover tbody tr", (rows) => {
    return rows.map((row) => {
      const cells = row.querySelectorAll("td");
      return {
        stt: cells[0]?.innerText.trim(),
        maSV: cells[1]?.innerText.trim(),
        tenSinhVien: cells[2]?.innerText.trim(),
        lop: cells[3]?.innerText.trim(),
        ngaySinh: cells[4]?.innerText.trim(),
        soHoaDon: cells[5]?.innerText.trim(),
        soTien: cells[6]?.innerText.trim(),
        ngayDong: cells[7]?.innerText.trim(),
        ngayLapPhieu: cells[8]?.innerText.trim(),
        hocKy: cells[9]?.innerText.trim(),
        ghiChu: cells[10]?.innerText.trim(),
      };
    });
  });

  // Ghi dữ liệu thành tệp JSON
  fs.writeFileSync('dataCrawl/HoaDon.json', JSON.stringify(data, null, 2), 'utf-8');
  console.log('Dữ liệu thời khóa biểu đã được lưu vào timetableData.json');
  console.log(data); // In dữ liệu đã crawl được
};

module.exports = crawlHoaDon;
