const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Créer un admin
router.post('/', adminController.createAdmin);

// Obtenir un admin par email
router.get('/:email', adminController.getAdminByEmail);

module.exports = router;
