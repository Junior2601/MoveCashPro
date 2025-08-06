const db = require('../config/db');

// Vérifier si une devise existe déjà par code
const currencyExists = async (code) => {
  const result = await db.query(`SELECT id FROM currencies WHERE code = $1`, [code]);
  return result.rows.length > 0;
};

// Créer une nouvelle devise (avec vérification d’unicité du code)
const createCurrency = async (code, name, symbol) => {
  const exists = await currencyExists(code);
  if (exists) {
    throw new Error(`La devise avec le code '${code}' existe déjà.`);
  }

  const result = await db.query(
    `INSERT INTO currencies (code, name, symbol)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [code, name, symbol]
  );
  return result.rows[0];
};

// Obtenir une devise par ID
const getCurrencyById = async (id) => {
  const result = await db.query(`SELECT * FROM currencies WHERE id = $1`, [id]);
  return result.rows[0];
};

// Obtenir toutes les devises
const getAllCurrencies = async () => {
  const result = await db.query(`SELECT * FROM currencies ORDER BY code`);
  return result.rows;
};

// Supprimer une devise par ID
const deleteCurrencyById = async (id) => {
  const result = await db.query(
    `DELETE FROM currencies WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  currencyExists, // utile aussi côté contrôleur si tu veux afficher un message
  createCurrency,
  getCurrencyById,
  getAllCurrencies,
  deleteCurrencyById,
};
