document.addEventListener("DOMContentLoaded", () => {
  const optionSelect = document.getElementById("option-select");
  const dataContainer = document.getElementById("data-container");
  const backButton = document.getElementById("back-button");

  // Thêm sự kiện click cho nút quay lại
  backButton.addEventListener("click", () => {
    window.location.href = "../popup.html";
  });

  // Kiểm tra xem dữ liệu học phí đã có trong storage chưa
  const feature = "Feature 1";
  chrome.storage.local.get([`${feature}Data`], (result) => {
    const hocPhiData = result[`${feature}Data`].data;

    if (hocPhiData) {
      // Nếu đã có dữ liệu học phí trong storage, hiển thị dữ liệu
      populateOptions(hocPhiData);
      console.log(hocPhiData);
      optionSelect.addEventListener("change", () => {
        displayData(hocPhiData, optionSelect.value);
      });
    }
  });

  function populateOptions(data) {
    optionSelect.innerHTML = data
      .map((item, index) => `<option value="${index}">${item.option}</option>`)
      .join("");
    displayData(data, 0); // Hiển thị dữ liệu của option đầu tiên mặc định
  }

  function displayData(data, selectedIndex) {
    const selectedOption = data[selectedIndex];
    dataContainer.innerHTML = "";

    if (selectedOption.option === "Tổng hợp học phí tất cả học kỳ") {
      // Xử lý riêng cho option đầu tiên
      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      // Header cho bảng dữ liệu "Tổng hợp học phí tất cả học kỳ"
      thead.innerHTML = `
        <tr>
          <th>STT</th>
          <th>Niên Học Học Kỳ</th>
          <th>Học Phí Chưa Giảm</th>
          <th>Miễn Giảm</th>
          <th>Phải Thu</th>
          <th>Đã Thu</th>
          <th>Còn Nợ</th>
        </tr>
      `;

      // Lọc dữ liệu: chỉ giữ lại các dòng có `stt` là số hoặc chuỗi "Tổng"
      const filteredData = selectedOption.data.filter((row) => {
        return !isNaN(row.stt) || ["Tổng", "Thu Học Phí", "Thu Học Lại"].includes(row.stt);
      });

      // Tạo hàng cho từng đối tượng trong dữ liệu của option đầu tiên
      filteredData.forEach((row) => {
        const tr = document.createElement("tr");

        if (row.stt === "Tổng") {
          // Nếu là dòng "Tổng", gộp hai cột đầu thành một ô
          tr.innerHTML = `
            <td colspan="2">${row.stt}</td>
            <td>${row.niên_học_học_kỳ || ''}</td>
            <td>${row.hp_chua_giam || ''}</td>
            <td>${row.mien_giam || ''}</td>
            <td>${row.phai_thu || ''}</td>
            <td>${row.da_thu || ''}</td>
            <td>${row.con_no || ''}</td>
          `;
        } else if (row.stt === "Thu Học Phí" || row.stt === "Thu Học Lại") {
          // Nếu là "Thu Học Phí" hoặc "Thu Học Lại", chỉ hiển thị một ô duy nhất
          tr.innerHTML = `<td colspan="7">${row.stt}</td>`;
        } else {
          // Hiển thị bình thường với các dòng khác
          tr.innerHTML = `
            <td>${row.stt || ''}</td>
            <td>${row.niên_học_học_kỳ || ''}</td>
            <td>${row.hp_chua_giam || ''}</td>
            <td>${row.mien_giam || ''}</td>
            <td>${row.phai_thu || ''}</td>
            <td>${row.da_thu || ''}</td>
            <td>${row.con_no || ''}</td>
          `;
        }
        tbody.appendChild(tr);
      });
    
        table.appendChild(thead);
        table.appendChild(tbody);
        dataContainer.appendChild(table);
    
      } else {
        // Lọc để chỉ giữ lại `tableIndex` 1 và 2 cho các option khác
        const filteredTables = selectedOption.data.filter(table => 
          table.tableIndex === 1 || table.tableIndex === 2
        );
    
        filteredTables.forEach((table, tableIndex) => {
          const tableElement = document.createElement('table');
          const thead = document.createElement('thead');
          const tbody = document.createElement('tbody');
    
          if (table.rows && table.rows.length > 0) {
            const headers = Object.keys(table.rows[0]);
            thead.innerHTML = `<tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>`;
    
            // Kiểm tra `tableIndex`
            if (table.tableIndex === 1) {
              // Với `tableIndex` 1, hiển thị tất cả các hàng
              table.rows.forEach(row => {
                const tr = document.createElement('tr');
                headers.forEach(header => {
                  const td = document.createElement('td');
                  td.textContent = row[header] || '';
                  tr.appendChild(td);
                });
                tbody.appendChild(tr);
              });
            } else if (table.tableIndex === 2) {
              // Với `tableIndex` 2, chỉ hiển thị hàng đầu tiên
              const firstRow = table.rows[0];
              if (firstRow) {
                const tr = document.createElement('tr');
                headers.forEach(header => {
                  const td = document.createElement('td');
                  td.textContent = firstRow[header] || '';
                  tr.appendChild(td);
                });
                tbody.appendChild(tr);
              }
            }
          } else {
            tbody.innerHTML = '<tr><td colspan="100%">Không có dữ liệu</td></tr>';
          }
    
          tableElement.appendChild(thead);
          tableElement.appendChild(tbody);
    
          // Đặt tiêu đề dựa trên `tableIndex`
          const tableTitle = document.createElement('h3');
          tableTitle.textContent = table.tableIndex === 1 ? "Danh sách Phải Thu" : "Danh sách Đã Thu";
          dataContainer.appendChild(tableTitle);
          dataContainer.appendChild(tableElement);
        }); 
      }
  }
});
