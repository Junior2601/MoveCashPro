const express = require('express');
const router = express.Router();
const authorizedNumberController = require('../controllers/authorizedNumberController');
const adminAuthMiddleware = require('../middlewares/authMiddleware');

router.post('/', adminAuthMiddleware, authorizedNumberController.createAuthorizedNumber);

module.exports = router;
