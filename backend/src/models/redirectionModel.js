const pool = require('../config/db');

// ===================================================================
// MÉTHODES DE BASE (existantes améliorées)
// ===================================================================

// Créer une redirection
const createRedirection = async (data) => {
    const { transaction_id, from_agent_id, to_agent_id, redirected_amount, reason } = data;
    
    try {
        const result = await pool.query(
            `INSERT INTO redirections (transaction_id, from_agent_id, to_agent_id, redirected_amount, reason)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [transaction_id, from_agent_id, to_agent_id, redirected_amount, reason]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error(`Erreur lors de la création de la redirection: ${error.message}`);
    }
};

// Mettre à jour le statut d'une redirection (version agent)
const updateRedirectionStatus = async (id, status, agentId = null) => {
    try {
        const result = await pool.query(
            `UPDATE redirections 
             SET status = $1, processed_at = CURRENT_TIMESTAMP
             WHERE id = $2 RETURNING *`,
            [status, id]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    }
};

// ===================================================================
// NOUVELLES MÉTHODES POUR AGENTS
// ===================================================================

// Obtenir les redirections ENVOYÉES par un agent
const getRedirectionsByFromAgent = async (agentId) => {
    try {
        const result = await pool.query(
            `SELECT r.*, 
                    a_to.name as to_agent_name,
                    a_to.email as to_agent_email,
                    t.tracking_code as transaction_code
             FROM redirections r
             LEFT JOIN agents a_to ON r.to_agent_id = a_to.id
             LEFT JOIN transactions t ON r.transaction_id = t.id
             WHERE r.from_agent_id = $1 
             ORDER BY r.created_at DESC`,
            [agentId]
        );
        return result.rows;
    } catch (error) {
        throw new Error(`Erreur lors de la récupération des redirections envoyées: ${error.message}`);
    }
};

// Obtenir les redirections REÇUES par un agent
const getRedirectionsByToAgent = async (agentId) => {
    try {
        const result = await pool.query(
            `SELECT r.*, 
                    a_from.name as from_agent_name,
                    a_from.email as from_agent_email,
                    t.tracking_code as transaction_code
             FROM redirections r
             LEFT JOIN agents a_from ON r.from_agent_id = a_from.id
             LEFT JOIN transactions t ON r.transaction_id = t.id
             WHERE r.to_agent_id = $1 
             ORDER BY r.created_at DESC`,
            [agentId]
        );
        return result.rows;
    } catch (error) {
        throw new Error(`Erreur lors de la récupération des redirections reçues: ${error.message}`);
    }
};

// Obtenir une redirection par ID (simple)
const getRedirectionById = async (id) => {
    try {
        const result = await pool.query(
            `SELECT * FROM redirections WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error(`Erreur lors de la récupération de la redirection: ${error.message}`);
    }
};

// ===================================================================
// NOUVELLES MÉTHODES POUR ADMIN
// ===================================================================

// Admin: Obtenir toutes les redirections avec pagination et filtres
const getAllRedirections = async (options = {}) => {
    const { page = 1, limit = 20, filters = {} } = options;
    const offset = (page - 1) * limit;
    
    try {
        // Construction dynamique de la requête avec filtres
        let whereClause = 'WHERE 1=1';
        let queryParams = [];
        let paramIndex = 1;

        if (filters.status) {
            whereClause += ` AND r.status = $${paramIndex}`;
            queryParams.push(filters.status);
            paramIndex++;
        }

        if (filters.from_agent_id) {
            whereClause += ` AND r.from_agent_id = $${paramIndex}`;
            queryParams.push(filters.from_agent_id);
            paramIndex++;
        }

        if (filters.to_agent_id) {
            whereClause += ` AND r.to_agent_id = $${paramIndex}`;
            queryParams.push(filters.to_agent_id);
            paramIndex++;
        }

        // Requête principale avec pagination
        const query = `
            SELECT r.*, 
                   a_from.name as from_agent_name,
                   a_from.email as from_agent_email,
                   a_to.name as to_agent_name,
                   a_to.email as to_agent_email,
                   t.tracking_code as transaction_code,
                   t.send_amount,
                   t.receive_amount
            FROM redirections r
            LEFT JOIN agents a_from ON r.from_agent_id = a_from.id
            LEFT JOIN agents a_to ON r.to_agent_id = a_to.id
            LEFT JOIN transactions t ON r.transaction_id = t.id
            ${whereClause}
            ORDER BY r.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        queryParams.push(limit, offset);

        // Requête pour le total
        const countQuery = `
            SELECT COUNT(*) as total
            FROM redirections r
            ${whereClause}
        `;

        const [dataResult, countResult] = await Promise.all([
            pool.query(query, queryParams),
            pool.query(countQuery, queryParams.slice(0, -2)) // Enlever limit et offset pour le count
        ]);

        return {
            data: dataResult.rows,
            total: parseInt(countResult.rows[0].total),
            page,
            limit,
            totalPages: Math.ceil(countResult.rows[0].total / limit)
        };
    } catch (error) {
        throw new Error(`Erreur lors de la récupération des redirections: ${error.message}`);
    }
};

// Admin: Obtenir les statistiques des redirections
const getRedirectionStats = async () => {
    try {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as total_redirections,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_count,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count,
                COALESCE(SUM(redirected_amount), 0) as total_redirected_amount,
                COALESCE(AVG(redirected_amount), 0) as avg_redirected_amount
            FROM redirections
        `);
        
        return result.rows[0];
    } catch (error) {
        throw new Error(`Erreur lors du calcul des statistiques: ${error.message}`);
    }
};

// Admin: Mise à jour forcée du statut avec raison admin
const forceUpdateRedirectionStatus = async (id, status, adminId, adminReason = null) => {
    try {
        const result = await pool.query(
            `UPDATE redirections 
             SET status = $1, 
                 processed_at = CURRENT_TIMESTAMP
             WHERE id = $2 RETURNING *`,
            [status, id]
        );

        // Log de l'action admin si nécessaire
        if (adminReason) {
            await pool.query(
                `INSERT INTO history (action_type, actor_type, actor_id, entity_type, entity_id, description, metadata)
                 VALUES ('redirection_force_update', 'admin', $1, 'redirection', $2, $3, $4)`,
                [adminId, id, `Admin force update status to ${status}`, JSON.stringify({ reason: adminReason })]
            );
        }

        return result.rows[0];
    } catch (error) {
        throw new Error(`Erreur lors de la mise à jour forcée: ${error.message}`);
    }
};

// ===================================================================
// MÉTHODES DÉTAILLÉES POUR CONSULTATION
// ===================================================================

// Obtenir une redirection avec tous les détails (pour consultation)
const getRedirectionDetailsById = async (id) => {
    try {
        const result = await pool.query(`
            SELECT r.*, 
                   a_from.name as from_agent_name,
                   a_from.email as from_agent_email,
                   a_to.name as to_agent_name,
                   a_to.email as to_agent_email,
                   t.tracking_code as transaction_code,
                   t.send_amount,
                   t.receive_amount,
                   t.status as transaction_status,
                   cf.name as from_country,
                   ct.name as to_country
            FROM redirections r
            LEFT JOIN agents a_from ON r.from_agent_id = a_from.id
            LEFT JOIN agents a_to ON r.to_agent_id = a_to.id
            LEFT JOIN transactions t ON r.transaction_id = t.id
            LEFT JOIN countries cf ON t.from_country_id = cf.id
            LEFT JOIN countries ct ON t.to_country_id = ct.id
            WHERE r.id = $1
        `, [id]);
        
        return result.rows[0];
    } catch (error) {
        throw new Error(`Erreur lors de la récupération des détails: ${error.message}`);
    }
};

// ===================================================================
// MÉTHODES UTILITAIRES
// ===================================================================

// Vérifier si un agent peut accepter une redirection (fonds suffisants)
const canAgentAcceptRedirection = async (agentId, redirectionId) => {
    try {
        const result = await pool.query(`
            SELECT r.redirected_amount,
                   c.id as currency_id,
                   COALESCE(b.amount, 0) as agent_balance
            FROM redirections r
            JOIN transactions t ON r.transaction_id = t.id
            JOIN countries ct ON t.to_country_id = ct.id
            JOIN currencies c ON ct.currency_id = c.id
            LEFT JOIN balances b ON r.to_agent_id = b.agent_id AND c.id = b.currency_id
            WHERE r.id = $1 AND r.to_agent_id = $2
        `, [redirectionId, agentId]);

        if (result.rows.length === 0) {
            return { canAccept: false, reason: 'Redirection introuvable' };
        }

        const { redirected_amount, agent_balance } = result.rows[0];
        const canAccept = parseFloat(agent_balance) >= parseFloat(redirected_amount);

        return {
            canAccept,
            reason: canAccept ? null : 'Fonds insuffisants',
            required: redirected_amount,
            available: agent_balance
        };
    } catch (error) {
        throw new Error(`Erreur lors de la vérification des fonds: ${error.message}`);
    }
};

// ===================================================================
// EXPORTS
// ===================================================================

module.exports = {
    // Méthodes de base
    createRedirection,
    updateRedirectionStatus,
    
    //méthodes pour agents
    getRedirectionsByFromAgent,
    getRedirectionsByToAgent,
    getRedirectionById,
    
    //méthodes pour admin
    getAllRedirections,
    getRedirectionStats,
    forceUpdateRedirectionStatus,
    
    // Méthodes détaillées
    getRedirectionDetailsById,
    
    // Utilitaires
    canAgentAcceptRedirection
};