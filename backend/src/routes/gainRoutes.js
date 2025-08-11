const express = require('express');
const router = express.Router();
const GainsController = require('../controllers/gainController');
const authenticateAgent = require('../middlewares/agentAuthMiddleware'); // Middleware d’authentification agent
const authenticateAdminOrAgent = require('../middlewares/authenticateAdminOrAgent');

// Créer un gain (ex: appelé après validation transaction)
router.post('/', authenticateAgent, GainsController.createGain);

// Récupérer les gains d’un agent
router.get('/agent/:agentId', authenticateAdminOrAgent, GainsController.getGainsByAgent);

module.exports = router;
