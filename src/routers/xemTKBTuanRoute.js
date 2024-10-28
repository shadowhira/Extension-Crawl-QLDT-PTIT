const express = require('express');
const router = express.Router();
const xemTKBTuanController = require('../controllers/xemTKBTuanController');

// Sử dụng router.get để định nghĩa route
router.post('/', xemTKBTuanController.crawlData);

module.exports = router; 
