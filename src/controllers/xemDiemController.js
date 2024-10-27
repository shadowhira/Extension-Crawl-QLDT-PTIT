const {crawlDiem} = require('../services/diemService'); 
const fs = require('fs');
const path = require('path');

const xemDiemController = {
  async crawlData(req, res) {
    const { username, password } = req.body; // Nhận username và password từ body request

    if (!username || !password) {
      return res.status(400).json({ message: "Thiếu tài khoản hoặc mật khẩu" });
    }

    try {
      const browser = await crawlDiem(username, password);
      console.log("Crawl dữ liệu thành công!");
      // res.status(200).json({ message: "Crawl dữ liệu thành công!", data: browser});
      const filePath = path.join('dataCrawl', 'grades.json');

    // Đọc dữ liệu từ file grades.json
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err); // In lỗi ra console
          return res.status(500).json({ error: 'Có lỗi khi đọc file dữ liệu' });
      }

          // Phân tích dữ liệu JSON và trả về
          try {
              const gradesData = JSON.parse(data);
              res.json(gradesData);
          } catch (parseError) {
              res.status(500).json({ error: 'Có lỗi khi phân tích dữ liệu JSON' });
          }
      });
    } catch (error) {
      console.error("Có lỗi xảy ra khi crawl dữ liệu:", error);
      res.status(500).json({ message: "Crawl dữ liệu không thành công!", error: error.message });
    }
  }
};

module.exports = xemDiemController;