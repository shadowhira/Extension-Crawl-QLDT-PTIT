const express = require('express');
const lichThiController = require('../controllers/lichThiController');

const router = express.Router();

// Định nghĩa route để crawl dữ liệu
router.post('/', lichThiController.crawlData);

module.exports = router;
