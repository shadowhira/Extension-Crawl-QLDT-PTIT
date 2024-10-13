const puppeteer = require("puppeteer");
const minimal_args = require("../constant/minimalArgs");

const crawlAllCTDT = async () => {
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
  await page.type("input[name='username']", "b21dccn680"); // Thay '#username' bằng selector thật

  await page.waitForSelector("input[name='password']");
  await page.type("input[name='password']", "B21dccn680@31133.slink0"); // Thay '#password' bằng selector thật

  await Promise.all([
    page.click("button[class='btn btn-primary mb-1 ng-star-inserted']"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  // Chờ phần tử "Xem chương trình đào tạo" xuất hiện
  await page.waitForSelector("a#WEB_CTDT", { visible: true });
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Thay thế waitForTimeout bằng setTimeout
  // Click vào liên kết "Xem chương trình đào tạo"
  await page.click("a#WEB_CTDT");

  // Chờ cho bảng xuất hiện
  await page.waitForSelector("#excel-table", { visible: true });

  // Lấy dữ liệu từ bảng
  const tableData = await page.evaluate(() => {
    const rows = document.querySelectorAll("#excel-table tbody tr"); // Lấy tất cả các hàng trong bảng
    const data = [];

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
          tietThanhPhanIcon: cells[14]?.querySelector("i"), // Lấy icon để mở popup tiết thành phần
        };
        data.push(rowData); // Lưu dữ liệu của mỗi hàng vào mảng
      }
    });
    return data;
  });

  // Lấy chi tiết tiết thành phần của từng môn học
  for (let i = 0; i < tableData.length; i++) {
    if (tableData[i].tietThanhPhanIcon) {
      // Click vào icon tiết thành phần
      await page.evaluate((index) => {
        const rows = document.querySelectorAll("#excel-table tbody tr");
        const icon = rows[index].querySelector("td i");
        if (icon) {
          icon.click(); // Click để mở popup
        }
      }, i);

      // Chờ popup hiện ra hoặc popup cảnh báo hiện ra
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Thay thế waitForTimeout bằng setTimeout

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
        console.log(`Môn học ${tableData[i].tenMH} không có tiết thành phần`);

        // Đóng popup cảnh báo
        await page.evaluate(() => {
          const closeButton = document.querySelector(".toast-close-button");
          if (closeButton) {
            closeButton.click(); // Click vào nút đóng của popup cảnh báo
          }
        });
      } else {
        // Nếu không có cảnh báo, lấy thông tin tiết thành phần từ popup
        const tietThanhPhanData = await page.evaluate(() => {
          const rows = document.querySelectorAll(".modal-content tbody tr");
          const tietThanhPhan = [];

          rows.forEach((row) => {
            const tenThanhPhan = row
              .querySelector("td:nth-child(2)")
              ?.innerText?.trim();
            const soTiet = row
              .querySelector("td:nth-child(3)")
              ?.innerText?.trim();
            if (tenThanhPhan && soTiet) {
              tietThanhPhan.push({ tenThanhPhan, soTiet });
            }
          });

          return tietThanhPhan;
        });

        // Gán thông tin tiết thành phần vào dữ liệu của môn học
        tableData[i].tietThanhPhan = tietThanhPhanData;

        // Đóng popup sau khi lấy thông tin
        await page.evaluate(() => {
          const closeButton = document.querySelector(".modal-footer button");
          if (closeButton) {
            closeButton.click(); // Click vào nút đóng
          }
        });

        // Chờ popup đóng trước khi tiếp tục với hàng tiếp theo
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Thay thế waitForTimeout bằng setTimeout
      }
    }
  }

  // Hiển thị dữ liệu đã crawl, bao gồm thông tin tiết thành phần
  console.log(JSON.stringify(tableData, null, 2));

  await browser.close();
};

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

module.exports = crawlAllCTDT;
