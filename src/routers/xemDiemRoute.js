const express = require('express');
const router = express.Router();
const xemDiemController = require('../controllers/xemDiemController');

// Sử dụng router.get để định nghĩa route
router.get('/', async (req, res, next) => {
  try {
    await xemDiemController.handleLogic(req, res, next);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 
