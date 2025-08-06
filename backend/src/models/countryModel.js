const db = require('../config/db');

// Créer un nouveau pays
const createCountry = async (name, code, phone_prefix) => {
  const result = await db.query(
    `INSERT INTO countries (name, code, phone_prefix)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, code, phone_prefix]
  );
  return result.rows[0];
};

// Obtenir tous les pays
const getAllCountries = async () => {
  const result = await db.query(`SELECT * FROM countries ORDER BY name`);
  return result.rows;
};

// Obtenir un pays par ID
const getCountryById = async (id) => {
  const result = await db.query(`SELECT * FROM countries WHERE id = $1`, [id]);
  return result.rows[0];
};

// Supprimer un pays par ID
const deleteCountryById = async (id) => {
  const result = await db.query(
    `DELETE FROM countries WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0]; // retourne l'élément supprimé
};

module.exports = {
  getAllCountries,
  getCountryById,
  createCountry,
  deleteCountryById,
};
