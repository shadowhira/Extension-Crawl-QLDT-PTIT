const express = require('express');
const hocPhiController = require('../controllers/hocPhiController');

const router = express.Router();

// Định nghĩa route để crawl dữ liệu
router.post('/', hocPhiController.crawlData);

module.exports = router;
