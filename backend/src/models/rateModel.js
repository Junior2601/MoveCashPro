const db = require('../config/db');

// Vérifie si un taux existe déjà pour une paire donnée
const rateExists = async (fromCurrencyId, toCurrencyId) => {
  const result = await db.query(
    `SELECT id FROM rates WHERE from_currency_id = $1 AND to_currency_id = $2`,
    [fromCurrencyId, toCurrencyId]
  );
  return result.rows.length > 0;
};

// Obtenir un taux
const getRate = async ({ fromCurrencyId, toCurrencyId }) => {
  const result = await db.query(
    `SELECT * FROM rates 
     WHERE from_currency_id = $1 AND to_currency_id = $2`,
    [fromCurrencyId, toCurrencyId]
  );
  return result.rows[0];
};

// Créer un nouveau taux (avec vérification)
const createRate = async ({ fromCurrencyId, toCurrencyId, rate, commissionPercent = 0.75 }) => {
  const exists = await rateExists(fromCurrencyId, toCurrencyId);
  if (exists) {
    throw new Error(`Un taux existe déjà pour la paire de devises (${fromCurrencyId} → ${toCurrencyId}).`);
  }

  const result = await db.query(
    `INSERT INTO rates (from_currency_id, to_currency_id, rate, commission_percent)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [fromCurrencyId, toCurrencyId, rate, commissionPercent]
  );
  return result.rows[0];
};

// Mettre à jour un taux
const updateRate = async ({ id, rate, commissionPercent }) => {
  const result = await db.query(
    `UPDATE rates
     SET rate = $1, commission_percent = $2
     WHERE id = $3
     RETURNING *`,
    [rate, commissionPercent, id]
  );
  return result.rows[0];
};

// Supprimer un taux
const deleteRate = async (id) => {
  const result = await db.query(
    `DELETE FROM rates WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  getRate,
  createRate,
  updateRate,
  deleteRate,
  rateExists, // utile si tu veux faire une vérification dans une route
};
