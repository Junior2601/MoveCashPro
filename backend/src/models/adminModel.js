const db = require('../config/db');

// créer un admin
const createAdmin = async ({ name, email, passwordHash }) => {
  const result = await db.query(
    `INSERT INTO admins (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *`,
    [name, email, passwordHash]
  );
  return result.rows[0];
};

// obtenir un admin
const getAdminByEmail = async (email) => {
  const result = await db.query(
    `SELECT * FROM admins WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};

module.exports = {
  createAdmin,
  getAdminByEmail,
};
