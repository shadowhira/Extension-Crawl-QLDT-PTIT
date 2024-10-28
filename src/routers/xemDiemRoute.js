const express = require('express');
const router = express.Router();
const xemDiemController = require('../controllers/xemDiemController');

// Sử dụng router.get để định nghĩa route
router.post('/', xemDiemController.crawlData);

module.exports = router; 
