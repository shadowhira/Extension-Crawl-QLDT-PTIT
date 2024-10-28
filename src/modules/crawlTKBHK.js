const { selectAndClickUl } = require('./selectFeature'); // Import hàm chọn thẻ ul
const fs = require('fs');

async function extractTKBHK(page) {
    // Chọn và click thẻ ul (truyền chỉ số từ dưới lên, ví dụ: 4)
    const ulIndexFromBottom = 3; // Thẻ <ul> thứ 4 từ dưới lên
    await selectAndClickUl(page, ulIndexFromBottom);

    // Chờ cho bảng thời khóa biểu xuất hiện
  await page.waitForSelector('table.table.table-sm.table-hover.table-bordered');

  await new Promise(resolve => setTimeout(resolve, 5000));

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
      const hasRowspan = row.querySelector('td[rowspan]'); // Check if there is a 'rowspan' attribute
  
      if (hasRowspan) {
        // This is the first row of a course (maMH -> lop) with rowspan
        currentCourse = {
          maMH: cells[0],       // Mã môn học (with rowspan)
          tenMH: cells[1],      // Tên môn học (with rowspan)
          nhom: cells[2],       // Nhóm tổ (with rowspan)
          soTinChi: cells[3],   // Số tín chỉ (with rowspan)
          lop: cells[4],        // Lớp (with rowspan)
        };
        
        // Extract schedule info from cells[6] onward (for the first row with rowspan)
        timetable.push({
          ...currentCourse,        // Include the course information from the first row
          thu: cells[6],           // Thứ
          tietBatDau: cells[7],    // Tiết bắt đầu
          soTiet: cells[8],        // Số tiết
          phong: cells[9],         // Phòng học
          giangVien: cells[10],    // Giảng viên
          thoiGian: cells[11]      // Thời gian học
        });
        
      } else {
        // For rows without rowspan, schedule info starts from index 0
        timetable.push({
          ...currentCourse,        // Include the course info from the previous row with rowspan
          thu: cells[0],           // Thứ
          tietBatDau: cells[1],    // Tiết bắt đầu
          soTiet: cells[2],        // Số tiết
          phong: cells[3],         // Phòng học
          giangVien: cells[4],     // Giảng viên
          thoiGian: cells[5]       // Thời gian học
        });
      }
    });
    
    return timetable;
  });

  // console.log(timetableData);
  // Gộp dữ liệu theo maMH và lop
  // const mergedTimetable = {};
        
  // timetableData.forEach(entry => {
  //     const key = `${entry.maMH}-${entry.lop}`; // Tạo khóa duy nhất cho từng môn học và lớp
  //     if (!mergedTimetable[key]) {
  //         mergedTimetable[key] = { ...entry, thoiGian: [] }; // Khởi tạo mảng thoiGian
  //     }
  //     mergedTimetable[key].thoiGian.push(entry.thoiGian); // Thêm thời gian vào mảng
  // });

  // Chuyển đổi lại thành mảng
  // allTimetables[semester.text] = Object.values(mergedTimetable);
  allTimetables[semester.text] = timetableData;

  // Click dropdown again to select another semester
  await page.click('ng-select[bindlabel="ten_hoc_ky"] .ng-input');
  }

  // Ghi dữ liệu thành file JSON
  fs.writeFileSync('dataCrawl/TKBHK.json', JSON.stringify(allTimetables, null, 2), 'utf-8');
  console.log('Dữ liệu thời khóa biểu đã được lưu vào timetable_hocky.json');
  return allTimetables;
}

module.exports = { extractTKBHK };
