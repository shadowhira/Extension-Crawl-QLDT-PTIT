document.addEventListener("DOMContentLoaded", async () => {
  // Lấy các phần tử DOM cần thiết
  const xemDiemSection = document.getElementById("grades-section");
  const backButton = document.getElementById("back-button");
  const semesterDropdown = document.getElementById("semester-dropdown");
  const gradesTableBody = document.getElementById("grades-table").querySelector("tbody");
  const gpaElement = document.getElementById("gpa");
  const dataContainer = document.getElementById('data-container');

  // Hiển thị phần xem điểm
  xemDiemSection.style.display = "block";

  // Thêm sự kiện click cho nút quay lại
  backButton.addEventListener("click", () => {
    window.location.href = "popup.html";
  });

  // Kiểm tra xem dữ liệu điểm đã có trong storage chưa
  const feature = "Feature 2";
  chrome.storage.local.get([`${feature}Data`], (result) => {
    const gradesData =  result[`${feature}Data`].data;

    // Nếu đã có dữ liệu điểm trong storage, hiển thị dữ liệu
    if (gradesData) {
      populateSemesters(gradesData);
    }
  });

  // Hàm hiển thị các học kỳ trong dropdown
  function populateSemesters(data) {
    Object.entries(data).forEach(([semester]) => {
      const option = document.createElement("option");
      option.value = semester;
      option.textContent = semester;
      semesterDropdown.appendChild(option);
    });

    // Thêm sự kiện thay đổi cho dropdown
    semesterDropdown.addEventListener("change", (event) => {
      const selectedSemester = event.target.value;
      if (selectedSemester) {
        displayGradesTable(data, selectedSemester);
        displayGPA(data, selectedSemester);
      } else {
        clearGradesTable();
        clearGPA();
      }
    });
  }

  // Hàm hiển thị bảng điểm của học kỳ được chọn
  function displayGradesTable(data, semester) {
    gradesTableBody.innerHTML = ""; // Xóa nội dung cũ của bảng
    const subjects = data[semester].subjects;

    subjects.forEach((subject) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${subject.stt}</td>
        <td>${subject.tenMH}</td>
        <td>${subject.diemChu || "N/A"}</td>
      `;
      gradesTableBody.appendChild(row);
    });
  }

  // Hàm hiển thị GPA của học kỳ được chọn
  function displayGPA(data, semester) {
    const gpa = data[semester].gpa4 || "N/A";
    gpaElement.textContent = gpa;
  }

  // Hàm xóa nội dung bảng điểm
  function clearGradesTable() {
    gradesTableBody.innerHTML = "";
  }

  // Hàm xóa nội dung GPA
  function clearGPA() {
    gpaElement.textContent = "";
  }
});