const db = require('../config/db');

const createBalance = async ({ agent_id, currency_id, amount }) => {
  const result = await db.query(
    `INSERT INTO balances (
      agent_id,
      currency_id,
      amount
    )
    VALUES ($1, $2, $3)
    RETURNING *`,
    [agent_id, currency_id, amount || 0]
  );
  return result.rows[0];
};

module.exports = {
  createBalance
};
