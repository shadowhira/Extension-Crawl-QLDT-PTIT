const crawlHoaDon = require("./src/modules/crawlHoaDon");
const crawlCTDT = require("./src/modules/crawlCTDT");
const crawlMTQuyet = require("./src/modules/crawlMTQuyet");
const crawlTKB = require("./src/modules/crawlTKB");
const crawlAllCTDT = require("./src/modules/crawlAllCTDT");
const crawlDKMH = require("./src/modules/crawlDKMH");

(async () => {
  try {
    await crawlTKB();
    // await crawlHoaDon();
    // await crawlMTQuyet();
    // await crawlDKMH();
    // await crawlCTDT();
    // await crawlAllCTDT();
  } catch (error) {
    console.error("Có lỗi xảy ra:", error);
  }
})();
