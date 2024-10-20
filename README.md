# mid-project-680372032
 
## BTL: Crawl dữ liệu từ trang QLDT PTIT

## Thành viên:
* Nguyễn Văn Thành - B21DCCN680
* Trịnh Trung Hiếu - B21DCCN372
* Vũ Thành Đạt - B21DCCN032

## Mô tả:
* Sau khi đăng nhập, Crawl toàn bộ dữ liệu (role sinh viên và giảng viên) từ https://qldt.ptit.edu.vn/ 
* Dữ liệu crawl được thu thập và xử lý
* Tạo một menu thao tác với dữ liệu đã qua xử lý

## Công nghệ lựa chọn:
* Puppeteer - Node.js

## Tiến độ:
* Tuần 1 (2/10): Crawl static page
* Tuần 2 (9/10): Crawl dynamic page
* Tuần 3 (16/10): Optimize crawl module, add app cli

## Chạy ứng dụng:
* Cài Node environtment
* Cài node_module: npm i
* Tạo biến môi trường lưu tài khoản mật khẩu: 
** Đặt trong file .env
** Dạng dữ liệu: QLDT_USERNAME="MSV", QLDT_PASSWORD="password"
* Chạy ứng dụng: node index.js