const { selectAndClickUl } = require('./selectFeature'); // Import hàm chọn thẻ ul
const fs = require('fs');

async function getGrades(page) {
    // Chọn và click thẻ ul (truyền chỉ số từ dưới lên, ví dụ: 4)
    const ulIndexFromBottom = 1; // Thẻ <ul> thứ 4 từ dưới lên
    await selectAndClickUl(page, ulIndexFromBottom);
  
    // Chờ cho bảng được tải (nếu cần)
    await page.waitForSelector('#excel-table');
    await new Promise((resolve) => setTimeout(resolve, 2000));
  
    const semesterData = await page.evaluate(() => {
      const semesters = {}; // Đối tượng lưu trữ thông tin cho từng kỳ học
    
      // Lấy tất cả các hàng chứa tên kỳ học
      const semesterRows = document.querySelectorAll('tr.table-primary');
    
      semesterRows.forEach(semesterRow => {
        const semesterName = semesterRow.querySelector('td').innerText.trim();
        
        // Tìm tất cả các hàng điểm môn học sau hàng kỳ học này
        const subjects = [];
        let nextRow = semesterRow.nextElementSibling;
        
        while (nextRow && nextRow.classList.contains('text-center')) {
          const cols = nextRow.querySelectorAll('td');
          const subject = {
            stt: cols[0]?.innerText.trim(),
            maMH: cols[1]?.innerText.trim(),
            nhomTo: cols[2]?.innerText.trim(),
            tenMH: cols[3]?.innerText.trim(),
            soTinChi: cols[4]?.innerText.trim(),
            diemThi: cols[5]?.innerText.trim(),
            diemTK10: cols[6]?.innerText.trim(),
            diemTK4: cols[7]?.innerText.trim(),
            diemChu: cols[8]?.innerText.trim(),
            ketQua: cols[9]?.innerHTML.includes('fa-check') ? 'Đạt' : 'Không đạt',
            // chiTietIcon: cols[10]?.querySelector("i"), // Lấy icon để mở popup chi tiết 
          };
          
          subjects.push(subject);
          nextRow = nextRow.nextElementSibling; // Tiến đến hàng tiếp theo
        }

        
    
        // Lấy danh sách điểm, GPA và tín chỉ tích lũy
        const semesterInfo = {
          subjects: subjects,
          gpa4: '',
          gpa10: '',
          creditEarned: '',
          cpa4: '',
          cpa10: '',
          accumulatedCredit: ''
        };
    
        // Lấy dữ liệu từ các bảng trong hàng tiếp theo
        const nextSemesterRow = nextRow; // Hàng kế tiếp để lấy thông tin GPA
        if (nextSemesterRow && nextSemesterRow.classList.contains('m-0')) {
          const tables = nextSemesterRow.querySelectorAll('div.cust_tong > table');
    
          tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
    
            rows.forEach(dataRow => {
              const label = dataRow.querySelector('td.text-primary.text-nowrap.td-cus.py-0').innerText;
              const value = dataRow.querySelector('td.text-primary.align-middle.py-0').innerText;
    
              if (label.includes('Điểm trung bình học kỳ hệ 4')) {
                semesterInfo.gpa4 = value;
              } else if (label.includes('Điểm trung bình học kỳ hệ 10')) {
                semesterInfo.gpa10 = value;
              } else if (label.includes('Điểm trung bình tích lũy hệ 4')) {
                semesterInfo.cpa4 = value;
              } else if (label.includes('Điểm trung bình tích lũy hệ 10')) {
                semesterInfo.cpa10 = value;
              } else if (label.includes('Số tín chỉ đạt học kỳ')) {
                semesterInfo.creditEarned = value;
              } else if (label.includes('Số tín chỉ tích lũy')) {
                semesterInfo.accumulatedCredit = value;
              }
            });
          });
        }
    
        // Lưu thông tin kỳ học vào đối tượng
        semesters[semesterName] = semesterInfo;
      });
    
      return semesters; // Trả về đối tượng chứa thông tin kỳ học và điểm môn học
    });

    // Khi bạn muốn crawl thông tin tiết thành phần cho một môn cụ thể
    // console.log(semesterData["Học kỳ 1 - Năm học 2024-2025"]);
    // if (semesterData["Học kỳ 1 - Năm học 2024-2025"].chiTietIcon) {
    //   const tietThanhPhan = await crawlTietThanhPhan(page, index);
    //   console.log(
    //     `Tiết thành phần của môn ${tableData[index].tenMH}:`,
    //     tietThanhPhan
    //   );
    // }

  fs.writeFileSync('dataCrawl/grades.json', JSON.stringify(semesterData, null, 2), 'utf8');
  console.log('Dữ liệu đã được lưu vào file grades.json');
  return semesterData;
}

// Hàm crawl thông tin tiết thành phần
// async function crawlTietThanhPhan(page, index) {
//   // Click vào icon tiết thành phần
//   await page.evaluate((index) => {
//     const rows = document.querySelectorAll("#excel-table tbody tr");
//     const icon = rows[index].querySelector("td i");
//     if (icon) {
//       icon.click(); // Click để mở popup
//     }
//   }, index);

//   // Chờ popup hiện ra hoặc popup cảnh báo hiện ra
//   await new Promise((resolve) => setTimeout(resolve, 2000)); // Chờ popup

//   // Kiểm tra nếu có thông báo "Môn học không có tiết thành phần"
//   const isNoTietThanhPhan = await page.evaluate(() => {
//     const toastMessage = document.querySelector(".toast-message");
//     if (
//       toastMessage &&
//       toastMessage.innerText.includes("Môn học không có tiết thành phần")
//     ) {
//       return true;
//     }
//     return false;
//   });

//   if (isNoTietThanhPhan) {
//     console.log(`Môn học không có tiết thành phần`);

//     // Đóng popup cảnh báo
//     await page.evaluate(() => {
//       const closeButton = document.querySelector(".toast-close-button");
//       if (closeButton) {
//         closeButton.click(); // Click vào nút đóng của popup cảnh báo
//       }
//     });

//     return "Không có tiết thành phần"; // Trả về thông báo
//   } else {
//     // Nếu không có cảnh báo, lấy thông tin tiết thành phần từ popup
//     const tietThanhPhanData = await page.evaluate(() => {
//       const rows = document.querySelectorAll(".modal-content tbody tr");
//       const tietThanhPhan = [];

//       rows.forEach((row) => {
//         const tenThanhPhan = row
//           .querySelector("td:nth-child(2)")
//           ?.innerText?.trim();
//         const soTiet = row.querySelector("td:nth-child(3)")?.innerText?.trim();
//         if (tenThanhPhan && soTiet) {
//           tietThanhPhan.push({ tenThanhPhan, soTiet });
//         }
//       });

//       return tietThanhPhan;
//     });

//     // Đóng popup sau khi lấy thông tin
//     await page.evaluate(() => {
//       const closeButton = document.querySelector(".modal-footer button");
//       if (closeButton) {
//         closeButton.click(); // Click vào nút đóng
//       }
//     });

//     await new Promise((resolve) => setTimeout(resolve, 1000)); // Chờ popup đóng

//     return tietThanhPhanData; // Trả về dữ liệu tiết thành phần
//   }
// }

module.exports = { getGrades };
