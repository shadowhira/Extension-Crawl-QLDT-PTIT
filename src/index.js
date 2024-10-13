const crawlHoaDon = require("./modules/crawlHoaDon");
const crawlCTDT = require("./modules/crawlCTDT");
const crawlMTQuyet = require("./modules/crawlMTQuyet");
const crawlTKB = require("./modules/crawlTKB");
const crawlAllCTDT = require("./modules/crawlAllCTDT");

(async () => {
  try {
    await crawlTKB();
    await crawlHoaDon();
    await crawlMTQuyet();
    await crawlCTDT();
    await crawlAllCTDT();
  } catch (error) {
    console.error("Có lỗi xảy ra:", error);
  }
})();
