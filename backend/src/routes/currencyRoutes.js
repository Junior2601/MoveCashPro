const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');
const adminAuthMiddleware = require('../middlewares/authMiddleware');

router.post('/', adminAuthMiddleware, currencyController.createCurrency);

module.exports = router;
