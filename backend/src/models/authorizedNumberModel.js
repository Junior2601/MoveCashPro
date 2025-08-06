const db = require('../config/db');

// Créer un numéro autorisé
const createAuthorizedNumber = async ({ number, countryId, agentId }) => {
  const result = await db.query(
    `INSERT INTO authorized_numbers (number, country_id, agent_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [number, countryId, agentId]
  );
  return result.rows[0];
};

// Obtenir un numéro autorisé pour un pays
const getAuthorizedNumberByCountry = async (countryId) => {
  const result = await db.query(
    `SELECT an.*, a.name AS agent_name, a.phone AS agent_phone
     FROM authorized_numbers an
     JOIN agents a ON an.agent_id = a.id
     WHERE an.country_id = $1
     LIMIT 1`,
    [countryId]
  );
  return result.rows[0];
};

// Modifier un numéro autorisé
const updateAuthorizedNumber = async ({ id, number, agentId }) => {
  const result = await db.query(
    `UPDATE authorized_numbers
     SET number = $1, agent_id = $2
     WHERE id = $3
     RETURNING *`,
    [number, agentId, id]
  );
  return result.rows[0];
};

// Supprimer un numéro autorisé
const deleteAuthorizedNumber = async (id) => {
  const result = await db.query(
    `DELETE FROM authorized_numbers WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  getAuthorizedNumberByCountry,
  createAuthorizedNumber,
  updateAuthorizedNumber,
  deleteAuthorizedNumber,
};
