const pool = require('../config/db');
const GainsModel = {
  // Créer un gain lié à une transaction validée
  async createGain({ transaction_id, agent_id, currency_id, gain_amount, commission_percent_applied }) {
    const query = `
      INSERT INTO gains (transaction_id, agent_id, currency_id, gain_amount, commission_percent_applied)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [transaction_id, agent_id, currency_id, gain_amount, commission_percent_applied];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Récupérer les gains d’un agent
  async getGainsByAgent(agent_id) {
    const query = `SELECT * FROM gains WHERE agent_id = $1 ORDER BY created_at DESC`;
    const { rows } = await pool.query(query, [agent_id]);
    return rows;
  },

  // Récupérer gain par transaction
  async getGainByTransaction(transaction_id) {
    const query = `SELECT * FROM gains WHERE transaction_id = $1`;
    const { rows } = await pool.query(query, [transaction_id]);
    return rows[0];
  }
};

module.exports = GainsModel;
