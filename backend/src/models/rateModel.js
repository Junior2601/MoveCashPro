const db = require('../config/db');

const createRate = async ({ from_currency_id, to_currency_id, rate, commission_percent, created_by }) => {
  const result = await db.query(
    `INSERT INTO rates (
      from_currency_id, 
      to_currency_id, 
      rate, 
      commission_percent, 
      created_by
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [from_currency_id, to_currency_id, rate, commission_percent, created_by]
  );
  return result.rows[0];
};

module.exports = {
  createRate,
};
