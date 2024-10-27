const express = require('express');
const router = express.Router();
const xemMonTienQuyetController = require('../controllers/xemMonTienQuyetController');

// Sử dụng router.get để định nghĩa route
router.get('/', xemMonTienQuyetController.crawlData);

module.exports = router; 
