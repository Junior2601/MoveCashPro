const db = require('../config/db');
const bcrypt = require('bcrypt');

const createAgent = async ({ email, password, name, country_id }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO agents (email, password, name, country_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, country_id, created_at`,
    [email, hashedPassword, name, country_id]
  );
  return result.rows[0];
};

const findAgentByEmail = async (email) => {
  const result = await db.query(
    `SELECT * FROM agents WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};

const updateAgent = async (id, { email, password, name, country_id }) => {
  let hashedPassword = null;

  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const result = await db.query(
    `UPDATE agents
     SET email = $1,
         ${password ? 'password = $2,' : ''}
         name = $3,
         country_id = $4
     WHERE id = $5
     RETURNING id, email, name, country_id, updated_at`,
    password
      ? [email, hashedPassword, name, country_id, id]
      : [email, name, country_id, id]
  );

  return result.rows[0];
};

const deleteAgent = async (id) => {
  await db.query(`DELETE FROM agents WHERE id = $1`, [id]);
  return { message: 'Agent supprimé avec succès.' };
};

module.exports = {
  createAgent,
  findAgentByEmail,
  updateAgent,
  deleteAgent,
};
