const puppeteer = require("puppeteer");
const fs = require("fs");
require('dotenv').config(); // Đảm bảo dòng này nằm ở đầu file
const { selectAndClickUl } = require('./selectFeature'); // Import hàm chọn thẻ ul


const crawlDKMH = async (page) => {

  // Chọn và click thẻ ul (truyền chỉ số từ dưới lên, ví dụ: 4)
  const ulIndexFromBottom = 8; // Thẻ <ul> thứ 4 từ dưới lên
  await selectAndClickUl(page, ulIndexFromBottom);

  // Chờ combobox xuất hiện
  await page.waitForSelector(
    ".ng-select.ng-select-single.ng-untouched.ng-pristine.ng-valid"
  );

  await new Promise((resolve) => setTimeout(resolve, 2000)); // Chờ một chút để đảm bảo combobox đã được tải đầy đủ

  await page.click(
    ".ng-select.ng-select-single.ng-untouched.ng-pristine.ng-valid"
  );

  // Chờ dropdown hiển thị và crawl tất cả các options từ combobox
  await page.waitForSelector(".ng-dropdown-panel .ng-option");
  const options = await page.evaluate(() => {
    const optionElements = document.querySelectorAll(
      ".ng-dropdown-panel .ng-option"
    );
    const optionsData = Array.from(optionElements).map((option) =>
      option.innerText.trim()
    );
    return optionsData;
  });

  // Quét tất cả các options và hiển thị kết quả
  console.log("Tất cả các tùy chọn trong combobox:", options);

  if (options.length === 0) {
    console.error("Không có lựa chọn nào trong combobox!");
    await browser.close();
    return; // Thoát nếu không có tùy chọn
  }

  // Khởi tạo biến để lưu dữ liệu bảng
  const allTableData = [];

  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    console.log(`Chọn tùy chọn: ${option}`);

    // Mở lại combobox
    await page.click(".ng-select.ng-select-single");

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

    await new Promise((resolve) => setTimeout(resolve, 2000)); // Chờ để cập nhật giao diện

    if (option === 'Lọc theo khoa quản lý môn học' ||
        option === 'Lọc theo lớp' ||
        option === 'Lọc theo môn học') {
      console.log(
        `Tùy chọn "${options[i]}" đã chọn. Combobox thứ hai đã xuất hiện.`
      );

      await page.click(".ng-select.ng-select-searchable");

      // Quét tất cả các tùy chọn trong combobox thứ hai
      const secondOptions = await page.evaluate(() => {
        const optionElements = document.querySelectorAll(
          ".ng-dropdown-panel .ng-option"
        );
        const optionsData = Array.from(optionElements).map((option) =>
          option.innerText.trim()
        );
        return optionsData;
      });
      console.log("Tất cả các options trong Combox2: ", secondOptions);

      for (let j = 0; j < secondOptions.length; j++) {
        const secondOption = secondOptions[j];
        console.log(`Chọn tùy chọn thứ hai: ${secondOption}`);

        // Mở lại combobox thứ hai
        await page.click(".ng-select.ng-select-searchable");

        // Chọn tùy chọn trong combobox thứ hai
        await page.evaluate((secondOptionLabel) => {
          const optionElements = document.querySelectorAll(
            ".ng-dropdown-panel .ng-option"
          );
          optionElements.forEach((option) => {
            if (option.innerText.trim() === secondOptionLabel) {
              option.click(); // Nhấn vào tùy chọn có văn bản khớp với secondOptionLabel
            }
          });
        }, secondOption);

        await new Promise((resolve) => setTimeout(resolve, 2000)); // Chờ để cập nhật giao diện

        // Crawl dữ liệu từ bảng mới cập nhật
        console.log("Chờ bảng dữ liệu xuất hiện...");
        await page.waitForSelector(
          "table.table-sm.table-hover.table-bordered.mb-0 tbody tr",
          { visible: true }
        );
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Chờ trang cập nhật bảng

        const tableData = await page.evaluate(() => {
          const rows = document.querySelectorAll(
            "table.table-sm.table-hover.table-bordered.mb-0 tbody tr"
          );
          const data = [];
          rows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            if (cells.length > 0) {
              const rowData = {
                ma_mh: cells[1]?.innerText?.trim(),
                ten_mon_hoc: cells[2]?.innerText?.trim(),
                nhom: cells[3]?.innerText?.trim(),
                to: cells[4]?.innerText?.trim(),
                so_tc: cells[5]?.innerText?.trim(),
                lop: cells[6]?.innerText?.trim(),
                so_luong: cells[7]?.innerText?.trim(),
                con_lai: cells[8]?.innerText?.trim(),
                thoi_khoa_bieu: cells[9]?.innerText?.trim(),
              };
              data.push(rowData);
            }
          });
          return data;
        });

        // Đẩy dữ liệu vào allTableData theo tùy chọn
        console.log(
          `Dữ liệu cho tùy chọn "${option}" và "${secondOption}":`,
          tableData
        );
        allTableData.push({
          option: option,
          secondOption: secondOption,
          data: tableData,
        });
      }
    } else {
      console.log(
        `Tùy chọn "${options[i]}" đã chọn. Combobox thứ hai không xuất hiện.`
      );

      // Crawl dữ liệu từ bảng cho tùy chọn không có combobox thứ hai
      console.log("Chờ bảng dữ liệu xuất hiện...");
      await page.waitForSelector(
        "table.table-sm.table-hover.table-bordered.mb-0 tbody tr",
        { visible: true }
      );
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Chờ trang cập nhật bảng

      const tableData = await page.evaluate(() => {
        const rows = document.querySelectorAll(
          "table.table-sm.table-hover.table-bordered.mb-0 tbody tr"
        );
        const data = [];
        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (cells.length > 0) {
            const rowData = {
              ma_mh: cells[1]?.innerText?.trim(),
              ten_mon_hoc: cells[2]?.innerText?.trim(),
              nhom: cells[3]?.innerText?.trim(),
              to: cells[4]?.innerText?.trim(),
              so_tc: cells[5]?.innerText?.trim(),
              lop: cells[6]?.innerText?.trim(),
              so_luong: cells[7]?.innerText?.trim(),
              con_lai: cells[8]?.innerText?.trim(),
              thoi_khoa_bieu: cells[9]?.innerText?.trim(),
            };
            data.push(rowData);
          }
        });
        return data;
      });

      // Đẩy dữ liệu vào allTableData cho tùy chọn không có combobox thứ hai
      console.log(`Dữ liệu cho tùy chọn "${option}":`, tableData);
      allTableData.push({
        option: option,
        secondOption: null, // Không có tùy chọn thứ hai
        data: tableData,
      });
    }
  }

  // Hiển thị hoặc lưu toàn bộ dữ liệu đã crawl từ tất cả các kỳ học
  // console.log(JSON.stringify(allTableData, null, 2));
  
  //Ghi dữ liệu vào file JSON
  fs.writeFile('dataCrawl/DKMH.json', JSON.stringify(allTableData, null, 2), (err) => {
    if (err) {
      console.error("Không thể ghi file:", err);
    } else {
      console.log("Dữ liệu đã được lưu vào file allTableData.json");
    }
  });

};

module.exports = crawlDKMH;