const db = require('../config/db');

// Insérer une redirection
const insertRedirection = async ({
  transactionId,
  fromAgentId,
  toAgentId,
  partial = false,
}) => {
  const result = await db.query(
    `INSERT INTO redirections (transaction_id, from_agent_id, to_agent_id, partial)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [transactionId, fromAgentId, toAgentId, partial]
  );
  return result.rows[0];
};

// Obtenir les redirections reçues par un agent (to_agent)
const getRedirectionsByAgent = async (agentId) => {
  const result = await db.query(
    `SELECT r.*, t.tracking_code
     FROM redirections r
     JOIN transactions t ON r.transaction_id = t.id
     WHERE r.to_agent_id = $1
     ORDER BY r.redirected_at DESC`,
    [agentId]
  );
  return result.rows;
};

// Obtenir les redirections envoyées par un agent (from_agent)
const getRedirectionsFromAgent = async (agentId) => {
  const result = await db.query(
    `SELECT r.*, t.tracking_code
     FROM redirections r
     JOIN transactions t ON r.transaction_id = t.id
     WHERE r.from_agent_id = $1
     ORDER BY r.redirected_at DESC`,
    [agentId]
  );
  return result.rows;
};

module.exports = {
  insertRedirection,
  getRedirectionsByAgent,
  getRedirectionsFromAgent,
};
