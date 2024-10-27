const express = require('express');
const router = express.Router();
const lichThiController = require('../controllers/lichThiController');

// Sử dụng router.get để định nghĩa route
router.get('/', async (req, res, next) => {
  try {
    await lichThiController.handleLogic(req, res, next);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 
