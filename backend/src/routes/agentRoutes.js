const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

// Créer un agent
router.post('/', agentController.createAgent);

// Récupérer un agent par email
router.get('/by-email/:email', agentController.getAgentByEmail);

// Récupérer les balances d’un agent
router.get('/:agentId/balances', agentController.getAgentBalances);

// Mettre à jour une balance
router.put('/balance', agentController.updateAgentBalance);

// Ajouter une nouvelle balance ou la mettre à jour
router.post('/balance', agentController.insertAgentBalance);

module.exports = router;
