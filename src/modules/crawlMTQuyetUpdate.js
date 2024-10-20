const puppeteer = require("puppeteer");
const fs = require('fs');
const minimal_args = require("../constant/minimalArgs");
require('dotenv').config();

const PASSWORD = process.env.QLDT_PASSWORD;
const USERNAME = process.env.QLDT_USERNAME;

// Hàm retry toàn bộ quá trình crawl
async function crawlWithRetry(fn, retries = 3, waitTime = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn(); // Thực hiện hàm crawl
    } catch (err) {
      console.error(`Attempt ${i + 1} failed. Retrying entire crawl process...`);
      if (i === retries - 1) throw err; // Nếu đã hết retries thì throw error
      await new Promise(resolve => setTimeout(resolve, waitTime)); // Chờ trước khi retry
    }
  }
}

// Hàm retry logic để đảm bảo không miss thao tác
async function tryWithRetry(fn, retries = 3, waitTime = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn(); // Thực hiện hành động
    } catch (err) {
      console.error(`Attempt ${i + 1} failed. Retrying action...`);
      if (i === retries - 1) throw err; // Nếu hết retries thì throw error
      await new Promise(resolve => setTimeout(resolve, waitTime)); // Chờ trước khi retry
    }
  }
}

const crawlMTQuyetUpdate = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: minimal_args,
    userDataDir: './path/to/cache/resource', // cache tài nguyên
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 700 });

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

  // Điều hướng tới trang chủ và chờ trang tải xong
  await page.goto("https://qldt.ptit.edu.vn/#/home", {
    waitUntil: "networkidle2",
    timeout: 30000,
  });

  // Chờ các selector của username/password xuất hiện song song
  await Promise.all([
    page.waitForSelector("input[name='username']", { visible: true }),
    page.waitForSelector("input[name='password']", { visible: true })
  ]);

  // Nhập username và password với retry logic
  await tryWithRetry(() => page.type("input[name='username']", USERNAME));
  await tryWithRetry(() => page.type("input[name='password']", PASSWORD));

  // Nhấn nút đăng nhập và chờ điều hướng
  await Promise.all([
    tryWithRetry(() => page.click("button[class='btn btn-primary mb-1 ng-star-inserted']")),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  // Chờ và click vào link "Xem môn tiên quyết"
  await page.waitForSelector("a#WEB_XEMMONTIENQUYET", { visible: true });
  await page.click("a#WEB_XEMMONTIENQUYET");

  const allTableData = [];
  let hasNextPage = true;

  // Hàm để crawl dữ liệu từ bảng
  async function crawlTableData() {
    await page.waitForSelector("#excel-table tbody tr", { visible: true });
    return await page.evaluate(() => {
      const rows = document.querySelectorAll("#excel-table tbody tr");
      const data = [];

      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length > 0) {
          data.push({
            stt: cells[0]?.innerText?.trim(),
            maMonDangKy: cells[1]?.innerText?.trim(),
            tenMonDangKy: cells[2]?.innerText?.trim(),
            maMonYeuCau: cells[3]?.innerText?.trim(),
            tenMonYeuCau: cells[4]?.innerText?.trim(),
            heDaoTao: cells[5]?.innerText?.trim(),
            nganh: cells[6]?.innerText?.trim(),
            khoi: cells[7]?.innerText?.trim(),
          });
        }
      });

      return data;
    });
  }

  // Hàm chuyển sang trang tiếp theo
  async function goToNextPage() {
    const isNextButtonDisabled = await page.evaluate(() => {
      const nextButton = document.querySelector(".pagination-next");
      return nextButton ? nextButton.classList.contains("disabled") : true;
    });

    if (!isNextButtonDisabled) {
      await tryWithRetry(() => page.click(".pagination-next a"));
      await page.waitForSelector("#excel-table tbody tr", { visible: true });
      return true;
    }
    return false;
  }

  // Lặp qua các trang và crawl dữ liệu
  while (hasNextPage) {
    const tableData = await crawlTableData();
    allTableData.push(...tableData);
    hasNextPage = await goToNextPage();
  }

  // Lưu dữ liệu vào file JSON
  fs.writeFileSync('dataCrawl/mon_tien_quyet.json', JSON.stringify(allTableData, null, 2));

  console.log("Dữ liệu đã được lưu vào file 'mon_tien_quyet.json'");
  await browser.close();
};

// Export hàm crawl để sử dụng ở nơi khác
module.exports = {
  crawlMTQuyetUpdate: () => crawlWithRetry(crawlMTQuyetUpdate, 3)
};
