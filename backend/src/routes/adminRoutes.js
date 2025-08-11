const express = require('express');
const router = express.Router();
const { loginAdmin, registerAdmin, test } = require('../controllers/adminController');

router.post('/login', loginAdmin);
router.post('/register', registerAdmin); // Optionnel
router.get('/test', test);

module.exports = router;
