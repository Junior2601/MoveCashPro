const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');
const adminAuthMiddleware = require('../middlewares/authMiddleware');

router.post('/', adminAuthMiddleware, countryController.createCountry);

module.exports = router;
