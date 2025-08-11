const db = require('../config/db');

const createCountry = async ({ name, code, phone_prefix, currency_id }) => {
  const result = await db.query(
    `INSERT INTO countries (name, code, phone_prefix, currency_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, code, phone_prefix, currency_id]
  );
  return result.rows[0];
};

module.exports = {
  createCountry,
};
