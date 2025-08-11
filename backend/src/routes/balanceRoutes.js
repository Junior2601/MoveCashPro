const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const adminAuthMiddleware = require('../middlewares/authMiddleware');

router.post('/', adminAuthMiddleware, balanceController.createBalance);

module.exports = router;
