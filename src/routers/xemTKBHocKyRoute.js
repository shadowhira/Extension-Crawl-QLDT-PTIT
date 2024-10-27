const express = require('express');
const router = express.Router();
const xemTKBHocKyController = require('../controllers/xemTKBHocKyController');

// Sử dụng router.get để định nghĩa route
router.get('/', xemTKBHocKyController.crawlData);

module.exports = router; 
