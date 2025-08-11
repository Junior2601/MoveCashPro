const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const adminAuthMiddleware = require('../middlewares/authMiddleware');

router.post('/', adminAuthMiddleware, paymentMethodController.createPaymentMethod);

module.exports = router;
