const puppeteer = require("puppeteer");
const minimal_args = require("../constant/minimalArgs");

const crawlHoaDon = async () => {
  const browser = await puppeteer.launch({
    // khởi chạy trình duyệt với các tùy chọn
    headless: false, // có giao diện
    args: minimal_args, // danh sách tùy chọn tối ưu
  });
  const page = await browser.newPage(); // tạo mới page

  await page.setViewport({ width: 1000, height: 700 }); // kích thước view

  await page.goto("https://qldt.ptit.edu.vn/#/home", {
    // điều hướng tới qldt
    waitUntil: "networkidle2", // chờ trang đã tải gần hoàn chỉnh
    timeout: 30000,
  });

  await page.waitForSelector("input[name='username']"); // chờ thằng này hiển thị
  await page.type("input[name='username']", "b21dccn680"); // nhập giá trị vào selector

  await page.waitForSelector("input[name='password']");
  await page.type("input[name='password']", "B21dccn680@31133.slink0");

  await Promise.all([
    // đồng thời làm 2 việc
    page.click("button[class='btn btn-primary mb-1 ng-star-inserted']"), // nhấn nút
    page.waitForNavigation({ waitUntil: "networkidle2" }), // chờ trang tải xong
  ]);

  await page.waitForSelector("a#WEB_HDDT", { visible: true });
  await new Promise((resolve) => setTimeout(resolve, 2000)); // đợi 2 giây cho thằng phía trên xuất hiện
  await page.click("a#WEB_HDDT");

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

  console.log(data); // In dữ liệu đã crawl được
  await browser.close(); // Đóng trình duyệt
};

module.exports = crawlHoaDon;
