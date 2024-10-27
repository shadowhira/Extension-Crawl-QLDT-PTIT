const express = require('express');
const router = express.Router();
const { crawlDiem } = require('../services/diemService');

let storedUsername = null;
let storedPassword = null;

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu tài khoản hoặc mật khẩu' });
  }

  // Lưu thông tin đăng nhập vào biến toàn cục
  storedUsername = username;
  storedPassword = password;

  // Kiểm tra đăng nhập bằng cách gọi crawlDiem
  try {
    await crawlDiem(username, password);
    res.json({ success: true });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;
