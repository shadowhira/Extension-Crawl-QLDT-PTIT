const { selectAndClickUl } = require('./selectFeature'); // Import hàm chọn thẻ ul
const fs = require('fs');

async function extractLichThi(page) {
    // Chọn và click thẻ ul (truyền chỉ số từ dưới lên, ví dụ: 4)
    const ulIndexFromBottom = 2; // Thẻ <ul> thứ 4 từ dưới lên
    await selectAndClickUl(page, ulIndexFromBottom);

    // Chờ cho bảng thời khóa biểu xuất hiện
  await page.waitForSelector('table.table.table-sm.table-hover.table-bordered');

  await new Promise(resolve => setTimeout(resolve, 3000));

  // Chờ đợi cho trang tải và drop-down hiện ra
  await page.waitForSelector('ng-select[bindlabel="ten_hoc_ky"]');  // Dropdown của học kỳ
  await page.click('ng-select[bindlabel="ten_hoc_ky"] .ng-input');
  // Lấy danh sách các học kỳ
  const semesters = await page.$$eval('ng-select[bindlabel="ten_hoc_ky"] .ng-option', options => 
    options.map(option => ({
      value: option.id,
      text: option.innerText.trim()
    }))
  );

  const allTimetables = {}; // Object to hold data for all semesters

  // Chọn học kỳ
  for (let semester of semesters) {
    console.log(`Đang xử lý học kỳ: ${semester.text}`);
    await page.click(`#${semester.value}`);
    await page.waitForSelector('table.table.table-sm.table-hover.table-bordered');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Lấy dữ liệu từ bảng thời khóa biểu
  const timetableData = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table.table.table-sm.table-hover.table-bordered tbody tr'));
    
    let currentCourse = {}; // Store the current course details
    const timetable = [];   // Store the final timetable
  
    rows.forEach(row => {
      const cells = Array.from(row.querySelectorAll('td')).map(cell => cell.innerText.trim());
      const hasRowspan = row.querySelector('td[colspan]'); // Check if there is a 'rowspan' attribute
  
      if (!hasRowspan) {
        // This is the first row of a course (maMH -> lop) with rowspan
        currentCourse = {
          stt: cells[0],       // Số thứ tự
          maMH: cells[1],       // Mã môn học (with rowspan)
          tenMH: cells[2],      // Tên môn học (with rowspan)
          siSo: cells[3],       // Nhóm tổ (with rowspan)
          ngay: cells[4],   // Số tín chỉ (with rowspan)
          gio: cells[5],        // Lớp (with rowspan)
          phut: cells[6],        // Lớp (with rowspan)
          phong: cells[7],        // Lớp (with rowspan)
          coSo: cells[8],        // Lớp (with rowspan)
          hinhThuc: cells[9],        // Lớp (with rowspan)
        };
        
        // Extract schedule info from cells[6] onward (for the first row with rowspan)
        timetable.push({
          ...currentCourse,        // Include the course information from the first row
        });
        
      } 
    });
    
    return timetable;
  });

  // console.log(timetableData);
  allTimetables[semester.text] = timetableData;

  // Click dropdown again to select another semester
  await page.click('ng-select[bindlabel="ten_hoc_ky"] .ng-input');
  }

  // Ghi dữ liệu thành file JSON
  fs.writeFileSync('dataCrawl/lichthi.json', JSON.stringify(allTimetables, null, 2), 'utf-8');
  console.log('Dữ liệu thời khóa biểu đã được lưu vào lichthi.json');
  return allTimetables;
}

module.exports = { extractLichThi };
