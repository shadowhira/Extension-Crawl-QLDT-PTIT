const express = require('express');
const router = express.Router();
const xemCTDTController = require('../controllers/xemCTDTController');

// Sử dụng router.get để định nghĩa route
router.get('/', xemCTDTController.crawlData);

module.exports = router; 
