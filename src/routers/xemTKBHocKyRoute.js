const express = require('express');
const router = express.Router();
const xemTKBHocKyController = require('../controllers/xemTKBHocKyController');

// Sử dụng router.get để định nghĩa route
router.post('/', xemTKBHocKyController.crawlData);

module.exports = router; 
