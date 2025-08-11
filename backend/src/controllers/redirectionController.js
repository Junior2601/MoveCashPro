const Redirection = require('../models/redirectionModel');

// ===================================================================
// CONTRÔLEURS AGENTS
// ===================================================================

// Créer une redirection (agent uniquement)
exports.createRedirection = async (req, res) => {
    try {
        const { transaction_id, to_agent_id, redirected_amount, reason } = req.body;
        const from_agent_id = req.user.id; // Agent connecté

        // Validation : Un agent ne peut pas se rediriger vers lui-même
        if (from_agent_id === to_agent_id) {
            return res.status(400).json({ 
                message: "Vous ne pouvez pas vous rediriger vers vous-même." 
            });
        }

        // Validation des données requises
        if (!transaction_id || !to_agent_id || !redirected_amount) {
            return res.status(400).json({ 
                message: "Les champs transaction_id, to_agent_id et redirected_amount sont obligatoires." 
            });
        }

        const redirection = await Redirection.createRedirection({
            transaction_id,
            from_agent_id,
            to_agent_id,
            redirected_amount,
            reason
        });

        res.status(201).json({
            message: "Redirection créée avec succès",
            data: redirection
        });
    } catch (error) {
        console.error('Erreur création redirection:', error);
        res.status(500).json({ 
            message: "Erreur lors de la création de la redirection", 
            error: error.message 
        });
    }
};

// Agent consulte SES PROPRES redirections
exports.getMyRedirections = async (req, res) => {
    try {
        const agentId = req.user.id;
        
        // Récupérer les redirections envoyées ET reçues par l'agent
        const [sentRedirections, receivedRedirections] = await Promise.all([
            Redirection.getRedirectionsByFromAgent(agentId),
            Redirection.getRedirectionsByToAgent(agentId)
        ]);

        res.json({
            message: "Redirections récupérées avec succès",
            data: {
                sent: sentRedirections,
                received: receivedRedirections,
                total_sent: sentRedirections.length,
                total_received: receivedRedirections.length
            }
        });
    } catch (error) {
        console.error('Erreur récupération redirections agent:', error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération de vos redirections", 
            error: error.message 
        });
    }
};

// Mettre à jour le statut d'une redirection (accepté/rejeté)
exports.updateRedirectionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        const agentId = req.user.id;

        // Validation du statut
        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ 
                message: "Statut invalide. Utilisez 'accepted' ou 'rejected'." 
            });
        }

        // Vérifier que l'agent a le droit de modifier cette redirection
        // (seulement l'agent destinataire peut accepter/rejeter)
        const redirection = await Redirection.getRedirectionById(id);
        
        if (!redirection) {
            return res.status(404).json({ 
                message: "Redirection introuvable." 
            });
        }

        if (redirection.to_agent_id !== agentId) {
            return res.status(403).json({ 
                message: "Vous ne pouvez modifier que les redirections qui vous sont destinées." 
            });
        }

        if (redirection.status !== 'pending') {
            return res.status(400).json({ 
                message: "Cette redirection a déjà été traitée." 
            });
        }

        const updated = await Redirection.updateRedirectionStatus(id, status, agentId);
        
        res.json({
            message: `Redirection ${status === 'accepted' ? 'acceptée' : 'rejetée'} avec succès`,
            data: updated
        });
    } catch (error) {
        console.error('Erreur mise à jour statut redirection:', error);
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour du statut", 
            error: error.message 
        });
    }
};

// ===================================================================
// CONTRÔLEURS ADMIN
// ===================================================================

// Admin consulte TOUTES les redirections
exports.getAllRedirections = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, from_agent_id, to_agent_id } = req.query;
        
        const filters = {};
        if (status) filters.status = status;
        if (from_agent_id) filters.from_agent_id = from_agent_id;
        if (to_agent_id) filters.to_agent_id = to_agent_id;

        const redirections = await Redirection.getAllRedirections({
            page: parseInt(page),
            limit: parseInt(limit),
            filters
        });

        const stats = await Redirection.getRedirectionStats();

        res.json({
            message: "Redirections récupérées avec succès",
            data: redirections,
            stats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: redirections.total || 0
            }
        });
    } catch (error) {
        console.error('Erreur récupération redirections admin:', error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des redirections", 
            error: error.message 
        });
    }
};

// Admin consulte les redirections d'un agent spécifique
exports.getRedirectionsByAgent = async (req, res) => {
    try {
        const { agentId } = req.params;
        const { type = 'all' } = req.query; // all, sent, received

        let redirections;

        switch (type) {
            case 'sent':
                redirections = await Redirection.getRedirectionsByFromAgent(agentId);
                break;
            case 'received':
                redirections = await Redirection.getRedirectionsByToAgent(agentId);
                break;
            default:
                const [sent, received] = await Promise.all([
                    Redirection.getRedirectionsByFromAgent(agentId),
                    Redirection.getRedirectionsByToAgent(agentId)
                ]);
                redirections = { sent, received };
        }

        res.json({
            message: "Redirections de l'agent récupérées avec succès",
            data: redirections,
            agent_id: agentId,
            type
        });
    } catch (error) {
        console.error('Erreur récupération redirections agent (admin):', error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des redirections de l'agent", 
            error: error.message 
        });
    }
};

// Admin peut forcer le statut d'une redirection (cas exceptionnels)
exports.forceRedirectionStatus = async (req, res) => {
    try {
        const { status, admin_reason } = req.body;
        const { id } = req.params;
        const adminId = req.user.id;

        // Validation du statut
        if (!["accepted", "rejected", "pending"].includes(status)) {
            return res.status(400).json({ 
                message: "Statut invalide. Utilisez 'accepted', 'rejected' ou 'pending'." 
            });
        }

        const redirection = await Redirection.getRedirectionById(id);
        
        if (!redirection) {
            return res.status(404).json({ 
                message: "Redirection introuvable." 
            });
        }

        const updated = await Redirection.forceUpdateRedirectionStatus(id, status, adminId, admin_reason);
        
        // Log de l'action admin dans l'historique
        await require('../models/historyModel').createHistoryEntry({
            action_type: 'redirection_force_update',
            actor_type: 'admin',
            actor_id: adminId,
            entity_type: 'redirection',
            entity_id: id,
            description: `Admin a forcé le statut de la redirection à '${status}'`,
            metadata: { 
                old_status: redirection.status, 
                new_status: status, 
                admin_reason 
            }
        });

        res.json({
            message: `Statut de la redirection modifié par l'admin`,
            data: updated
        });
    } catch (error) {
        console.error('Erreur force mise à jour redirection:', error);
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour forcée", 
            error: error.message 
        });
    }
};

// ===================================================================
// CONTRÔLEURS MIXTES
// ===================================================================

// Consulter une redirection par ID (agent ou admin)
exports.getRedirectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const redirection = await Redirection.getRedirectionDetailsById(id);
        
        if (!redirection) {
            return res.status(404).json({ 
                message: "Redirection introuvable." 
            });
        }

        // Vérification des droits d'accès
        if (userRole !== 'admin' && 
            redirection.from_agent_id !== userId && 
            redirection.to_agent_id !== userId) {
            return res.status(403).json({ 
                message: "Vous n'avez pas accès à cette redirection." 
            });
        }

        res.json({
            message: "Redirection récupérée avec succès",
            data: redirection
        });
    } catch (error) {
        console.error('Erreur récupération redirection par ID:', error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération de la redirection", 
            error: error.message 
        });
    }
};