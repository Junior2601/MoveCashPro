const db = require('../config/db');

const createPaymentMethod = async ({ country_id, method }) => {
  const result = await db.query(
    `INSERT INTO payment_methods (country_id, method)
     VALUES ($1, $2) RETURNING *`,
    [country_id, method]
  );
  return result.rows[0];
};

module.exports = {
  createPaymentMethod,
};
