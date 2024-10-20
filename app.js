const inquirer = require('inquirer');

// Các hàm crawl (chưa triển khai, chỉ có comment)
const crawlAllData = async () => {
  console.log('Đang crawl toàn bộ dữ liệu...');
  // logic crawl toàn bộ dữ liệu
};

const crawlTKB = async () => {
  console.log('Đang lấy TKB...');
  // logic crawl thời khóa biểu
};

const crawlHocPhi = async () => {
  console.log('Đang lấy học phí...');
  // logic crawl học phí
};

const crawlMTQuyet = async () => {
  console.log('Đang lấy môn học trong kỳ...');
  // logic crawl môn trong kỳ học
};

const crawlHoaDon = async () => {
  console.log('Đang lấy hóa đơn...');
  // logic crawl hóa đơn
};

// Hàm hỏi tài khoản và mật khẩu
const askCredentials = async () => {
  return await inquirer.prompt([
    { type: 'input', name: 'username', message: 'Nhập tài khoản:' },
    { type: 'password', name: 'password', message: 'Nhập mật khẩu:', mask: '*' }
  ]);
};

// Menu chọn tính năng hệ thống
const systemFeaturesMenu = async () => {
  const { feature } = await inquirer.prompt({
    type: 'list',
    name: 'feature',
    message: 'Chọn tính năng muốn thực hiện:',
    choices: [
      'Xem TKB',
      'Xem lịch học hôm nay',
      'Xem học phí',
      'Xem các môn học trong kỳ học',
      'Xem hóa đơn'
    ]
  });

  switch (feature) {
    case 'Xem TKB':
    case 'Xem lịch học hôm nay':
      await crawlTKB();
      break;
    case 'Xem học phí':
      await crawlHocPhi();
      break;
    case 'Xem các môn học trong kỳ học':
      await crawlMTQuyet();
      break;
    case 'Xem hóa đơn':
      await crawlHoaDon();
      break;
    default:
      console.error('Tính năng không hợp lệ!');
  }
};

// Menu chính của chương trình
const mainMenu = async () => {
  try {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'Xin chào, đây là crawler QLDT PTIT\nBạn muốn làm gì?',
      choices: [
        'Crawl toàn bộ dữ liệu',
        'Thực hiện tính năng hệ thống',
        'Thoát'
      ]
    });

    if (action === 'Crawl toàn bộ dữ liệu') {
      const credentials = await askCredentials();
      console.log(`Tài khoản: ${credentials.username} - Bắt đầu crawl dữ liệu...`);
      await crawlAllData();
    } else if (action === 'Thực hiện tính năng hệ thống') {
      const credentials = await askCredentials();
      console.log(`Tài khoản: ${credentials.username} - Đăng nhập thành công!`);
      await systemFeaturesMenu();
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
