const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

router.get('/:tracking_code', trackingController.getTransactionByTrackingCode);

module.exports = router;
