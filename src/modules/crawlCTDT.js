const puppeteer = require("puppeteer");
const minimal_args = require("../constant/minimalArgs");
require('dotenv').config(); 

const PASSWORD = process.env.QLDT_PASSWORD;
const USERNAME = process.env.QLDT_USERNAME;

// Hàm crawl thông tin tiết thành phần
async function crawlTietThanhPhan(page, index) {
  // Click vào icon tiết thành phần
  await page.evaluate((index) => {
    const rows = document.querySelectorAll("#excel-table tbody tr");
    const icon = rows[index].querySelector("td i");
    if (icon) {
      icon.click(); // Click để mở popup
    }
  }, index);

  // Chờ popup hiện ra hoặc popup cảnh báo hiện ra
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Chờ popup

  // Kiểm tra nếu có thông báo "Môn học không có tiết thành phần"
  const isNoTietThanhPhan = await page.evaluate(() => {
    const toastMessage = document.querySelector(".toast-message");
    if (
      toastMessage &&
      toastMessage.innerText.includes("Môn học không có tiết thành phần")
    ) {
      return true;
    }
    return false;
  });

  if (isNoTietThanhPhan) {
    console.log(`Môn học không có tiết thành phần`);

    // Đóng popup cảnh báo
    await page.evaluate(() => {
      const closeButton = document.querySelector(".toast-close-button");
      if (closeButton) {
        closeButton.click(); // Click vào nút đóng của popup cảnh báo
      }
    });

    return "Không có tiết thành phần"; // Trả về thông báo
  } else {
    // Nếu không có cảnh báo, lấy thông tin tiết thành phần từ popup
    const tietThanhPhanData = await page.evaluate(() => {
      const rows = document.querySelectorAll(".modal-content tbody tr");
      const tietThanhPhan = [];

      rows.forEach((row) => {
        const tenThanhPhan = row
          .querySelector("td:nth-child(2)")
          ?.innerText?.trim();
        const soTiet = row.querySelector("td:nth-child(3)")?.innerText?.trim();
        if (tenThanhPhan && soTiet) {
          tietThanhPhan.push({ tenThanhPhan, soTiet });
        }
      });

      return tietThanhPhan;
    });

    // Đóng popup sau khi lấy thông tin
    await page.evaluate(() => {
      const closeButton = document.querySelector(".modal-footer button");
      if (closeButton) {
        closeButton.click(); // Click vào nút đóng
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Chờ popup đóng

    return tietThanhPhanData; // Trả về dữ liệu tiết thành phần
  }
}

const crawlCTDT = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: minimal_args,
  }); // Mở Chrome với giao diện
  const page = await browser.newPage();

  // Điều hướng tới trang đăng nhập
  await page.goto("https://qldt.ptit.edu.vn/#/home", {
    waitUntil: "networkidle2",
    timeout: 30000,
  }); // chờ cho không còn yêu cầu mạng nào đang được thực hiện.

  await page.waitForSelector("input[name='username']");

  // Nhập tên đăng nhập và mật khẩu
  await page.type("input[name='username']", USERNAME); // Thay '#username' bằng selector thật

  await page.waitForSelector("input[name='password']");
  await page.type("input[name='password']", PASSWORD); // Thay '#password' bằng selector thật

  await Promise.all([
    page.click("button[class='btn btn-primary mb-1 ng-star-inserted']"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  // Chờ phần tử "Xem chương trình đào tạo" xuất hiện
  await page.waitForSelector("a#WEB_CTDT", { visible: true });

  // Click vào liên kết "Xem chương trình đào tạo"
  await page.click("a#WEB_CTDT");

  // Chờ cho bảng xuất hiện
  await page.waitForSelector("#excel-table", { visible: true });

  // Lấy dữ liệu từ bảng
  const tableData = await page.evaluate(() => {
    const rows = document.querySelectorAll("#excel-table tbody tr"); // Lấy tất cả các hàng trong bảng
    const data = [];

    let i = 0;
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td"); // Lấy tất cả các ô trong hàng
      if (cells.length > 0) {
        const rowData = {
          stt: cells[0]?.innerText?.trim(),
          maMH: cells[1]?.innerText?.trim(),
          tenMH: cells[2]?.innerText?.trim(),
          soTinChi: cells[3]?.innerText?.trim(),
          tongTiet: cells[11]?.innerText?.trim(),
          lyThuyet: cells[12]?.innerText?.trim(),
          thucHanh: cells[13]?.innerText?.trim(),
          tietThanhPhanIcon: !!cells[14]?.querySelector("i"), // Kiểm tra xem có icon tiết thành phần hay không
        };
        data.push(rowData); // Lưu dữ liệu của mỗi hàng vào mảng
      }
    });
    return data;
  });

  console.log("Dữ liệu bảng chính:", JSON.stringify(tableData, null, 2));

  // Khi bạn muốn crawl thông tin tiết thành phần cho một môn cụ thể
  const index = 0; // Ví dụ crawl thông tin tiết thành phần cho hàng đầu tiên (index = 0)
  if (tableData[index].tietThanhPhanIcon) {
    const tietThanhPhan = await crawlTietThanhPhan(page, index);
    console.log(
      `Tiết thành phần của môn ${tableData[index].tenMH}:`,
      tietThanhPhan
    );
  }

  await browser.close();
};

module.exports = crawlCTDT;
