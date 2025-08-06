const pool = require('../db');
const { generateTrackingCode } = require('../utils/trackingCode');
const agentGainModel = require('../models/agentGainModel');
const agentBalanceModel = require('../models/agentBalanceModel');
const transactionHistoryModel = require('../models/transactionHistoryModel');
const redirectionModel = require('../models/redirectionModel');

const COMMISSION_RATE = 0.0075; // 0.75%

exports.createTransaction = async (req, res) => {
  const {
    sending_country_id,
    sending_phone,
    payment_method,
    receiving_country_id,
    receiving_phone,
    amount_send
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Générer code de suivi
    let tracking_code = generateTrackingCode();

    // Optionnel : vérifier unicité du code en DB (boucle tant que existe)...

    // 2. Calcul du montant reçu et devise
    // On récupère le taux et la devise de réception
    const rateResult = await client.query(
      `SELECT rate, receiving_currency_id FROM rates 
       WHERE sending_country_id=$1 AND receiving_country_id=$2 ORDER BY created_at DESC LIMIT 1`,
      [sending_country_id, receiving_country_id]
    );
    if (rateResult.rows.length === 0) {
      throw new Error('Taux de change non trouvé.');
    }
    const { rate, receiving_currency_id } = rateResult.rows[0];
    const amount_received = amount_send * rate;

    // 3. Choisir un agent disponible (premier agent avec fonds suffisants)
    const agentResult = await client.query(
      `SELECT a.agent_id FROM agents a 
       JOIN agent_balances b ON a.agent_id = b.agent_id
       WHERE b.balance >= $1 
         AND b.currency_id = $2
       LIMIT 1`,
      [amount_send, sending_country_id] // En supposant currency_id = sending_country_id ici
    );
    if (agentResult.rows.length === 0) {
      throw new Error('Aucun agent avec fonds suffisants.');
    }
    const agent_id = agentResult.rows[0].agent_id;

    // 4. Insérer la transaction
    const insertTxQuery = `
      INSERT INTO transactions 
      (sending_country_id, sending_phone, payment_method, receiving_country_id, receiving_phone, amount_send, amount_received, receiving_currency_id, status, agent_id, tracking_code, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9,$10, NOW())
      RETURNING transaction_id
    `;
    const txResult = await client.query(insertTxQuery, [
      sending_country_id,
      sending_phone,
      payment_method,
      receiving_country_id,
      receiving_phone,
      amount_send,
      amount_received,
      receiving_currency_id,
      agent_id,
      tracking_code
    ]);
    const transaction_id = txResult.rows[0].transaction_id;

    // 5. Historique initial de la transaction
    await transactionHistoryModel.logTransactionHistory({
      transactionId: transaction_id,
      previousStatus: null,
      newStatus: 'pending',
      changedBy: null,
      changedByType: null,
      client
    });

    // 6. Calcul du gain agent (commission sur montant reçu)
    const gain_amount = Math.round(amount_received * COMMISSION_RATE);

    // 7. Enregistrer gain
    await agentGainModel.insertAgentGain({
      agentId: agent_id,
      transactionId: transaction_id,
      gainAmount: gain_amount,
      currencyId: receiving_currency_id,
      client
    });

    // 8. Mettre à jour la balance de l’agent (déduire le montant envoyé)
    const updateBalanceQuery = `
      UPDATE agent_balances
      SET balance = balance - $1
      WHERE agent_id = $2 AND currency_id = $3
    `;
    await client.query(updateBalanceQuery, [amount_send, agent_id, sending_country_id]);

    await client.query('COMMIT');

    // 9. Retour réponse
    res.json({
      transaction_id,
      tracking_code,
      agent_id,
      amount_received,
      gain_amount,
      status: 'pending'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || 'Erreur serveur.' });
  } finally {
    client.release();
  }
};
