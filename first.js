const puppeteer = require("puppeteer");

const minimal_args = [
  "--disable-speech-api", // 	Disables the Web Speech API (both speech recognition and synthesis)
  "--disable-background-networking", // Disable several subsystems which run network requests in the background. This is for use 									  // when doing network performance testing to avoid noise in the measurements. ↪
  "--disable-background-timer-throttling", // Disable task throttling of timer tasks from background pages. ↪
  "--disable-backgrounding-occluded-windows",
  "--disable-breakpad",
  "--disable-client-side-phishing-detection",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-dev-shm-usage",
  "--disable-domain-reliability",
  "--disable-extensions",
  "--disable-features=AudioServiceOutOfProcess",
  "--disable-hang-monitor",
  "--disable-ipc-flooding-protection",
  "--disable-notifications",
  "--disable-offer-store-unmasked-wallet-cards",
  "--disable-popup-blocking",
  "--disable-print-preview",
  "--disable-prompt-on-repost",
  "--disable-renderer-backgrounding",
  "--disable-setuid-sandbox",
  "--disable-sync",
  "--hide-scrollbars",
  "--ignore-gpu-blacklist",
  "--metrics-recording-only",
  "--mute-audio",
  "--no-default-browser-check",
  "--no-first-run",
  "--no-pings",
  "--no-sandbox",
  "--no-zygote",
  "--password-store=basic",
  "--use-gl=swiftshader",
  "--use-mock-keychain",
];

(async () => {
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

  // Click vào liên kết "Xem chương trình đào tạo"
  await page.click("a#WEB_CTDT");

  // Chờ bảng chương trình đào tạo xuất hiện
  await page.waitForSelector("#excel-table", { visible: true });

  // Tìm hàng có môn "Đại số" và click vào icon để mở thông tin tiết thành phần
  await page.evaluate(() => {
    const rows = document.querySelectorAll("#excel-table tbody tr"); // Tìm tất cả các hàng trong bảng

    // Duyệt qua từng hàng để tìm môn Đại số
    for (const row of rows) {
      const cells = row.querySelectorAll("td"); // Tìm tất cả các ô trong hàng
      const tenMonHoc = cells[2]?.innerText?.trim(); // Lấy tên môn học ở cột thứ 3

      // Kiểm tra xem tên môn học có phải là "Đại số" không
      if (tenMonHoc === "Đại số") {
        const icon = cells[cells.length - 1].querySelector("i"); // Tìm thẻ <i> trong ô cuối cùng (icon)
        if (icon) {
          icon.click(); // Click vào icon để mở thông tin tiết thành phần
        }
        break; // Thoát vòng lặp sau khi đã tìm thấy môn Đại số
      }
    }
  });

  // Sử dụng setTimeout để chờ modal hiện ra
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Chờ 2 giây để modal tải hoàn tất

  // Lấy thông tin tiết thành phần từ modal
  const tietThanhPhan = await page.evaluate(() => {
    // Chọn tất cả các hàng trong bảng modal chứa thông tin tiết thành phần
    const rows = document.querySelectorAll(
      ".modal-dialog .modal-content tbody tr"
    );
    const result = [];

    // Duyệt qua từng hàng và lấy thông tin về từng thành phần và số tiết
    rows.forEach((row) => {
      const tenThanhPhan = row
        .querySelector("td:nth-child(2)")
        ?.innerText?.trim();
      const soTiet = row.querySelector("td:nth-child(3)")?.innerText?.trim();
      if (tenThanhPhan && soTiet) {
        result.push({ tenThanhPhan, soTiet });
      }
    });

    return result; // Trả về danh sách các thành phần và số tiết
  });

  console.log("Thông tin tiết thành phần của môn Đại số:", tietThanhPhan);

  await browser.close();
})();
