const express = require('express');
const router = express.Router();
const xemCTDTController = require('../controllers/xemCTDTController');

// Sử dụng router.get để định nghĩa route
router.post('/', xemCTDTController.crawlData);

module.exports = router; 


