document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const featureSection = document.getElementById('feature-section');
  const loginButton = document.getElementById('login-button');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('login-error');
  const logoutButton = document.getElementById('logout-button');
  const loadingDiv = document.getElementById('loading');
  const dataDiv = document.getElementById('data');

  // Kiểm tra trạng thái đăng nhập
  chrome.storage.local.get(['isLoggedIn', 'username', 'password'], (result) => {
      if (result.isLoggedIn) {
          showFeatureSection();
      } else {
          showLoginSection();
      }
  });

  // Xử lý đăng nhập
  loginButton.addEventListener("click", async () => {
      const username = usernameInput.value;
      const password = passwordInput.value;

      if (username && password) {
          try {
              const response = await fetch("http://localhost:3000/api/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ username, password }),
              });

              if (response.ok) {
                  const data = await response.json();
                  if (data.success) {
                      chrome.storage.local.set({ isLoggedIn: true, username, password }, () => {
                          showFeatureSection();
                      });
                  } else {
                      showError(data.message || "Sai tên đăng nhập hoặc mật khẩu");
                  }
              } else {
                  const errorData = await response.json();
                  showError(errorData.message || "Đã xảy ra lỗi khi đăng nhập");
              }
          } catch (error) {
              showError("Lỗi mạng hoặc máy chủ. Vui lòng thử lại sau.");
          }
      } else {
          showError("Tên đăng nhập và mật khẩu không được để trống");
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

  // Hiển thị thông báo lỗi
  function showError(message) {
      loginError.style.display = "block";
      loginError.textContent = message;
  }

  // Hàm gọi API và hiển thị dữ liệu
  function fetchData(feature) {
    const apiMap = {
        'Feature 1': 'http://localhost:3000/api/lich-thi',
        'Feature 2': 'http://localhost:3000/api/xem-diem',
        'Feature 3': 'http://localhost:3000/api/tkb-tuan'
    };

    chrome.storage.local.get([`${feature}Data`], (result) => {
        if (result[`${feature}Data`]) {
            // Nếu dữ liệu đã có trong storage, hiển thị dữ liệu
            displayData(result[`${feature}Data`], feature);
        } else {
            // Nếu không có dữ liệu, gọi API để lấy dữ liệu
            chrome.storage.local.get(['username', 'password'], (authResult) => {
                if (!authResult.username || !authResult.password) {
                    alert("Bạn cần đăng nhập lại.");
                    showLoginSection();
                    return;
                }
                fetch(apiMap[feature], {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: authResult.username, password: authResult.password })
                })
                .then(response => response.json())
                .then(data => {
                    loadingDiv.style.display = 'none';
                    // Lưu dữ liệu vào chrome.storage
                    chrome.storage.local.set({ [`${feature}Data`]: data }, () => {
                        displayData(data, feature);
                    });
                })
                .catch(error => {
                    console.error("Lỗi khi gọi API:", error);
                    alert("Không thể lấy dữ liệu từ server.");
                    loadingDiv.style.display = 'none';
                });
            });
        }
    });
}

  // Hàm hiển thị dữ liệu
  function displayData(data, feature) {
      dataDiv.innerHTML = `<h3>${feature} Data:</h3><pre>${JSON.stringify(data, null, 2)}</pre>`;
      dataDiv.style.display = 'block';
  }

  // Xử lý chọn tính năng
  document.querySelectorAll('.feature-button').forEach(button => {
      button.addEventListener('click', (e) => {
          const feature = e.target.getAttribute('data-feature');
          fetchData(feature);
          if(feature == 'Feature 3'){
            window.location.href = 'TKB.html';
          }
          if(feature == 'Feature 1'){
            window.location.href = 'lichThi.html';
          }
      });
  });
});

