const db = require('../config/db');

const insertAgentGain = async ({
  agentId,
  transactionId,
  gainAmount,
  currencyId,
}) => {
  const result = await db.query(
    `INSERT INTO agent_gains (agent_id, transaction_id, gain_amount, currency_id,  created_at)
     VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
    [agentId, transactionId, gainAmount, currencyId]
  );
  return result.rows[0];
};

const getGainsByAgent = async (agentId) => {
  const result = await db.query(
    `SELECT ag.*, t.tracking_code, c.code AS currency_code
     FROM agent_gains ag
     JOIN transactions t ON ag.transaction_id = t.id
     JOIN currencies c ON ag.currency_id = c.id
     WHERE ag.agent_id = $1
     ORDER BY ag.created_at DESC`,
    [agentId]
  );
  return result.rows;
};

module.exports = {
  insertAgentGain,
  getGainsByAgent,
};
