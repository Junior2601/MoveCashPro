const express = require('express');
const router = express.Router();
const agentBalanceController = require('../controllers/agentBalanceController');

// GET tous les soldes d’un agent
router.get('/:agentId', agentBalanceController.getAgentBalances);

// POST/PUT pour créer ou mettre à jour un solde
router.post('/', agentBalanceController.setOrUpdateAgentBalance);

module.exports = router;