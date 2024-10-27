const puppeteer = require("puppeteer");
const minimal_args = require("../constant/minimalArgs");
require('dotenv').config(); 
const { selectAndClickUl } = require('./selectFeature'); // Import hàm chọn thẻ ul
const fs = require("fs");

const crawlXemHocPhi = async (page) => {
  // Chọn và click thẻ ul (truyền chỉ số từ dưới lên, ví dụ: 4)
  const ulIndexFromBottom = 6; // Thẻ <ul> thứ 4 từ dưới lên
  await selectAndClickUl(page, ulIndexFromBottom);

  // Mở combobox và lấy tất cả các lựa chọn
  console.log("Mở combobox...");
  // Chờ đợi combobox xuất hiện
  await new Promise((resolve) => setTimeout(resolve, 1000));
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
            const rowData = Array.from(cells).map((cell) => cell.innerText.trim());
      
            // Thêm key vào từng dòng dữ liệu tùy theo tableIndex
            let formattedRow;
            if (tableIndex + 1 === 1) {
              formattedRow = {
                stt: rowData[0],
                maMonHoc: rowData[1],
                dienGiai: rowData[2],
                hocLai: rowData[3],
                soTCHP: rowData[4],
                soTien: rowData[5],
                mienGiam: rowData[6],
                phaiThu: rowData[7],
              };
            } else if (tableIndex + 1 === 2) {
              formattedRow = {
                stt: rowData[0],
                maMonHoc: rowData[1],
                dienGiai: rowData[2],
                daThu: rowData[3],
              };
            } else {
              // Đối với các tableIndex khác không có yêu cầu đặc biệt
              formattedRow = rowData;
            }
      
            tableData.push(formattedRow);
          });
      
          data.push({ tableIndex: tableIndex + 1, rows: tableData });
        });
      
        return data;
      });
    }

    // Đẩy dữ liệu vào allTableData theo tùy chọn
    console.log(
      `Dữ liệu cho tùy chọn: ${option}`,
      i === 0 ? tableData : tablesData
    );
    allTableData.push({
      option: option,
      data: i === 0 ? tableData : tablesData,
    });
  }

  // Ghi dữ liệu thành tệp JSON
  fs.writeFileSync('dataCrawl/HocPhi.json', JSON.stringify(allTableData, null, 2), 'utf-8');
  console.log('Dữ liệu thời khóa biểu đã được lưu vào timetableData.json');
  // Hiển thị hoặc lưu toàn bộ dữ liệu đã crawl từ tất cả các kỳ học
  console.log(JSON.stringify(allTableData, null, 2));

};

module.exports = crawlXemHocPhi;
