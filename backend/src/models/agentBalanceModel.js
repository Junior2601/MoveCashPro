const db = require('../config/db');

// Récupère tous les soldes d’un agent
const getBalancesByAgentId = async (agentId) => {
  const result = await db.query(
    `SELECT ab.*, c.code AS currency_code
     FROM agent_balances ab
     JOIN currencies c ON ab.currency_id = c.id
     WHERE agent_id = $1`,
    [agentId]
  );
  return result.rows;
};

// Récupère un solde spécifique
const getBalance = async (agentId, currencyId) => {
  const result = await db.query(
    `SELECT * FROM agent_balances
     WHERE agent_id = $1 AND currency_id = $2`,
    [agentId, currencyId]
  );
  return result.rows[0];
};

// Crée ou met à jour un solde (balance unique par agent/devise)
const setOrUpdateBalance = async (agentId, currencyId, balance) => {
  const result = await db.query(
    `INSERT INTO agent_balances (agent_id, currency_id, balance)
     VALUES ($1, $2, $3)
     ON CONFLICT (agent_id, currency_id)
     DO UPDATE SET balance = EXCLUDED.balance, updated_at = NOW()
     RETURNING *`,
    [agentId, currencyId, balance]
  );
  return result.rows[0];
};

module.exports = {
  getBalancesByAgentId,
  getBalance,
  setOrUpdateBalance,
};
