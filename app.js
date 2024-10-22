const crawlHoaDon = require("./src/modules/crawlHoaDon");

const inquirer = require('inquirer');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config(); // Đọc thông tin từ file .env

// Hàm cập nhật file .env
const updateEnvFile = (username, password) => {
  const envContent = `QLDT_USERNAME=${username}\nQLDT_PASSWORD=${password}`;
  fs.writeFileSync('.env', envContent, 'utf8');
  console.log('Thông tin tài khoản đã được cập nhật vào file .env');
};

// Hàm hỏi tài khoản và mật khẩu
const askCredentials = async () => {
  const credentials = await inquirer.prompt([
    { type: 'input', name: 'username', message: 'Nhập tài khoản:' },
    { type: 'password', name: 'password', message: 'Nhập mật khẩu:', mask: '*' }
  ]);

  // Cập nhật .env với tài khoản mới
  updateEnvFile(credentials.username, credentials.password);

  return credentials;
};

// Menu chọn tính năng hệ thống
const systemFeaturesMenu = async () => {
  const { feature } = await inquirer.prompt({
    type: 'list',
    name: 'feature',
    message: 'Chọn tính năng muốn thực hiện:',
    choices: [
      'Xem hóa đơn'
    ]
  });

  switch (feature) {
    case 'Xem hóa đơn':
      await crawlHoaDon();
      break;
    default:
      console.error('Tính năng không hợp lệ!');
  }
};

// Hàm này sẽ chờ người dùng nhấn phím Enter để giữ terminal mở
const waitForExit = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Nhấn Enter để thoát...', () => {
    rl.close();
    process.exit(0); // Thoát chương trình khi người dùng nhấn Enter
  });
};

// Menu chính của chương trình
const mainMenu = async () => {
  try {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'Xin chào, đây là crawler QLDT PTIT\nBạn muốn làm gì?',
      choices: [
        'Crawl dữ liệu',
      ]
    });

    if (action === 'Crawl dữ liệu') {
      const credentials = await askCredentials();
      console.log(`Tài khoản: ${credentials.username} - Bắt đầu crawl dữ liệu...`);

      // Hiển thị menu tính năng sau khi nhập tài khoản và mật khẩu
      await systemFeaturesMenu();

      // Giữ terminal mở sau khi hiển thị dữ liệu
      waitForExit();
    } else {
      console.log('Tạm biệt!');
      process.exit(0);
    }
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error.message);
  }
};

// Khởi chạy chương trình
mainMenu();
