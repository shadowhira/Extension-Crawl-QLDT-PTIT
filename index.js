const crawlHoaDon = require("./src/modules/crawlHoaDon");
const crawlCTDT = require("./src/modules/crawlCTDT");
const crawlMTQuyet = require("./src/modules/crawlMTQuyet");
const {crawlMTQuyetUpdate} = require("./src/modules/crawlMTQuyetUpdate");
const crawlTKB = require("./src/modules/crawlTKB");
const crawlAllCTDT = require("./src/modules/crawlAllCTDT");
const crawlDKMH = require("./src/modules/crawlDKMH");
const crawlXemHocPhi = require("./src/modules/crawlXemHocPhi");

(async () => {
  try {
    // await crawlTKB();
    // await crawlHoaDon();
    // await crawlMTQuyet();
    // await crawlMTQuyetUpdate();
    // await crawlDKMH();
    // await crawlCTDT();
    // await crawlAllCTDT();
    await crawlXemHocPhi();
  } catch (error) {
    console.error("Có lỗi xảy ra:", error);
  }
})();
