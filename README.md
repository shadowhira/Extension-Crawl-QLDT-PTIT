# mid-project-680372032
 
## BTL: Crawl dữ liệu từ trang QLDT PTIT

## Thành viên:
* Nguyễn Văn Thành - B21DCCN680
* Trịnh Trung Hiếu - B21DCCN372
* Vũ Thành Đạt - B21DCCN032

## Mô tả:
* Sau khi đăng nhập, Crawl toàn bộ dữ liệu (role sinh viên) từ https://qldt.ptit.edu.vn/ 
* Dữ liệu crawl được thu thập và xử lý
* Tạo một extension thao tác với dữ liệu đã qua xử lý

## Công nghệ sử dụng:
* Puppeteer - Node.js

## Tiến độ:
* Tuần 1 (2/10): Crawl các page tĩnh
* Tuần 2 (9/10): Crawl các page động, crawl được hết dữ liệu QLDT
* Tuần 3 (16/10): Tối ưu các module crawl, làm app cli để crawl
* Tuần 4 (23/10): Chuyển logic crawl sang dạng api, làm extension để crawl
* Tuần 5 (30/10): Làm giao diện extension, tích hợp api crawl vào extension

## Chạy ứng dụng:
* Clone repo: git clone https://github.com/jnp2018/mid-project-680372032.git
* Cài Node environtment
* Cài node_module: npm i
* Tạo biến môi trường lưu tài khoản mật khẩu: 
    * Đặt trong file .env
    * Dạng dữ liệu: QLDT_USERNAME="MSV", QLDT_PASSWORD="password"
* Di chuyển vào thư mục src: cd src
* Chạy ứng dụng: node crawlAllWithNode.js

## Cài làm extension:
* Vào phần cài đặt extension:
    * Chọn Load unpacked
    * Chọn thư mục extension
* Hiển thị extension và sử dụng:
    * Nhập tài khoản mật khẩu
    * Chọn các tính năng