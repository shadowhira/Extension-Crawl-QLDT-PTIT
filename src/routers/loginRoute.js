const express = require('express');
const router = express.Router();
const {loginController } = require('../controllers/loginController');

// Sử dụng router.get để định nghĩa route
router.post('/', loginController);

module.exports = router; 


