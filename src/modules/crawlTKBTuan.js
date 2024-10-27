const { selectAndClickUl } = require('./selectFeature'); // Import hàm chọn thẻ ul
const fs = require('fs');

async function extractAllTimetable(page) {
    // Chọn và click thẻ ul (truyền chỉ số từ dưới lên, ví dụ: 4)
    const ulIndexFromBottom = 4; // Thẻ <ul> thứ 4 từ dưới lên
    await selectAndClickUl(page, ulIndexFromBottom);

    // Chờ đợi cho trang tải và drop-down hiện ra
  await page.waitForSelector('ng-select[bindlabel="thong_tin_tuan"]');

  // Chờ cho bảng thời khóa biểu xuất hiện
  await page.waitForSelector('table.table.table-sm.table-bordered');

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
  await page.click('ng-select[bindlabel="ten_hoc_ky"] .ng-input');

  // Đối tượng để chứa toàn bộ dữ liệu học kỳ và tuần
  const timetableData = {};

  // Duyệt qua từng học kỳ
  // Duyệt 1 học kỳ đầu thôi thì for (let semester of semesters.slice(0, 1))
  for (let semester of semesters.slice(0, 1)) {
    console.log(`Đang xử lý học kỳ: ${semester.text}`);

    // Tạo mảng chứa dữ liệu các tuần của học kỳ này
    timetableData[semester.text] = [];

    // Chọn học kỳ
    await page.click('ng-select[bindlabel="ten_hoc_ky"] .ng-input');
    await page.click(`#${semester.value}`);

    // Chờ để học kỳ được cập nhật
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mở dropdown để chọn tuần
    await page.click('ng-select[bindlabel="thong_tin_tuan"] .ng-input');

    // Cuộn lên hết cỡ để đảm bảo lấy từ tuần đầu tiên
    let keepScrollingUp = true;
    while (keepScrollingUp) {
      await page.evaluate(() => {
        const dropdown = document.querySelector('ng-dropdown-panel .scroll-host');
        dropdown.scrollBy(0, -200);  // Cuộn lên 200px
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const isAtTop = await page.evaluate(() => {
        const dropdown = document.querySelector('ng-dropdown-panel .scroll-host');
        return dropdown.scrollTop === 0;  // Kiểm tra xem đã cuộn đến đầu chưa
      });

      if (isAtTop) {
        keepScrollingUp = false;  // Dừng cuộn khi đã lên tới trên cùng
      }
    }

    // Cuộn xuống và click từng tuần ngay khi nó xuất hiện để lấy dữ liệu
    let keepScrollingDown = true;

    while (keepScrollingDown) {
      const weeks = await page.$$eval('ng-dropdown-panel .ng-option', options => 
        options.map(option => ({
          value: option.id,
          text: option.innerText.trim()
        }))
      );

      // Duyệt qua từng tuần và thu thập dữ liệu
      for (let week of weeks) {
        console.log(`Đang lấy dữ liệu cho ${week.text} của học kỳ: ${semester.text}`);

        // Chọn tuần
        await page.click(`#${week.value}`);
        
        // Chờ đợi để bảng thời khóa biểu tải xong
        await page.waitForSelector('table.table-bordered');  

        // Lấy dữ liệu từ bảng thời khóa biểu
    const scheduleData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table.table.table-sm.table-bordered tr'));
      const headers = Array.from(rows[0].querySelectorAll('td')).map(header => header.innerText.trim());
      const data = rows.slice(1).map(row => {
        const cells = Array.from(row.querySelectorAll('td')).map(cell => cell.innerText.trim());
        return cells;
      });
      return { headers, data }; // Trả về headers và data
    });

    // Lấy dữ liệu thời khóa biểu và in lịch học theo từng ngày
    const days = scheduleData.headers.slice(1, -1); // Bỏ cột "Trước" và "Sau"
    const classes = scheduleData.data.slice(0, -1); // Lấy dữ liệu lịch học (các hàng trong bảng)

    const weekData = {
      week: week.text,
      schedule: {}
    };

    days.forEach((day, dayIndex) => {
      weekData.schedule[day] = [];

      classes.forEach(row => {
        const period = row[0]; // Cột đầu tiên chứa thông tin tiết
        const time = row[row.length - 1]; // Cột cuối cùng chứa thông tin giờ học
        const subject = row[dayIndex + 1]; // +1 vì cột đầu tiên là thông tin "Trước", bỏ qua nó

        if (subject && subject !== '' && row.length === days.length + 2) {
          const subjectParts = subject.split('\n').map(part => part.trim()).filter(part => part !== '');
    
          const subjectObject = {
              subject: '', // Khởi tạo môn học
          };

          // Lưu môn học từ phần đầu tiên
          if (subjectParts.length > 0) {
              subjectObject.subject = subjectParts[0]; // Lưu phần đầu tiên làm môn học
          }

          // Lặp qua các phần còn lại để thêm thông tin khác
          for (let i = 1; i < subjectParts.length; i++) {
              const [key, value] = subjectParts[i].split(':').map(item => item.trim());
              if (key && value) {
                  subjectObject[key] = value; // Thêm các thông tin khác vào đối tượng
              }
          }

          weekData.schedule[day].push({
              period: period,
              time: time,
              ...subjectObject // Gán các thông tin vào đối tượng
          });
        }
      });

      if (weekData.schedule[day].length === 0) {
        weekData.schedule[day].push("Không có môn học nào.");
      }
    });

        // Thêm dữ liệu của tuần này vào học kỳ hiện tại
        timetableData[semester.text].push(weekData);

        // Quay lại dropdown để chọn tuần khác
        await page.click('ng-select[bindlabel="thong_tin_tuan"] .ng-input');
      }

      // Cuộn xuống trong dropdown để lấy các tuần tiếp theo
      await page.evaluate(() => {
        const dropdown = document.querySelector('ng-dropdown-panel .scroll-host');
        dropdown.scrollBy(0, 200);  // Cuộn xuống 200px
      });

      // Chờ một chút để cuộn hoàn tất
      await new Promise(resolve => setTimeout(resolve, 1000));

      const isAtBottom = await page.evaluate(() => {
        const dropdown = document.querySelector('ng-dropdown-panel .scroll-host');
        return dropdown.scrollTop + dropdown.clientHeight >= dropdown.scrollHeight;  // Kiểm tra xem đã đến cuối chưa
      });

      if (isAtBottom) {
        keepScrollingDown = false;  // Dừng cuộn khi đã đến cuối
      }
    }
  }

  // Ghi dữ liệu thành tệp JSON
  fs.writeFileSync('dataCrawl/TKBTuan.json', JSON.stringify(timetableData, null, 2), 'utf-8');
  console.log('Dữ liệu thời khóa biểu đã được lưu vào timetableData.json');

}

module.exports = { extractAllTimetable };
