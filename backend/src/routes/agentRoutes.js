const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const adminAuthMiddleware = require('../middlewares/authMiddleware');

// Créer un nouvel agent (authentification admin requise)
router.post('/', adminAuthMiddleware, agentController.createAgent);
router.post('/login', agentController.loginAgent);

module.exports = router;
