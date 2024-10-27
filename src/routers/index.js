const express = require("express");
const router = express.Router();

router.use("/lich-thi", require("./lichThiRoute"))
router.use("/xem-diem", require("./xemDiemRoute"))
router.use("/hoc-phi", require("./hocPhiRoute"))
router.use("/tkb-tuan", require("./xemTKBTuanRoute"))
router.use("/tkb-hoc-ky", require("./xemTKBHocKyRoute"))
router.use("/hoa-don", require("./xemHoaDonRoute"))
router.use("/mon-tien-quyet", require("./xemMonTienQuyetRoute"))
module.exports = router;