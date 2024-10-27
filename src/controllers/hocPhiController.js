const {crawlHocPhi} = require('../services/hocPhiService'); // Đảm bảo bạn đã xuất hàm crawl từ file crawlXemHocPhi.js

// Controller để crawl dữ liệu học phí
const hocPhiController = {
  async crawlData(req, res) {
    try {
      const browser = await crawlHocPhi(); // Chạy hàm crawlXemHocPhi
      console.log("Crawl dữ liệu thành công!");
      res.status(200).json({ message: "Crawl dữ liệu thành công!" });
    } catch (error) {
      console.error("Có lỗi xảy ra khi crawl dữ liệu:", error);
      res.status(500).json({ message: "Crawl dữ liệu không thành công!", error: error.message });
    }
  }
};

module.exports = hocPhiController;
