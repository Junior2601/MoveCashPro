const express = require('express');
const router = express.Router();
const agentGainController = require('../controllers/agentGainController');

// POST : Ajouter un gain
router.post('/', agentGainController.insertAgentGain);

// GET : Récupérer les gains d’un agent
router.get('/:agentId', agentGainController.getGainsByAgent);

module.exports = router;
