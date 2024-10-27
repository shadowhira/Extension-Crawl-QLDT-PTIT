const express = require('express');
const router = express.Router();
const xemDiemController = require('../controllers/xemDiemController');

// Sử dụng router.get để định nghĩa route
// router.get('/', xemDiemController.crawlData);
// Sử dụng router.post để định nghĩa route và nhận username, password từ request
router.post('/', xemDiemController.crawlData);

module.exports = router; 
