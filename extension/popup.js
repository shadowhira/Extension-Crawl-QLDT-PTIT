document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    loginSection: document.getElementById("login-section"),
    featureSection: document.getElementById("feature-section"),
    loginButton: document.getElementById("login-button"),
    usernameInput: document.getElementById("username"),
    passwordInput: document.getElementById("password"),
    loginError: document.getElementById("login-error"),
    logoutButton: document.getElementById("logout-button"),
    loadingDiv: document.getElementById("loading"),
    dataDiv: document.getElementById("data"),
    loginLoading: document.getElementById("login-loading"),
    usernameDisplay: document.getElementById("username-display"),
    featureLoading: {
      "Feature 1": document.getElementById("feature1-loading"),
      "Feature 2": document.getElementById("feature2-loading"),
      "Feature 3": document.getElementById("feature3-loading"),
      "Feature 4": document.getElementById("feature4-loading"),
    },
  };

  const apiMap = {
    "Feature 1": "http://localhost:3000/api/hoc-phi",
    "Feature 2": "http://localhost:3000/api/lich-thi",
    "Feature 3": "http://localhost:3000/api/tkb-tuan",
    "Feature 4": "http://localhost:3000/api/xem-diem",
  };

  chrome.storage.local.get(["isLoggedIn", "username", "password"], (result) => {
    result.isLoggedIn ? showFeatureSection(result.username) : showLoginSection();
  });

  elements.loginButton.addEventListener("click", async () => {
    const { usernameInput, passwordInput, loginLoading } = elements;
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username && password) {
      loginLoading.style.display = "inline-block";
      try {
        const response = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          chrome.storage.local.set({ isLoggedIn: true, username, password }, () => showFeatureSection(username));
        } else {
          showError(data.message || "Sai tên đăng nhập hoặc mật khẩu");
        }
      } catch {
        showError("Lỗi mạng hoặc máy chủ. Vui lòng thử lại sau.");
      } finally {
        loginLoading.style.display = "none";
      }
    } else {
      showError("Tên đăng nhập và mật khẩu không được để trống");
    }
  });

  elements.logoutButton.addEventListener("click", () => {
    chrome.storage.local.clear(() => console.log("Tất cả dữ liệu đã được xóa."));
    chrome.storage.local.set({ isLoggedIn: false, username: null, password: null }, showLoginSection);
  });

  function showFeatureSection(username) {
    elements.loginSection.style.display = "none";
    elements.featureSection.style.display = "block";
    elements.loginError.style.display = "none";
    elements.usernameDisplay.textContent = `Welcome, ${username}`;
  }

  function showLoginSection() {
    elements.loginSection.style.display = "block";
    elements.featureSection.style.display = "none";
  }

  function showError(message) {
    elements.loginError.style.display = "block";
    elements.loginError.textContent = message;
  }

  function fetchData(feature) {
    const { featureLoading } = elements;
    featureLoading[feature].style.display = "inline-block";

    chrome.storage.local.get([`${feature}Data`], (result) => {
      if (result[`${feature}Data`]) {
        navigateToFeaturePage(feature);
      } else {
        chrome.storage.local.get(["username", "password"], (authResult) => {
          if (!authResult.username || !authResult.password) {
            alert("Bạn cần đăng nhập lại.");
            showLoginSection();
            return;
          }
          fetch(apiMap[feature], {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(authResult),
          })
            .then((response) => response.json())
            .then((data) => {
              chrome.storage.local.set({ [`${feature}Data`]: data }, () => {
                displayData(data, feature);
                navigateToFeaturePage(feature);
              });
            })
            .catch(() => {
              console.error("Lỗi khi gọi API");
              alert("Không thể lấy dữ liệu từ server.");
            })
            .finally(() => {
              featureLoading[feature].style.display = "none";
            });
        });
      }
    });
  }

  function displayData(data, feature) {
    elements.dataDiv.innerHTML = `<h3>${feature} Data:</h3><pre>${JSON.stringify(data, null, 2)}</pre>`;
    elements.dataDiv.style.display = "block";
  }

  function navigateToFeaturePage(feature) {
    const featurePages = {
      "Feature 1": "./html/hocphi.html",
      "Feature 2": "./html/lichThi.html",
      "Feature 3": "./html/TKB.html",
      "Feature 4": "./html/xemDiem.html",
    };
    window.location.href = featurePages[feature];
  }

  document.querySelectorAll(".feature-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      fetchData(e.target.getAttribute("data-feature"));
    });
  });
});