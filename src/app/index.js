const inquirer = require('inquirer');
const fs = require('fs');

// Mảng tài khoản/mật khẩu mẫu
const users = [
  { username: 'admin', password: '123456' },
  { username: 'user', password: 'password' }
];

// Hàm kiểm tra tài khoản
function checkCredentials(username, password) {
  return users.some(user => user.username === username && user.password === password);
}

// Hàm lấy dữ liệu từ file JSON và hiển thị theo logic
function displayData() {
  const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
  console.log('\nDữ liệu từ file JSON:');
  data.forEach(item => {
    console.log(`ID: ${item.id}, Name: ${item.name}, Role: ${item.role}`);
  });
}

// Hàm chính sử dụng Inquirer để nhận input
async function main() {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'Nhập tài khoản:'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Nhập mật khẩu:',
        mask: '*'
      }
    ]);

    const { username, password } = answers;

    if (checkCredentials(username, password)) {
      console.log('\n✅ Đăng nhập thành công!');
      console.log(`Tài khoản: ${username}, Mật khẩu: ${'*'.repeat(password.length)}`);

      // Hiển thị dữ liệu từ file JSON
      displayData();
    } else {
      console.log('\n❌ Sai tài khoản hoặc mật khẩu!');
    }
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error);
  }
}

// Chạy chương trình
main();
