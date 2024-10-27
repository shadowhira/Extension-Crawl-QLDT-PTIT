document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const featureSection = document.getElementById('feature-section');
  const loginButton = document.getElementById('login-button');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('login-error');
  const logoutButton = document.getElementById('logout-button');

  // Kiểm tra trạng thái đăng nhập
  chrome.storage.local.get(['isLoggedIn', 'username', 'password'], (result) => {
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

    // Kiểm tra xem tài khoản và mật khẩu có hợp lệ không (có thể tùy chỉnh điều kiện này)
    if (username && password) {
      chrome.storage.local.set({ isLoggedIn: true, username, password }, () => {
        showFeatureSection();
      });
    } else {
      loginError.style.display = 'block';
      loginError.textContent = 'Sai tên đăng nhập hoặc mật khẩu';
    }
  });

  // Xử lý đăng xuất
  logoutButton.addEventListener('click', () => {
    chrome.storage.local.set({ isLoggedIn: false, username: null, password: null }, () => {
      showLoginSection();
    });
  });

  // Hiển thị phần chọn tính năng sau khi đăng nhập thành công
  function showFeatureSection() {
    loginSection.style.display = 'none';
    featureSection.style.display = 'block';
    loginError.style.display = 'none';
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

    // Lấy username và password từ storage để gửi cùng yêu cầu API
    chrome.storage.local.get(['username', 'password'], (result) => {
      if (!result.username || !result.password) {
        alert("Bạn cần đăng nhập lại.");
        showLoginSection();
        return;
      }

      fetch(apiMap[feature], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: result.username, password: result.password })
      })
      .then(response => response.json())
      .then(data => {
        displayData(data, feature);
      })
      .catch(error => {
        console.error("Lỗi khi gọi API:", error);
        alert("Không thể lấy dữ liệu từ server.");
      });
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
