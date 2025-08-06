const express = require('express');
const router = express.Router();
const transactionStatusController = require('../controllers/transactionStatusController');

router.put('/:transaction_id/status', transactionStatusController.updateTransactionStatus);

module.exports = router;

