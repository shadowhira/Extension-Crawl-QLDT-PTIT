document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const featureSection = document.getElementById('feature-section');
  const loginButton = document.getElementById('login-button');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('login-error');
  const logoutButton = document.getElementById('logout-button');

  // Kiểm tra trạng thái đăng nhập
  chrome.storage.local.get('isLoggedIn', (result) => {
    if (result.isLoggedIn) {
      showFeatureSection();
    } else {
      showLoginSection();
    }
  });

  // Xử lý đăng nhập
  loginButton.addEventListener('click', () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username === 'admin' && password === '123456') {
      chrome.storage.local.set({ isLoggedIn: true }, () => {
        showFeatureSection();
      });
    } else {
      loginError.style.display = 'block';
    }
  });

  // Xử lý đăng xuất
  logoutButton.addEventListener('click', () => {
    chrome.storage.local.set({ isLoggedIn: false }, () => {
      showLoginSection();
    });
  });

  // Hiển thị phần chọn tính năng sau khi đăng nhập thành công
  function showFeatureSection() {
    loginSection.style.display = 'none';
    featureSection.style.display = 'block';
  }

  // Hiển thị form đăng nhập
  function showLoginSection() {
    loginSection.style.display = 'block';
    featureSection.style.display = 'none';
  }

  // Hàm gọi API và hiển thị dữ liệu
  function fetchData(feature) {
    const apiMap = {
      'Feature 1': 'http://localhost:3000/api/lich-thi',
      'Feature 2': 'http://localhost:3000/api/xem-diem',
      'Feature 3': 'http://localhost:3000/api/hoc-phi'
    };

    fetch(apiMap[feature])
      .then(response => response.json())
      .then(data => {
        displayData(data, feature);
      })
      .catch(error => {
        console.error("Lỗi khi gọi API:", error);
        alert("Không thể lấy dữ liệu từ server.");
      });
  }

  // Hàm hiển thị dữ liệu
  function displayData(data, feature) {
    const displaySection = document.createElement('div');
    displaySection.innerHTML = `<h3>${feature} Data:</h3><pre>${JSON.stringify(data, null, 2)}</pre>`;
    featureSection.appendChild(displaySection);
  }

  // Xử lý chọn tính năng
  document.querySelectorAll('.feature-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const feature = e.target.getAttribute('data-feature');
      fetchData(feature);
    });
  });
});
