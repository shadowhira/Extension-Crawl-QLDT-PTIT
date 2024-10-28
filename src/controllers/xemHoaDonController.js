const {crawlXemHoaDon} = require('../services/hoaDonService'); // Đảm bảo bạn đã xuất hàm crawl từ file crawlXemHocPhi.js

// Controller để crawl dữ liệu học phí
const xemHoaDonController = {
  async crawlData(req, res) {
    const { username, password } = req.body; // Nhận username và password từ body request

    if (!username || !password) {
      return res.status(400).json({ message: "Thiếu tài khoản hoặc mật khẩu" });
    }
    try {
      const crawlData = await crawlXemHoaDon(username, password);
      if (crawlData) {
        console.log("Crawl dữ liệu thành công!");
        res.status(200).json({ message: "Crawl dữ liệu thành công!", data: crawlData });
      } else {
        console.log("Crawl dữ liệu không thành công.");
        res.status(500).json({ message: "Crawl dữ liệu không thành công!" });
      }
    } catch (error) {
      console.error("Có lỗi xảy ra khi crawl dữ liệu:", error);
      res.status(500).json({ message: "Crawl dữ liệu không thành công!", error: error.message });
    }
  }
};

module.exports = xemHoaDonController;
