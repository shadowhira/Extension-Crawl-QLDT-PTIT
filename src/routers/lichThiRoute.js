const express = require('express');
const lichThiController = require('../controllers/lichThiController');

const router = express.Router();

// Định nghĩa route để crawl dữ liệu
router.get('/', lichThiController.crawlData);

module.exports = router;
