
const pt = require("puppeteer");
const minimal_args = require("../constant/minimalArgs");
const { login } = require('../modules/loginModule'); // Import hàm đăng nhập
const { getGrades } = require('../modules/crawlDiem'); // Import hàm lấy điểm

class xemDiemController {
  handleLogic = async (req, res, next) => {
    try {
      // Khởi tạo browser
      const browser = await pt.launch({
        headless: false,
        args: minimal_args,
        userDataDir: "./path/to/cache/resource",
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1000, height: 500 });

      // Điều chỉnh chặn tài nguyên không cần thiết
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        const resourceType = request.resourceType();
        if (["image", "media"].includes(resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });

      // Điều hướng đến URL
      await page.goto("https://qldt.ptit.edu.vn/#/home", {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      // Đăng nhập
      await login(page); // Đảm bảo hàm login đã được import từ module tương ứng

      // Gọi hàm getGrades để lấy điểm
      const grades = await getGrades(page);

      // Đóng trình duyệt
      await browser.close();

      // Gửi dữ liệu điểm về client
      res.json(grades);
    } catch (error) {
      console.error("Lỗi khi xử lý xem điểm:", error);
      next(error); // Gọi middleware xử lý lỗi
    }
  };
}

module.exports = new xemDiemController();
