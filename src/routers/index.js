const express = require("express");
const router = express.Router();

router.use("/lich-thi", require("./lichThiRoute"))
router.use("/xem-diem", require("./xemDiemRoute"))

module.exports = router;