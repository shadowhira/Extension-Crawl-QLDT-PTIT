const puppeteer = require("puppeteer");

const minimal_args = [
  "--disable-speech-api",
  "--disable-background-networking",
  "--disable-background-timer-throttling",
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
    headless: false, // có giao diện
    args: minimal_args,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 700 });

  console.log("Điều hướng tới trang...");
  await page.goto("https://qldt.ptit.edu.vn/#/home", {
    waitUntil: "networkidle2",
    timeout: 30000,
  });

  console.log("Chờ trường đăng nhập xuất hiện...");
  await page.waitForSelector("input[name='username']");
  await page.type("input[name='username']", "b21dccn680");

  await page.waitForSelector("input[name='password']");
  await page.type("input[name='password']", "B21dccn680@31133.slink0");

  console.log("Đăng nhập...");
  await Promise.all([
    page.click("button[class='btn btn-primary mb-1 ng-star-inserted']"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  console.log("Chờ liên kết học phí xuất hiện...");
  await page.waitForSelector("a#WEB_HOCPHI", { visible: true });
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await page.click("a#WEB_HOCPHI");

  // Mở combobox và lấy tất cả các lựa chọn
  console.log("Mở combobox...");
  // Chờ đợi combobox xuất hiện
  await page.waitForSelector(".ng-select-container");
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mở combobox bằng cách click vào nó
  await page.click(".ng-select-container");

  // Chờ dropdown được mở ra
  await page.waitForSelector(".ng-dropdown-panel .ng-option");
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Crawl tất cả các options từ combobox
  const options = await page.evaluate(() => {
    const optionElements = document.querySelectorAll(
      ".ng-dropdown-panel .ng-option"
    );
    console.log("optionElements: ", optionElements);
    const optionsData = [];
    optionElements.forEach((option) => {
      optionsData.push(option.innerText.trim());
    });
    return optionsData;
  });

  console.log("Tất cả các tùy chọn trong combobox:", options);

  if (options.length === 0) {
    console.error("Không có lựa chọn nào trong combobox!");
    await browser.close();
    return; // Thoát nếu không có tùy chọn
  }

  const allTableData = [];

  // Lặp qua từng lựa chọn trong combobox
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    console.log(`Chọn tùy chọn: ${option}`);
  
    // Mở lại combobox
    await page.click(".ng-select");
  
    // Chọn tùy chọn bằng cách so sánh với văn bản
    await page.evaluate((optionLabel) => {
      const optionElements = document.querySelectorAll(
        ".ng-dropdown-panel .ng-option"
      );
      optionElements.forEach((option) => {
        if (option.innerText.trim() === optionLabel) {
          option.click(); // Nhấn vào tùy chọn có văn bản khớp với optionLabel
        }
      });
    }, option);
  
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Chờ trang cập nhật bảng
  
    // Khởi tạo biến để lưu dữ liệu bảng
    let tableData = [];
    let tablesData = [];
  
    // Crawl dữ liệu từ bảng mới cập nhật
    console.log("Chờ bảng dữ liệu xuất hiện...");
    if (i === 0) {
      await page.waitForSelector("#excel-table tbody tr", { visible: true });
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Chờ trang cập nhật bảng
      tableData = await page.evaluate(() => {
        const rows = document.querySelectorAll("#excel-table tbody tr");
        const data = [];
        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (cells.length > 0) {
            const rowData = {
              stt: cells[0]?.innerText?.trim(),
              niên_học_học_kỳ: cells[1]?.innerText?.trim(),
              hp_chua_giam: cells[2]?.innerText?.trim(),
              mien_giam: cells[3]?.innerText?.trim(),
              phai_thu: cells[4]?.innerText?.trim(),
              da_thu: cells[5]?.innerText?.trim(),
              con_no: cells[6]?.innerText?.trim(),
            };
            data.push(rowData);
          }
        });
        return data;
      });
    }
  
    if (i > 0) {
      // Crawl dữ liệu từ các bảng theo class
      tablesData = await page.evaluate(() => {
        const data = [];
        const tables = document.querySelectorAll("table.table");
  
        tables.forEach((table, tableIndex) => {
          const tableData = [];
          const rows = table.querySelectorAll("tbody tr");
  
          rows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            const rowData = Array.from(cells).map((cell) =>
              cell.innerText.trim()
            );
            tableData.push(rowData);
          });
  
          data.push({ tableIndex: tableIndex + 1, rows: tableData });
        });
  
        return data;
      });
    }
  
    // Đẩy dữ liệu vào allTableData theo tùy chọn
    console.log(`Dữ liệu cho tùy chọn: ${option}`, i === 0 ? tableData : tablesData);
    allTableData.push({
      option: option,
      data: i === 0 ? tableData : tablesData,
    });
  }
  

  // Hiển thị hoặc lưu toàn bộ dữ liệu đã crawl từ tất cả các kỳ học
  console.log(JSON.stringify(allTableData, null, 2));

  await browser.close();
})();
