const pool = require('../config/db');

const findAdminByEmail = async (email) => {
  const res = await pool.query('SELECT * FROM admins WHERE email = $1 LIMIT 1', [email]);
  return res.rows[0];
};

const createAdmin = async ({ email, password, name }) => {
  const res = await pool.query(
    `INSERT INTO admins (email, password, name) 
     VALUES ($1, $2, $3) 
     RETURNING id, email, name, created_at`,
    [email, password, name]
  );
  return res.rows[0];
};

module.exports = {
  findAdminByEmail,
  createAdmin,
};
