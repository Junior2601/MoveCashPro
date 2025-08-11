const pool = require('../config/db');
const gainModel = require('../models/gainModel');

const validateTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    // Récupérer transaction
    const { rows } = await pool.query('SELECT * FROM transactions WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }
    const transaction = rows[0];
    if (transaction.status !== 'en_attente') {
      return res.status(400).json({ message: 'Transaction déjà traitée' });
    }

    // Mettre à jour le statut de la transaction en "effectuee" et set completed_at
    await pool.query(
      `UPDATE transactions SET status = 'effectuee', completed_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [id]
    );

    // Calcul du gain de l'agent : commission appliquée en % sur send_amount
    const gain_amount = (transaction.send_amount * transaction.commission_applied) / 100;

    // Création de l'entrée gain
    await gainModel.createGain({
      transaction_id: transaction.id,
      agent_id: transaction.assigned_agent_id,
      currency_id: transaction.from_country_id, // ATTENTION : ici tu dois récupérer la devise associée au pays (voir plus bas)
      gain_amount,
      commission_percent_applied: transaction.commission_applied,
    });

    return res.json({ message: 'Transaction validée et gain enregistré' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
