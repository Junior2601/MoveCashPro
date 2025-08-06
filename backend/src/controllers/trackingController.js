const pool = require('../db');

exports.getTransactionByTrackingCode = async (req, res) => {
  const { tracking_code } = req.params;

  if (!tracking_code) {
    return res.status(400).json({ error: 'Code de suivi requis.' });
  }

  try {
    const result = await pool.query(
      `SELECT 
         t.id AS transaction_id,
         t.tracking_code,
         t.sender_phone,
         t.receiver_phone,
         t.amount_sent,
         t.amount_received,
         t.exchange_rate,
         t.status,
         t.created_at,
         sc.name AS sender_country,
         rc.name AS receiver_country,
         t.payment_method,
         t.reception_method
       FROM transactions t
       LEFT JOIN countries sc ON sc.id = t.sender_country_id
       LEFT JOIN countries rc ON rc.id = t.receiver_country_id
       WHERE t.tracking_code = $1`,
      [tracking_code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aucune transaction trouvée pour ce code.' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur tracking :', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
};
