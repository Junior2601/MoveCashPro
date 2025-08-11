const express = require('express');
const router = express.Router();
const rateController = require('../controllers/rateController');
const adminAuthMiddleware = require('../middlewares/authMiddleware');

router.post('/', adminAuthMiddleware, rateController.createRate);

module.exports = router;
