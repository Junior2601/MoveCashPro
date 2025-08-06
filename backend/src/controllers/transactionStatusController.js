const pool = require('../db');
const transactionHistoryModel = require('../models/transactionHistoryModel');

exports.updateTransactionStatus = async (req, res) => {
  const { transaction_id } = req.params;
  const { newStatus, changedById, changedByType } = req.body;

  // Vérification des champs requis
  if (!newStatus || !changedById || !changedByType) {
    return res.status(400).json({ error: 'Champs requis : newStatus, changedById, changedByType' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Récupération de la transaction actuelle
    const txResult = await client.query(
      `SELECT status FROM transactions WHERE id = $1`,
      [transaction_id]
    );

    if (txResult.rows.length === 0) {
      throw new Error('Transaction introuvable.');
    }

    const previousStatus = txResult.rows[0].status;

    // Mise à jour du statut
    const updateResult = await client.query(
      `UPDATE transactions 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [newStatus, transaction_id]
    );

    // Journalisation de l’historique
    await transactionHistoryModel.logTransactionHistory({
      transactionId: transaction_id,
      previousStatus,
      newStatus,
      changedBy: changedById,
      changedByType,
      client
    });

    await client.query('COMMIT');
    res.status(200).json({
      message: 'Statut mis à jour avec succès.',
      transaction: updateResult.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de la mise à jour du statut :', err);
    res.status(500).json({ error: err.message || 'Erreur serveur' });
  } finally {
    client.release();
  }
};
