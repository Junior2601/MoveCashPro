const db = require('../config/db');

// créer un nouvel agent
const createAgent = async ({ name, email, passwordHash, phone, countryId }) => {
  const result = await db.query(
    `INSERT INTO agents (name, email, password_hash, phone, country_id) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, email, passwordHash, phone, countryId]
  );
  return result.rows[0];
};

// obtenir un agent par email
const getAgentByEmail = async (email) => {
  const result = await db.query(
    `SELECT * FROM agents WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};

// voir le portefeuille d'un agent
const getAgentBalances = async (agentId) => {
  const result = await db.query(
    `SELECT ab.*, c.code as currency_code
     FROM agent_balances ab
     JOIN currencies c ON ab.currency_id = c.id
     WHERE agent_id = $1`,
    [agentId]
  );
  return result.rows;
};

// mettre à jour la balance d'un agent
const updateAgentBalance = async ({ agentId, currencyId, newBalance }) => {
  const result = await db.query(
    `UPDATE agent_balances SET balance = $1, updated_at = NOW()
     WHERE agent_id = $2 AND currency_id = $3
     RETURNING *`,
    [newBalance, agentId, currencyId]
  );
  return result.rows[0];
};

// ajouter à la balance d'un agent
const insertAgentBalance = async ({ agentId, currencyId, balance }) => {
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
  createAgent,
  getAgentByEmail,
  getAgentBalances,
  updateAgentBalance,
  insertAgentBalance,
};
