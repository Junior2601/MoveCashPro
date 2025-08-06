const db = require('../config/db');

// Fonction de base
const logTransactionHistory = async ({
  transactionId,
  action,
  oldValue,
  newValue,
  performedByAdminId = null,
  performedByAgentId = null,
}) => {
  const result = await db.query(
    `INSERT INTO transaction_history (
      transaction_id,
      action,
      old_value,
      new_value,
      performed_by_admin_id,
      performed_by_agent_id
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      transactionId,
      action,
      oldValue,
      newValue,
      performedByAdminId,
      performedByAgentId,
    ]
  );
  return result.rows[0];
};

// Journaliser une action faite par un admin
const logByAdmin = async ({ transactionId, action, oldValue, newValue, adminId }) => {
  return await logTransactionHistory({
    transactionId,
    action,
    oldValue,
    newValue,
    performedByAdminId: adminId,
  });
};

// Journaliser une action faite par un agent
const logByAgent = async ({ transactionId, action, oldValue, newValue, agentId }) => {
  return await logTransactionHistory({
    transactionId,
    action,
    oldValue,
    newValue,
    performedByAgentId: agentId,
  });
};

// Obtenir l'historique d'une transaction
const getTransactionHistory = async (transactionId) => {
  const result = await db.query(
    `SELECT * FROM transaction_history
     WHERE transaction_id = $1
     ORDER BY created_at DESC`,
    [transactionId]
  );
  return result.rows;
};

module.exports = {
  logTransactionHistory,
  logByAdmin,
  logByAgent,
  getTransactionHistory,
};
