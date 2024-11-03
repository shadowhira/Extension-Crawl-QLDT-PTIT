document.addEventListener('DOMContentLoaded', () => {
  const optionSelect = document.getElementById('option-select');
  const dataContainer = document.getElementById('data-container');


  // Kiểm tra xem dữ liệu học phí đã có trong storage chưa
  const feature = "Feature 4";
  chrome.storage.local.get([`${feature}Data`], (result) => {
    const hocPhiData =  result[`${feature}Data`].data;

    if (hocPhiData) {
      // Nếu đã có dữ liệu học phí trong storage, hiển thị dữ liệu
      populateOptions(hocPhiData);
      console.log(hocPhiData);
      optionSelect.addEventListener('change', () => {
        displayData(hocPhiData, optionSelect.value);
      });
    }
  });

  function populateOptions(data) {
    optionSelect.innerHTML = data.map((item, index) => 
      `<option value="${index}">${item.option}</option>`
    ).join('');
    displayData(data, 0); // Hiển thị dữ liệu của option đầu tiên mặc định
  }

  function displayData(data, selectedIndex) {
    const selectedOption = data[selectedIndex];
    dataContainer.innerHTML = '';
  
    if (selectedOption.option === "Tổng hợp học phí tất cả học kỳ") {
      // Xử lý riêng cho option đầu tiên
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tbody = document.createElement('tbody');
  
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
    const filteredData = selectedOption.data.filter(row => {
      return !isNaN(row.stt) || row.stt === "Tổng";
    });
  
      // Tạo hàng cho từng đối tượng trong dữ liệu của option đầu tiên
      filteredData.forEach(row => {
        const tr = document.createElement('tr');
        
        // Các giá trị sẽ được thêm vào hàng, nếu không tồn tại giá trị thì hiển thị chuỗi rỗng
        tr.innerHTML = `
          <td>${row.stt || ''}</td>
          <td>${row.niên_học_học_kỳ || ''}</td>
          <td>${row.hp_chua_giam || ''}</td>
          <td>${row.mien_giam || ''}</td>
          <td>${row.phai_thu || ''}</td>
          <td>${row.da_thu || ''}</td>
          <td>${row.con_no || ''}</td>
        `;
        tbody.appendChild(tr);
      });
  
      table.appendChild(thead);
      table.appendChild(tbody);
      dataContainer.appendChild(table);
  
    } else {
      // Xử lý cho các option khác
      selectedOption.data.forEach((table, tableIndex) => {
        const tableElement = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
  
        // Kiểm tra nếu `rows` có chứa dữ liệu
        if (table.rows && table.rows.length > 0) {
          // Tạo header dựa vào các trường của đối tượng đầu tiên trong `rows`
          const headers = Object.keys(table.rows[0]);
          thead.innerHTML = `<tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>`;
  
          // Tạo các hàng trong bảng
          table.rows.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(header => {
              const td = document.createElement('td');
              td.textContent = row[header] || '';
              tr.appendChild(td);
            });
            tbody.appendChild(tr);
          });
        } else {
          tbody.innerHTML = '<tr><td colspan="100%">Không có dữ liệu</td></tr>';
        }
  
        tableElement.appendChild(thead);
        tableElement.appendChild(tbody);
  
        const tableTitle = document.createElement('h3');
        tableTitle.textContent = `Bảng ${tableIndex + 1}`;
        dataContainer.appendChild(tableTitle);
        dataContainer.appendChild(tableElement);
      });
    }
  }  
});