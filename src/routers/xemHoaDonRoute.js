const express = require('express');
const router = express.Router();
const xemHoaDonController = require('../controllers/xemHoaDonController');

// Sử dụng router.get để định nghĩa route
router.post('/', xemHoaDonController.crawlData);

module.exports = router; 
