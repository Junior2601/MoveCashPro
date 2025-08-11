const express = require('express');
const router = express.Router();
const redirectionController = require('../controllers/redirectionController');
const authenticateAgent = require('../middlewares/agentAuthMiddleware');
const authenticateAdmin = require('../middlewares/authMiddleware');

// ===================================================================
// ROUTES AGENTS - Gestion des redirections
// ===================================================================

// Créer une redirection (agent uniquement)
router.post('/', authenticateAgent, redirectionController.createRedirection);

// Agent consulte SES PROPRES redirections
router.get('/my-redirections', authenticateAgent, redirectionController.getMyRedirections);

// Mettre à jour le statut d'une redirection (accepté/rejeté)
router.put('/:id/status', authenticateAgent, redirectionController.updateRedirectionStatus);

// ===================================================================
// ROUTES ADMIN - Consultation et gestion globale
// ===================================================================

// Admin consulte TOUTES les redirections
router.get('/admin/all', authenticateAdmin, redirectionController.getAllRedirections);

// Admin consulte les redirections d'un agent spécifique
router.get('/admin/agent/:agentId', authenticateAdmin, redirectionController.getRedirectionsByAgent);

// Admin peut forcer le statut d'une redirection (cas exceptionnels)
router.put('/admin/:id/force-status', authenticateAdmin, redirectionController.forceRedirectionStatus);

// ===================================================================
// ROUTES MIXTES - Consultation d'une redirection spécifique
// ===================================================================

// Consulter une redirection par ID (agent ou admin)
// L'agent ne peut voir que ses redirections, l'admin peut tout voir
router.get('/:id', [authenticateAgent, authenticateAdmin], redirectionController.getRedirectionById);

module.exports = router;