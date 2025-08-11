const db = require('../config/db');

const createAuthorizedNumber = async ({ agent_id, country_id, payment_method_id, number, label }) => {
  const result = await db.query(
    `INSERT INTO authorized_numbers (
      agent_id,
      country_id,
      payment_method_id,
      number,
      label
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [agent_id, country_id, payment_method_id, number, label]
  );
  return result.rows[0];
};

module.exports = {
  createAuthorizedNumber,
};
